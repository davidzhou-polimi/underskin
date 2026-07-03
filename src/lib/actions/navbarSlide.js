import { gsap } from '$lib/utils/gsapSetup.js';

/**
 * Azione Svelte per animare la navbar in entrata e in uscita tramite GSAP.
 * Reagisce al parametro `hidden` tramite update(): quando cambia, anima la trasformazione Y.
 * Notifica lo stato di animazione via `onAnimating` così il componente può ignorare i tocchi
 * sull'hamburger mentre la barra sta scorrendo (evita di aprire il menu con la barra a metà slide).
 *
 * @param {HTMLElement} node - L'elemento della navbar
 * @param {{ hidden: boolean, onAnimating?: (animating: boolean) => void }} params
 */
export function navbarSlide(node, params = { hidden: false }) {
	let currentHidden = params.hidden;
	let onAnimating = params.onAnimating;
	/** @type {gsap.core.Tween | null} */
	let tween = null;

	// Stato iniziale senza animazione (evita flash alla prima render)
	gsap.set(node, { yPercent: currentHidden ? -100 : 0 });

	return {
		/** @param {{ hidden: boolean, onAnimating?: (animating: boolean) => void }} newParams */
		update(newParams) {
			onAnimating = newParams.onAnimating; // tieni l'ultimo riferimento al callback
			const newHidden = newParams.hidden;
			if (newHidden === currentHidden) return;
			currentHidden = newHidden;

			if (tween) tween.kill();

			onAnimating?.(true);
			tween = gsap.to(node, {
				yPercent: newHidden ? -100 : 0,
				duration: newHidden ? 0.5 : 0.3,
				ease: newHidden ? 'power2.in' : 'power2.out',
				overwrite: true,
				onComplete: () => onAnimating?.(false)
			});
		},
		destroy() {
			if (tween) tween.kill();
			onAnimating?.(false);
		}
	};
}
