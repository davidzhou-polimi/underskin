import { gsap } from 'gsap';

/**
 * Azione Svelte per coordinare l'animazione d'ingresso della Hero Section di "L'infortunato".
 * Gestisce l'effetto di reveal progressivo dello sfondo e del rumore di fondo.
 * 
 * @param {HTMLElement} node L'elemento del DOM della Hero Section
 * @param {Object} [params] Parametri opzionali per configurare i tempi o le distanze
 */
export function heroEntrance(node, params = {}) {
	// Definiamo un contesto GSAP per un cleanup sicuro ed evitare memory leak
	const ctx = gsap.context(() => {
		const tl = gsap.timeline({
			delay: 0.2
		});

		// 1. Animazione di respiro dello sfondo e del glow centrale
		// Rende più morbido l'ingresso dello spotlight luminoso al centro
		tl.fromTo(
			'.glow-spotlight',
			{
				opacity: 0,
				scale: 0.8
			},
			{
				opacity: 0.7,
				scale: 1,
				duration: 2.0,
				ease: 'power3.out'
			},
			'start'
		);

		// 2. Dissolvenza della trama granulosa
		// Riveliamo con delicatezza lo strato di rumore digitale di fondo
		tl.fromTo(
			'.noise-overlay',
			{
				opacity: 0
			},
			{
				opacity: 0.08,
				duration: 1.5,
				ease: 'none'
			},
			'start+=0.3'
		);
	}, node);

	return {
		destroy() {
			// Pulizia totale delle timeline
			ctx.revert();
		}
	};
}
