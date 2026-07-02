import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';

/**
 * Action per gestire il pinning temporaneo e la rivelazione di Performance.svelte.
 * @param {HTMLElement} node - La sezione principale da pinnare (.performance-section)
 * @param {{ end?: string }} [params] - Parametri opzionali di configurazione dello scroll
 */
export function performanceReveal(node, params = {}) {
	const content = node.firstElementChild;
	if (!content) return;

	const ctx = gsap.context(() => {
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: node,
				start: 'top top',
				// Commento solo il PERCHÉ: pin temporaneo per indurre una sosta di lettura naturale prima che la pagina scorra avanti
				end: params.end || '+=100%',
				pin: true,
				scrub: 1,
				anticipatePin: 1
			}
		});

		// Stato iniziale dell'intero blocco di testo (leggera sfocatura e opacità)
		gsap.set(content, { opacity: 0, filter: 'blur(10px)', y: 20 });

		// Rivelazione contemporanea di tutti i testi all'inizio del pin
		tl.to(content, {
			opacity: 1,
			filter: 'blur(0px)',
			y: 0,
			duration: 1.0,
			ease: 'power2.out'
		});

		// Mantiene il testo visualizzato e leggibile durante lo scroll rimanente
		tl.to({}, { duration: 1.5 });
	}, node);

	return {
		destroy() {
			ctx.revert();
		}
	};
}
