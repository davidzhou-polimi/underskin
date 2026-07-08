import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';

/**
 * Action per gestire il pinning temporaneo e la rivelazione di Performance.svelte.
 * @param {HTMLElement} node - La sezione principale da pinnare (.performance-section)
 * @param {{ end?: string, pinMobile?: boolean }} [params] - pinMobile: replica il pin desktop
 *   anche su mobile. Opt-in perché l'azione è condivisa con Performance.svelte, che su mobile è
 *   display:none — un pin incondizionato creerebbe uno spacer su una sezione invisibile.
 */
export function performanceReveal(node, params = {}) {
	const content = node.firstElementChild;
	if (!content) return;

	const mm = gsap.matchMedia();

	// Pin e animazione scrub a pieno schermo: induce una sosta di lettura naturale
	// prima che la pagina scorra avanti.
	const pinnedReveal = () => {
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: node,
				start: 'top top',
				end: params.end || '+=100%',
				pin: true,
				scrub: 1,
				anticipatePin: 1,
				// Parità con gli altri pin della pagina (scrollableTextSwap): dopo la navigazione
				// client le misure del mount sono stantie e vanno rifatte al refresh globale.
				invalidateOnRefresh: true
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
	};

	mm.add('(min-width: 769px)', pinnedReveal);

	// Mobile: rivelazione semplice all'entrata nel viewport, o pin come il desktop se richiesto
	mm.add('(max-width: 768px)', () => {
		if (params.pinMobile) {
			pinnedReveal();
			return;
		}

		// Stato iniziale dell'intero blocco di testo (leggera sfocatura e opacità)
		gsap.set(content, { opacity: 0, filter: 'blur(10px)', y: 20 });

		// Rivelazione del testo all'entrata nel viewport
		gsap.to(content, {
			scrollTrigger: {
				trigger: node,
				start: 'top 85%',
				toggleActions: 'play none none none'
			},
			opacity: 1,
			filter: 'blur(0px)',
			y: 0,
			duration: 0.8,
			ease: 'power2.out'
		});
	});

	return {
		destroy() {
			mm.revert();
		}
	};
}
