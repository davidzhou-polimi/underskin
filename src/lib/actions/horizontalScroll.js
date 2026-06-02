import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { scrollX } from '$lib/stores/scrollX.svelte.js';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/**
 * @typedef {Object} HorizontalScrollParams
 * @property {string} [trackSelector] - CSS selector for the inner horizontal track element
 */

/**
 * Svelte Action — pins the section and converts vertical scroll into a horizontal translation
 * of the inner track. Writes progress to the global scrollX store so the gradient renderer
 * can react without prop-drilling or custom events.
 *
 * @param {HTMLElement} node
 * @param {HorizontalScrollParams} [params]
 */
export function horizontalScroll(node, params = {}) {
	const track = params.trackSelector
		? node.querySelector(params.trackSelector)
		: node.querySelector('.h-scroll-track');

	if (!track) return { destroy() {} };

	const ctx = gsap.context(() => {
		gsap.to(track, {
			x: () => -(/** @type {HTMLElement} */ (track).scrollWidth - window.innerWidth),
			ease: 'none',
			scrollTrigger: {
				trigger: node,
				pin: true,
				scrub: 1,
				start: 'top top',
				end: () => `+=${/** @type {HTMLElement} */ (track).scrollWidth - window.innerWidth}`,
				// Scrive il progresso sullo store globale — stessa convenzione di trackScrollProgress
				onUpdate: (self) => {
					scrollX.progress = self.progress;
				},
				invalidateOnRefresh: true,
			},
		});
	}, node);

	return {
		destroy() {
			ctx.revert();
		}
	};
}

