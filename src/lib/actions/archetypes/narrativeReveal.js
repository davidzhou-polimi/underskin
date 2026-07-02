import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';

/**
 * Azione Svelte per il pinning temporaneo della sezione NarrativeText.
 * Rende visibile l'intero blocco di testo contemporaneamente (senza animazioni sequenziali)
 * e pinna la sezione a schermo per indurre una sosta di lettura naturale prima di procedere.
 * 
 * @param {HTMLElement} node - La sezione principale da pinnare (.narrative-section)
 * @param {{ end?: string }} [params] - Parametri opzionali di configurazione dello scroll
 */
export function narrativeReveal(node, params = {}) {
	const content = node.querySelector('.content-container');
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
