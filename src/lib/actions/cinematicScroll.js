import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { getLenis } from '$lib/stores/lenis.svelte.js';

// Commento solo il PERCHÉ: replica la curva power2.inOut di GSAP come easing per lenis.scrollTo, così la
// transizione cinematica resta morbida e identica alla precedente implementazione basata su tween.
/** @param {number} t */
const easeInOutPower2 = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/**
 * Svelte Action per gestire lo scorrimento cinematico e morbido dopo la provenienza da un archetipo.
 * Evita scatti e flash visivi coordinando il posizionamento istantaneo e lo scroll morbido con Lenis.
 *
 * @param {HTMLElement} node - L'elemento a cui è applicata l'azione (il contenitore principale della pagina)
 */
export function cinematicScroll(node) {
	if (typeof window === 'undefined') return;

	const params = new URLSearchParams(window.location.search);
	if (params.get('fromArchetype') !== 'true') return;

	// Seleziona gli elementi necessari nel DOM per orchestrare lo scorrimento
	const archetypesSection = document.getElementById('archetypes');
	const outroSection = /** @type {HTMLElement | null} */ (document.querySelector('.outro-scroll-container'));

	if (!archetypesSection || !outroSection) return;

	let rafId = 0;
	/** @type {ReturnType<typeof setTimeout> | null} */
	let scrollTimeout = null;

	// requestAnimationFrame assicura che la pagina sia montata e lo scroll iniziale terminato
	rafId = requestAnimationFrame(() => {
		// Commento solo il PERCHÉ: i pin di Preface/Quiz/#archetypes creano pin-spacer che allungano il
		// documento di varie schermate. Senza refresh, l'offset di #archetypes è calcolato prima degli spacer
		// e si atterra sul preface: forziamo il ricalcolo dei trigger PRIMA di posizionare.
		ScrollTrigger.refresh();

		// 1. Posiziona istantaneamente la finestra alla sezione archetipi (force: anche se Lenis è fermo)
		const lenis = getLenis();
		// Commento solo il PERCHÉ: il ResizeObserver di Lenis è async, quindi dopo il refresh le sue dimensioni
		// interne sono ancora stale e scrollTo clamperebbe corto (atterrando sul preface): resize() sincrono le aggiorna.
		lenis?.resize();
		if (lenis) lenis.scrollTo(archetypesSection, { immediate: true, force: true });
		else archetypesSection.scrollIntoView({ behavior: 'instant' });

		// 2. Avvia lo scorrimento cinematico morbido dopo una pausa di stabilità visiva
		scrollTimeout = setTimeout(() => {
			const clearParam = () => {
				const url = new URL(window.location.href);
				url.searchParams.delete('fromArchetype');
				window.history.replaceState({}, '', url.toString());
			};

			const l = getLenis();
			if (l) {
				l.scrollTo(outroSection, { duration: 1.8, easing: easeInOutPower2, force: true, onComplete: clearParam });
			} else {
				outroSection.scrollIntoView({ behavior: 'smooth' });
				clearParam();
			}
		}, 500);
	});

	return {
		destroy() {
			cancelAnimationFrame(rafId);
			if (scrollTimeout) clearTimeout(scrollTimeout);
			// Interrompe un eventuale scrollTo in corso fissando la posizione attuale
			const l = getLenis();
			if (l) l.scrollTo(window.scrollY, { immediate: true });
		}
	};
}
