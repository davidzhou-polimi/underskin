import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { scroll } from '$lib/stores/scroll.svelte.js';

// Registers ScrollTrigger globally for SSR safety
if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/**
 * Tracks the overall scroll progress of the DOM element it is attached to.
 * This keeps the global scroll.progress reactive state updated for other components.
 * @param {HTMLElement} node
 */
export function trackScrollProgress(node) {
	// Revert contextualizes all GSAP triggers created inside this scope for easy cleanup
	const ctx = gsap.context(() => {
		ScrollTrigger.create({
			trigger: node,
			start: 'top top',
			end: 'bottom bottom',
			onUpdate: (self) => {
				scroll.progress = self.progress;
			}
		});
	}, node);

	return {
		destroy() {
			// Ensures ScrollTrigger instance is killed when component is destroyed to prevent memory leaks
			ctx.revert();
		}
	};
}
