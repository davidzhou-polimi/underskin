import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/**
 * Azione Svelte per la rivelazione sequenziale di elementi con effetto blur e opacity.
 * Ottimizzata per lavorare in sinergia con il pinning locale del componente genitore.
 * 
 * @param {HTMLElement} node - L'elemento del DOM a cui è applicata l'azione (.text-container)
 * @param {{ selector?: string; startPercent?: number; trigger?: HTMLElement | string; end?: string }} [params] - Parametri configurabili
 */
export function scrollReveal(node, params = {}) {
	const selector = params.selector ?? '.reveal-line';
	const startPercent = params.startPercent ?? 50;

	// Troviamo il trigger reale (la sezione genitore che viene bloccata) per calcolare i punti di avvio corretti
	const triggerElement = params.trigger 
		? (typeof params.trigger === 'string' ? document.querySelector(params.trigger) : params.trigger)
		: (node.closest('section') ?? node);

	const lines = node.querySelectorAll(selector);
	if (!lines.length) return;

	const ctx = gsap.context(() => {
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: triggerElement,
				start: 'top 0%',
				end: params.end ?? `+=${lines.length * startPercent}%`,
				scrub: 1
			}
		});

		// Stato iniziale non distruttivo tramite classi CSS
		node.classList.add('reveal-container');
		for (let i = 1; i < lines.length; i++) {
			lines[i].classList.add('reveal-hidden');
		}
		lines[0].classList.add('reveal-visible');

		// Definiamo la sequenza di dissolvenza/sfocatura sequenziale tra le frasi
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
			}, '-=0.5'); // Sovrapposizione parziale dei tween per ammorbidire la transizione
		}
	}, node);

	return {
		destroy() {
			ctx.revert();
		}
	};
}
