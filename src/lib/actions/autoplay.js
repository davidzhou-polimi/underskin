import { gsap } from '$lib/utils/gsapSetup.js';

/**
 * @typedef {Object} AutoplayParams
 * @property {number} [duration]
 * @property {boolean} [paused]
 * @property {() => void} [onComplete]
 */

/**
 * Svelte action che riempie linearmente la larghezza di un elemento per scandire il tempo dell'autoplay
 * @param {HTMLElement} node
 * @param {AutoplayParams} params
 */
export function autoplay(node, params = {}) {
	// Impostiamo esplicitamente lo stato iniziale per evitare salti grafici all'avvio dell'action
	gsap.set(node, { width: '0%' });

	// Usiamo ease: 'none' per garantire un avanzamento visivo lineare della barra di progresso
	const tween = gsap.to(node, {
		width: '100%',
		duration: params.duration ?? 3.5,
		ease: 'none',
		paused: params.paused ?? false,
		onComplete: () => {
			if (params.onComplete) {
				params.onComplete();
			}
		}
	});

	return {
		/** @param {AutoplayParams} newParams */
		update(newParams) {
			// Sincronizziamo lo stato di pausa del tween con le interazioni esterne dell'utente (es. hover)
			if (newParams.paused !== undefined) {
				if (newParams.paused) {
					tween.pause();
				} else {
					tween.play();
				}
			}
		},
		destroy() {
			// Evitiamo perdite di memoria e interruzioni indesiderate delle animazioni al cambio card
			tween.kill();
		}
	};
}
