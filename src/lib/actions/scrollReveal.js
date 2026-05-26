import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/**
 * Azione Svelte per rivelare un elemento con fade-in durante lo scroll.
 * @param {HTMLElement} node - L'elemento del DOM a cui è applicata l'azione
 * @param {object} params - Parametri opzionali
 * @param {object} params.trigger - Parametri per ScrollTrigger
 * @param {object} params.tween - Parametri per l'animazione GSAP
 */
export function scrollReveal(node, params = {}) {
	const ctx = gsap.context(() => {
		gsap.from(node, {
			scrollTrigger: {
				trigger: node,
				start: 'top 80%',
				...params.trigger
			},
			opacity: 0,
			y: 40,
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
