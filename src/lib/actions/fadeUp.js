import { gsap } from 'gsap';

/**
 * Svelte Action per un effetto Fade Up con GSAP.
 * @param {HTMLElement} node L'elemento del DOM a cui è applicata l'azione
 * @param {Object} options Opzioni per l'animazione (es. duration, delay, y)
 */
export function fadeUp(node, options = {}) {
	// Valori di default
	const config = {
		duration: 1,
		y: 50,
		opacity: 0,
		delay: 0,
		ease: 'power3.out',
		...options
	};

	// Imposta lo stato iniziale (immediatamente)
	gsap.set(node, {
		y: config.y,
		opacity: config.opacity
	});

	// Crea e avvia l'animazione
	const animation = gsap.to(node, {
		y: 0,
		opacity: 1,
		duration: config.duration,
		delay: config.delay,
		ease: config.ease,
		// Se avessi ScrollTrigger potresti configurarlo qui
	});

	return {
		/**
		 * Metodo chiamato se le opzioni cambiano (opzionale in questo caso semplice)
		 * @param {Object} newOptions
		 */
		update(newOptions) {
			// Potresti aggiornare l'animazione se necessario
		},
		
		/**
		 * Metodo critico per la pulizia: chiamato quando il nodo viene rimosso dal DOM
		 */
		destroy() {
			// Ferma e pulisce l'animazione per evitare memory leak
			animation.kill();
		}
	};
}
