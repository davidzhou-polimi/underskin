import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/**
 * Azione Svelte per la rivelazione sequenziale di elementi con effetto blur e opacity.
 * @param {HTMLElement} node - L'elemento del DOM a cui è applicata l'azione
 * @param {{ selector?: string; startPercent?: number }} [params] - Parametri configurabili
 */
export function scrollReveal(node, params = {}) {
	const selector = params.selector ?? '.reveal-line';
	const startPercent = params.startPercent ?? 50;

	const lines = node.querySelectorAll(selector);
	if (!lines.length) return;

	const ctx = gsap.context(() => {
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: node,
				start: 'top 0%',
				end: `+=${lines.length * startPercent}%`,
				scrub: 1
			}
		});

		// Stato iniziale: CSS class stabilisce l'aspetto visivo
		// reveal-visible → opacity:1, filter:blur(0px) per la prima riga
		// reveal-hidden  → opacity:0, filter:blur(15px) per le altre
		node.classList.add('reveal-container');
		for (let i = 1; i < lines.length; i++) {
			lines[i].classList.add('reveal-hidden');
		}
		lines[0].classList.add('reveal-visible');

		// Sequenza di scambio delle frasi
		for (let i = 0; i < lines.length - 1; i++) {
			tl.to(lines[i], {
				opacity: 0,
				filter: 'blur(15px)',
				y: -20,
				duration: 1
			})
			.to(lines[i + 1], {
				opacity: 1,
				filter: 'blur(0px)',
				y: 0,
				duration: 1
			}, '-=0.5');
		}
	}, node);

	return {
		destroy() {
			ctx.revert();
		}
	};
}
