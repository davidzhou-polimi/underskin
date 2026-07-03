import { gsap } from '$lib/utils/gsapSetup.js';

/**
 * Azione Svelte per animare la navbar in entrata e in uscita tramite GSAP.
 * Reagisce al parametro `hidden` tramite update(): quando cambia, anima la trasformazione Y.
 *
 * @param {HTMLElement} node - L'elemento della navbar
 * @param {{ hidden: boolean }} params
 */
export function navbarSlide(node, params = { hidden: false }) {
	let currentHidden = params.hidden;
	/** @type {gsap.core.Tween | null} */
	let tween = null;

	// Stato iniziale senza animazione (evita flash alla prima render)
	gsap.set(node, { yPercent: currentHidden ? -100 : 0 });

	return {
		/** @param {{ hidden: boolean }} newParams */
		update(newParams) {
			const newHidden = newParams.hidden;
			if (newHidden === currentHidden) return;
			currentHidden = newHidden;

			if (tween) tween.kill();

			tween = gsap.to(node, {
				yPercent: newHidden ? -100 : 0,
				duration: newHidden ? 0.5 : 0.3,
				ease: newHidden ? 'power2.in' : 'power2.out',
				overwrite: true
			});
		},
		destroy() {
			if (tween) tween.kill();
		}
	};
}
