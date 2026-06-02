import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/**
 * Azione Svelte per la rivelazione sequenziale di elementi con effetto blur e opacity.
 * 
 * @param {HTMLElement} node - L'elemento del DOM a cui è applicata l'azione
 * @param {{ selector?: string; startPercent?: number }} [params] - Parametri configurabili
 */
export function scrollReveal(node, params = {}) {
	const selector = params.selector ?? '.reveal-line';
	const startPercent = params.startPercent ?? 50;

	const lines = node.querySelectorAll(selector);
	if (!lines.length) return;

	// Creiamo un contesto GSAP per gestire in sicurezza il cleanup di tween e ScrollTrigger
	const ctx = gsap.context(() => {
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: node,
				start: 'top 0%',
				end: `+=${lines.length * startPercent}%`,
				scrub: 1
			}
		});

		// Aggiungiamo le classi di stato iniziali
		node.classList.add('reveal-container');
		for (let i = 1; i < lines.length; i++) {
			lines[i].classList.add('reveal-hidden');
		}
		lines[0].classList.add('reveal-visible');

		// Definiamo la sequenza temporale per alternare le frasi in dissolvenza
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
			}, '-=0.5'); // Leggera sovrapposizione temporale per rendere il passaggio meno brusco
		}
	}, node);

	return {
		destroy() {
			// Preveniamo perdite di memoria e tween orfani annullando il contesto
			ctx.revert();
		}
	};
}
