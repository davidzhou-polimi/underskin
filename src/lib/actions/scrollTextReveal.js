import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/**
 * Azione Svelte per gestire lo scambio sequenziale di frasi con effetto Blur e opacity.
 * @param {HTMLElement} node - L'elemento del DOM a cui è applicata l'azione
 */
export function scrollTextReveal(node) {
	const lines = node.querySelectorAll('.reveal-line');
	if (!lines.length) return;

	const ctx = gsap.context(() => {
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: node,
				start: 'top top',
				// Ridotto da 100% a 50% per riga: lo scroll totale sarà molto più corto e rapido
				end: `+=${lines.length * 50}%`,
				pin: true,
				scrub: 1,
				anticipatePin: 1
			}
		});

		// Stato iniziale: tutto invisibile e sfocato tranne la prima riga
		gsap.set(lines, { opacity: 0, filter: 'blur(15px)', y: 20 });
		gsap.set(lines[0], { opacity: 1, filter: 'blur(0px)', y: 0 });

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