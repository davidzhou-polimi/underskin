import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/**
 * Action per l'effetto parallasse e dissolvenza del titolo nella Hero.
 * @param {HTMLElement} node - L'elemento del titolo da animare.
 * @param {Object} params - I parametri dell'animazione.
 * @param {HTMLElement} params.trigger - L'elemento contenitore (la sezione) che fa da trigger per lo scroll.
 */
export function heroParallax(node, params = {}) {
	const triggerElement = params.trigger;
	if (!triggerElement) return;

	// Impostiamo l'opacità iniziale a 1 prima che si attivi l'animazione scroll
	gsap.set(node, { opacity: 1 });

	// Commento solo il PERCHÉ: gsap.context garantisce che tutti i tween e gli ScrollTrigger associati vengano isolati e distrutti correttamente al cleanup
	const ctx = gsap.context(() => {
		gsap.fromTo(node,
			{ opacity: 1, y: 0 },
			{
				opacity: 0,
				y: -50,
				scrollTrigger: {
					trigger: triggerElement,
					start: 'top top',
					end: 'bottom 50%',
					scrub: true
				}
			}
		);
	}, node);

	return {
		destroy() {
			ctx.revert();
		}
	};
}
