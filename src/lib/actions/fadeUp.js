import { gsap } from '$lib/utils/gsapSetup.js';

/**
 * Svelte Action per un effetto Fade Up con GSAP.
 * @param {HTMLElement} node L'elemento del DOM a cui è applicata l'azione
 * @param {Object} options Opzioni per l'animazione (es. duration, delay, y)
 */
export function fadeUp(node, options = {}) {
	const config = {
		duration: 1,
		y: 50,
		opacity: 0,
		delay: 0,
		ease: 'power3.out',
		...options
	};

	// Stato iniziale impostato subito per evitare il flash del contenuto già in posizione
	gsap.set(node, {
		y: config.y,
		opacity: config.opacity
	});

	const animation = gsap.to(node, {
		y: 0,
		opacity: 1,
		duration: config.duration,
		delay: config.delay,
		ease: config.ease
	});

	return {
		destroy() {
			animation.kill();
		}
	};
}
