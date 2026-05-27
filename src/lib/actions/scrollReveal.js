import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/**
 * Azione Svelte per rivelare elementi DOM tramite GSAP ScrollTrigger.
 * Segue fedelmente lo schema richiesto da AGENTS.md garantendo un cleanup sicuro via ctx.revert().
 * 
 * @param {HTMLElement} node L'elemento da animare allo scroll
 * @param {{ trigger?: any, tween?: any }} [params] Opzioni della timeline e di ScrollTrigger
 */
export function scrollReveal(node, params = {}) {
	const ctx = gsap.context(() => {
		gsap.from(node, {
			scrollTrigger: {
				trigger: node,
				start: 'top 85%', // Si attiva quando la cima dell'elemento raggiunge l'85% dello schermo
				toggleActions: 'play none none none',
				...params.trigger
			},
			y: 50,
			opacity: 0,
			duration: 1.2,
			ease: 'power3.out',
			...params.tween
		});
	}, node);

	return {
		destroy() {
			// Cleanup completo e sicuro dei tween e dei trigger registrati
			ctx.revert();
		}
	};
}
