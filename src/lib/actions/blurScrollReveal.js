import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/**
 * Azione Svelte per rivelare un elemento con effetto blur e opacity durante lo scroll.
 * Simile a scrollTextReveal ma senza pin.
 * @param {HTMLElement} node - L'elemento del DOM a cui è applicata l'azione
 */
export function blurScrollReveal(node, params = {}) {
	const ctx = gsap.context(() => {
		gsap.from(node, {
			scrollTrigger: {
				trigger: node,
				start: 'top 80%',
				end: 'top 20%',
				scrub: 1,
				...params.trigger
			},
			opacity: 0,
			filter: 'blur(15px)',
			y: 20,
			duration: 1,
			...params.tween
		});
	}, node);

	return {
		destroy() {
			ctx.revert();
		}
	};
}
