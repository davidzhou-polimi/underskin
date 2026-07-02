import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';

/**
 * Gestisce l'effetto di pinning, rivelazione del testo e dissolvenza in uscita
 * della sezione finale basato sullo scroll in un'unica timeline coerente.
 * 
 * @param {HTMLElement} node - La sezione .finale-section
 */
export function finalScroll(node) {
	const phrase = node.querySelector('.finale-phrase');
	if (!phrase) return;

	const ctx = gsap.context(() => {
		// Commento solo il PERCHÉ: blocca la sezione finale per permettere alla frase di rivelarsi
		// al centro dello schermo, restare fissa e poi dissolversi in uscita gradualmente
		// prima dello sblocco del pin, evitando scatti o conflitti di proprietà CSS.
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: node,
				start: 'top top',
				end: '+=150%',
				pin: true,
				pinSpacing: true,
				scrub: 1
			}
		});

		// Commento solo il PERCHÉ: applica l'effetto di sfocatura progressiva e trasparenza all'ingresso 
		// della frase per mantenere la coerenza visiva con lo stile introdotto nella prefazione.
		tl.to(phrase, {
			opacity: 1,
			filter: 'blur(0px)',
			y: 0,
			duration: 1,
			ease: 'power2.out'
		});

		// Commento solo il PERCHÉ: mantiene la scritta visibile al centro per una frazione di scroll.
		tl.to({}, { duration: 0.8 });

		// Commento solo il PERCHÉ: dissolve gradualmente la scritta finale portando l'opacità a 0
		// prima dell'unpin, assecondando l'avvicinamento del footer senza alcuna interruzione o scatto.
		tl.to(phrase, {
			opacity: 0,
			filter: 'blur(10px)',
			y: -20,
			duration: 1,
			ease: 'power2.in'
		});
	}, node);

	return {
		destroy() {
			ctx.revert();
		}
	};
}
