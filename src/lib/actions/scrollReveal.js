import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';

/**
 * Azione Svelte per la rivelazione sequenziale di elementi con effetto blur e opacity.
 * Ottimizzata per lavorare in sinergia con il pinning locale del componente genitore.
 * Supporta timeline differenziate tra desktop (una alla volta) e mobile (accumulo e scale-down relativo).
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

	const mm = gsap.matchMedia();

	// Commento solo il PERCHÉ: gsap.matchMedia registra e isola tutte le istanze e i ScrollTrigger creati 
	// al suo interno per ciascun breakpoint, ripulendoli automaticamente (revert) al cambio di viewport.
	
	// Breakpoint Desktop
	mm.add('(min-width: 769px)', () => {
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: triggerElement,
				start: 'top 0%',
				end: params.end ?? `+=${lines.length * startPercent}%`,
				scrub: 1,
				snap: lines.length > 1 ? {
					snapTo: 1 / (lines.length - 1),
					duration: { min: 0.2, max: 0.6 },
					ease: 'power2.inOut',
					delay: 0.05
				} : undefined
			}
		});

		// Ripristino/settaggio degli stati CSS iniziali per evitare conflitti derivati da resize al volo
		node.classList.add('reveal-container');
		for (let i = 1; i < lines.length; i++) {
			lines[i].classList.remove('reveal-visible');
			lines[i].classList.add('reveal-hidden');
		}
		lines[0].classList.remove('reveal-hidden');
		lines[0].classList.add('reveal-visible');

		// Sequenza desktop standard: ogni frase sostituisce la precedente
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
	});

	// Breakpoint Mobile
	mm.add('(max-width: 768px)', () => {
		// La timeline mobile prevede 10 step totali (ciascuno con durata 1):
		// Step 1: Riga 0 si sposta nella sua posizione finale (scale: 1.0, y: 0)
		// Step 2: Riga 1 entra dal basso (scale: 1.3, opacity: 1)
		// Step 3: Riga 1 si sposta nella sua posizione finale (scale: 1.0, y: 0)
		// Step 4: Riga 2 entra dal basso (scale: 1.3, opacity: 1)
		// Step 5: Riga 2 si sposta nella sua posizione finale (scale: 1.0, y: 0)
		// Step 6: Riga 3 entra dal basso (scale: 1.3, opacity: 1)
		// Step 7: Riga 3 si sposta nella sua posizione finale (scale: 1.0, y: 0)
		// Step 8: Pausa di lettura statica per permettere all'utente di leggere i 4 dati completi.
		// Step 9: Le prime 4 righe (0-3) sfumano contemporaneamente (opacity: 0, filter: 'blur(15px)', y: -20)
		//         mentre l'ultima frase (riga 4) entra centrata a y: 25 e in grande (scale: 1.3, opacity: 1, filter: 'blur(0px)')
		// Step 10: L'ultima frase si rimpicciolisce e si stabilizza al centro (scale: 1.0, y: 0)
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: triggerElement,
				start: 'top 0%',
				end: params.end ?? `+=${lines.length * startPercent}%`,
				scrub: 1,
				snap: {
					snapTo: 1 / 10,
					duration: { min: 0.2, max: 0.6 },
					ease: 'power2.inOut',
					delay: 0.05
				}
			}
		});

		// Reset e pulizia delle classi per assicurare che il layout mobile controlli la visibilità iniziale
		node.classList.add('reveal-container');
		for (let i = 0; i < lines.length; i++) {
			lines[i].classList.remove('reveal-hidden', 'reveal-visible');
		}

		// Commento solo il PERCHÉ: imposta ciascun elemento all'avvio leggermente traslato verso il basso (+25px) 
		// rispetto al proprio slot naturale e ingrandito (scale: 1.3), in modo che l'entrata avvenga sempre al di sotto del testo precedente.
		gsap.set(lines[0], { 
			y: 25, 
			scale: 1.3, 
			opacity: 1, 
			filter: 'blur(0px)' 
		});
		for (let i = 1; i < lines.length; i++) {
			gsap.set(lines[i], {
				y: 25,
				scale: 1.3,
				opacity: 0,
				filter: 'blur(15px)'
			});
		}

		// Step 1: Riga 0 si sposta nella sua posizione finale
		tl.to(lines[0], { y: 0, scale: 1.0, duration: 1 }, 0);

		// Step 2: Riga 1 entra dal basso
		tl.to(lines[1], { opacity: 1, filter: 'blur(0px)', duration: 1 }, 1);

		// Step 3: Riga 1 si sposta nella sua posizione finale
		tl.to(lines[1], { y: 0, scale: 1.0, duration: 1 }, 2);

		// Step 4: Riga 2 entra dal basso
		tl.to(lines[2], { opacity: 1, filter: 'blur(0px)', duration: 1 }, 3);

		// Step 5: Riga 2 si sposta nella sua posizione finale
		tl.to(lines[2], { y: 0, scale: 1.0, duration: 1 }, 4);

		// Step 6: Riga 3 entra dal basso
		tl.to(lines[3], { opacity: 1, filter: 'blur(0px)', duration: 1 }, 5);

		// Step 7: Riga 3 si sposta nella sua posizione finale
		tl.to(lines[3], { y: 0, scale: 1.0, duration: 1 }, 6);

		// Step 8: Pausa di lettura statica (nessun movimento tra t=7 e t=8)

		// Step 9: Le prime 4 righe sfumano e l'ultima frase entra spostata a y: 25 ed in grande
		tl.to([lines[0], lines[1], lines[2], lines[3]], { opacity: 0, filter: 'blur(15px)', y: -20, duration: 1 }, 8)
		  .to(lines[4], { opacity: 1, filter: 'blur(0px)', duration: 1 }, 8);

		// Step 10: L'ultima frase si contrae e si posiziona a y: 0
		tl.to(lines[4], { scale: 1.0, y: 0, duration: 1 }, 9);
	});

	return {
		destroy() {
			mm.revert();
		}
	};
}
