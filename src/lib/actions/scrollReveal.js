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

		// Commento solo il PERCHÉ: se il breakpoint cambia a metà scroll (es. rotazione del telefono),
		// la timeline appena creata riparte sempre dal suo stato iniziale; il resync forzato la allinea
		// subito al progress di scroll reale invece di mostrare per un frame lo stato "inizio".
		if (tl.scrollTrigger) {
			tl.scrollTrigger.refresh();
			tl.progress(tl.scrollTrigger.progress, true);
		}
	});

	// Breakpoint Mobile
	mm.add('(max-width: 768px)', () => {
		// Commento solo il PERCHÉ: l'ultima riga è trattata come "frase finale" (hero) e tutte
		// le precedenti come dati che si accumulano una sopra l'altra. Ogni riga accumulata usa
		// due tween separati (entra con opacity/blur, poi si sposta con posizione/scala) invece
		// di uno solo, per far coincidere l'ingresso con lo snap-point precedente e l'assestamento
		// con quello successivo, così lo scrub resta leggibile passo per passo.
		const heroIndex = lines.length - 1;
		const numStats = heroIndex;

		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: triggerElement,
				start: 'top 0%',
				end: params.end ?? `+=${lines.length * startPercent}%`,
				scrub: 1,
				snap: numStats > 0 ? {
					snapTo: 1 / (2 * numStats + 2),
					duration: { min: 0.2, max: 0.6 },
					ease: 'power2.inOut',
					delay: 0.05
				} : undefined
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

		tl.to(lines[0], { y: 0, scale: 1.0, duration: 1 }, 0);

		if (numStats > 0) {
			for (let i = 1; i < numStats; i++) {
				tl.to(lines[i], { opacity: 1, filter: 'blur(0px)', duration: 1 }, 2 * i - 1);
				tl.to(lines[i], { y: 0, scale: 1.0, duration: 1 }, 2 * i);
			}

			const fadeTime = 2 * numStats;
			tl.to(Array.from(lines).slice(0, numStats), { opacity: 0, filter: 'blur(15px)', y: -20, duration: 1 }, fadeTime)
			  .to(lines[heroIndex], { opacity: 1, filter: 'blur(0px)', duration: 1 }, fadeTime);

			tl.to(lines[heroIndex], { scale: 1.0, y: 0, duration: 1 }, fadeTime + 1);
		}

		// Commento solo il PERCHÉ: se il breakpoint cambia a metà scroll (es. rotazione del telefono),
		// la timeline appena creata riparte sempre dal suo stato iniziale; il resync forzato la allinea
		// subito al progress di scroll reale invece di mostrare per un frame lo stato "inizio".
		if (tl.scrollTrigger) {
			tl.scrollTrigger.refresh();
			tl.progress(tl.scrollTrigger.progress, true);
		}
	});

	return {
		destroy() {
			mm.revert();
		}
	};
}
