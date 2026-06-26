import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/**
 * Svelte Action per far apparire gli elementi figli in sequenza temporizzata (staggered) al raggiungimento dello scroll.
 * 
 * @param {HTMLElement} node - Il contenitore padre che fa da trigger
 * @param {Object} [params] - Opzioni di configurazione dell'animazione
 * @param {string} [params.selector] - Selettore CSS degli elementi da animare (default: '.archetype-card-container')
 * @param {number} [params.y] - Spostamento verticale iniziale in pixel (default: 60)
 * @param {number} [params.stagger] - Tempo di attesa tra la comparsa di un elemento e il successivo (default: 0.15)
 * @param {number} [params.duration] - Durata dell'animazione di ciascuna card (default: 0.8)
 * @param {string} [params.ease] - Curva di easing GSAP (default: 'power3.out')
 * @param {Object} [params.triggerOptions] - Opzioni aggiuntive o override per ScrollTrigger
 */
export function staggerReveal(node, params = {}) {
	const selector = params.selector ?? '.archetype-card-container';
	const yOffset = params.y ?? 60;
	const staggerTime = params.stagger ?? 0.15;
	const animDuration = params.duration ?? 0.8;
	const easeEffect = params.ease ?? 'power3.out';
	
	const targets = node.querySelectorAll(selector);
	if (!targets.length) return;

	// Commento solo il perché: prepariamo lo stato iniziale nascosto e traslato prima che ScrollTrigger si attivi per prevenire FOUC.
	gsap.set(targets, { y: yOffset, opacity: 0 });

	const ctx = gsap.context(() => {
		// Commento solo il perché: leghiamo un unico ScrollTrigger al contenitore padre per animare in sequenza tutti i figli definiti dal selettore.
		gsap.to(targets, {
			scrollTrigger: {
				trigger: node,
				start: 'top 85%',
				toggleActions: 'play none none none',
				...params.triggerOptions
			},
			y: 0,
			opacity: 1,
			duration: animDuration,
			stagger: staggerTime,
			ease: easeEffect
		});
	}, node);

	return {
		destroy() {
			// Commento solo il perché: eliminiamo tutti i tween e i trigger associati al contesto GSAP all'uscita dal DOM per evitare memory leak.
			ctx.revert();
		}
	};
}
