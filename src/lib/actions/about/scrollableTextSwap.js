import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';
// dist/: stessa istanza del plugin usata dal resto del progetto (il percorso ESM
// 'gsap/ScrollTrigger' creerebbe un secondo ScrollTrigger non sincronizzato con Lenis)
import { scrollX } from '$lib/stores/scrollX.svelte.js';

/**
 * Azione Svelte per gestire lo swap orizzontale del testo con pinning dello scroll.
 * Cerca i blocchi di testo direttamente nel proprio subtree tramite querySelector,
 * evitando la race condition delle ref Svelte passate come parametri.
 *
 * @param {HTMLElement} node - L'elemento HTML su cui è applicata l'azione (use:scrollableTextSwap)
 */
export function scrollableTextSwap(node) {
	const currentElement = node.querySelector('.text-block-current');
	const nextElement = node.querySelector('.text-block-next');

	if (!currentElement || !nextElement) return;

	// Commento solo il PERCHÉ: gsap.context incapsula tutti i tween e lo ScrollTrigger con pin per consentire un ripristino pulito all'unmount del componente
	const ctx = gsap.context(() => {
		// Configurazione iniziale dello stato orizzontale degli elementi
		gsap.set(nextElement, { xPercent: 100, opacity: 0 });
		gsap.set(currentElement, { xPercent: 0, opacity: 1 });

		// Timeline con Pinning ancorata alla cima dello schermo
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: node,
				start: 'top top',
				end: '+=100%',
				scrub: 1,
				pin: true,
				invalidateOnRefresh: true,
				// Il gradiente di sfondo legge scrollX: lo swap orizzontale morpha lo sfondo
				onUpdate: (self) => {
					scrollX.progress = self.progress;
				}
			}
		});

		// 1. Pausa iniziale per consentire la lettura del primo testo
		tl.to({}, { duration: 0.5 });

		// 2. Transizione in contemporanea dei due testi
		tl.to(
			currentElement,
			{ xPercent: -100, opacity: 0, duration: 1, ease: 'power1.inOut' },
			'>'
		);

		tl.to(
			nextElement,
			{ xPercent: 0, opacity: 1, duration: 1, ease: 'power1.inOut' },
			'<'
		);

		// 3. Piccola sosta finale sul secondo testo prima dello sblocco dello scroll
		tl.to({}, { duration: 0.3 });
	}, node);

	return {
		destroy() {
			ctx.revert();
			// Evita che un valore residuo continui a deformare il gradiente su altre rotte
			scrollX.progress = 0;
		}
	};
}
