import { ScrollTrigger } from '$lib/utils/gsapSetup.js';
import { getLenis } from '$lib/stores/lenis.svelte.js';
import { navigationState } from '$lib/stores/navigationState.svelte.js';

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

	if (!navigationState.fromArchetype) return;

	// Seleziona gli elementi necessari nel DOM per orchestrare lo scorrimento
	const archetypesSection = document.getElementById('archetypes');
	const outroSection = /** @type {HTMLElement | null} */ (document.querySelector('.outro-scroll-container'));

	if (!archetypesSection || !outroSection) return;

	let rafId = 0;
	/** @type {ReturnType<typeof setTimeout> | null} */
	let scrollTimeout = null;

	// Il flag fromArchetype governa i guard di introReveal/quiz/outro: se resta sporco, l'intro
	// non riarma mai il suo lock (scroll cue che non scompare). L'onComplete dello scrollTo può
	// non arrivare mai (tocco utente che interrompe Lenis, navigazione via): il primo gesto
	// dell'utente equivale a "cinematica conclusa" e pulisce il flag comunque.
	const clearParam = () => {
		navigationState.fromArchetype = false;
		removeGestureListeners();
	};
	const gestureEvents = ['pointerdown', 'wheel', 'touchstart'];
	const addGestureListeners = () => {
		gestureEvents.forEach((ev) => window.addEventListener(ev, clearParam, { passive: true, once: true }));
	};
	const removeGestureListeners = () => {
		gestureEvents.forEach((ev) => window.removeEventListener(ev, clearParam));
	};

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
		// Su mobile #archetypes è uno scrolly pinnato di 2.5 schermate: atterrare al suo inizio
		// significherebbe attraversare tutto lo scrub per raggiungere l'outro. Si atterra invece
		// nell'ultimo tratto del pin (carosello già rivelato, timeline a riposo) e da lì lo smooth
		// scroll verso l'outro è breve e continuo.
		const mobileScrolly = window.matchMedia('(max-width: 768px)').matches
			? ScrollTrigger.getById('archetypeScrollyMobile')
			: undefined;
		/** @type {HTMLElement | number} */
		const landingTarget = mobileScrolly
			? mobileScrolly.start + (mobileScrolly.end - mobileScrolly.start) * 0.8
			: archetypesSection;
		if (lenis) lenis.scrollTo(landingTarget, { immediate: true, force: true });
		else archetypesSection.scrollIntoView({ behavior: 'instant' });

		// Commento solo il PERCHÉ: riduciamo il delay a 50ms per rendere la transizione immediata dopo il posizionamento, mantenendo una piccolissima finestra per l'assestamento del rendering
		scrollTimeout = setTimeout(() => {
			addGestureListeners();

			const l = getLenis();
			if (l) {
				l.scrollTo(outroSection, { duration: 1.8, easing: easeInOutPower2, force: true, onComplete: clearParam });
			} else {
				outroSection.scrollIntoView({ behavior: 'smooth' });
				clearParam();
			}
		}, 50);
	});

	return {
		destroy() {
			cancelAnimationFrame(rafId);
			if (scrollTimeout) clearTimeout(scrollTimeout);
			// Interrompe un eventuale scrollTo in corso fissando la posizione attuale
			const l = getLenis();
			if (l) l.scrollTo(window.scrollY, { immediate: true });
			// Navigare via a metà cinematica lascerebbe il flag sporco per la visita successiva.
			clearParam();
		}
	};
}
