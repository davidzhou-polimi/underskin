import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/**
 * Action per rivelare la citazione nella sezione Performance tramite ScrollTrigger.
 * @param {HTMLElement} node - L'elemento blockquote da rivelare.
 * @param {Object} [params] - I parametri opzionali.
 * @param {string} [params.triggerId] - L'ID del trigger (default '#performance').
 */
export function performanceReveal(node, params = {}) {
	const triggerId = params.triggerId || '#performance';

	// Impostiamo lo stato iniziale del testo (sfocato e traslato verso il basso)
	gsap.set(node, {
		opacity: 0,
		filter: 'blur(15px)',
		y: 20
	});

	// Commento solo il PERCHÉ: gsap.to aggancia ScrollTrigger per attivare l'animazione di entrata fluida solo quando l'elemento entra al 75% della viewport, invertendo l'animazione se l'utente torna indietro
	const st = gsap.to(node, {
		opacity: 1,
		filter: 'blur(0px)',
		y: 0,
		duration: 1.2,
		ease: 'power2.out',
		scrollTrigger: {
			trigger: triggerId,
			start: 'top 75%',
			toggleActions: 'play none none reverse'
		}
	});

	return {
		destroy() {
			if (st.scrollTrigger) {
				st.scrollTrigger.kill();
			}
			st.kill();
		}
	};
}
