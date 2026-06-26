import { gsap } from 'gsap';

/**
 * Svelte Action per gestire lo scorrimento cinematico e morbido dopo la provenienza da un archetipo.
 * Evita scatti e flash visivi coordinando il posizionamento istantaneo e lo scroll morbido con GSAP.
 * 
 * @param {HTMLElement} node - L'elemento a cui è applicata l'azione (il contenitore principale della pagina)
 */
export function cinematicScroll(node) {
	if (typeof window === 'undefined') return;

	const params = new URLSearchParams(window.location.search);
	if (params.get('fromArchetype') !== 'true') return;

	// Seleziona gli elementi necessari nel DOM per orchestrare lo scorrimento
	const archetypesSection = document.getElementById('archetypes');
	const outroSection = document.querySelector('.outro-scroll-container');

	if (!archetypesSection || !outroSection) return;

	let rafId = 0;
	/** @type {gsap.core.Tween | null} */
	let tween = null;
	/** @type {ReturnType<typeof setTimeout> | null} */
	let scrollTimeout = null;

	// Utilizziamo requestAnimationFrame per assicurarci che la pagina sia montata e che lo scroll nativo iniziale sia terminato
	rafId = requestAnimationFrame(() => {
		// 1. Posiziona istantaneamente la finestra alla sezione archetipi
		archetypesSection.scrollIntoView({ behavior: 'instant' });

		// 2. Avvia lo scorrimento cinematico morbido dopo una pausa di 600ms
		// Aumentiamo leggermente l'attesa per dare stabilità visiva prima del movimento
		scrollTimeout = setTimeout(() => {
			const targetY = outroSection.getBoundingClientRect().top + window.scrollY;
			const scrollObj = { y: window.scrollY };

			// Commento solo il PERCHÉ: utilizziamo GSAP anziché lo scroll smooth nativo del browser poiché quest'ultimo
			// tende ad essere scattoso ed ha un'accelerazione rigida non modificabile, mentre una curva 'power2.inOut'
			// garantisce una transizione morbida, graduale e senza interruzioni visive.
			tween = gsap.to(scrollObj, {
				y: targetY,
				duration: 1.8, // Esteso a 2.2 secondi per renderlo ancora più morbido ed elegante
				ease: 'power2.inOut', // Decelerazione e accelerazione morbide
				onUpdate: () => {
					window.scrollTo(0, scrollObj.y);
				},
				onComplete: () => {
					// Rimuove il parametro dall'URL per evitare la riesecuzione al ricaricamento della pagina
					const url = new URL(window.location.href);
					url.searchParams.delete('fromArchetype');
					window.history.replaceState({}, '', url.toString());
				}
			});
		}, 500);
	});

	return {
		destroy() {
			cancelAnimationFrame(rafId);
			if (scrollTimeout) clearTimeout(scrollTimeout);
			if (tween) {
				tween.kill();
			}
		}
	};
}
