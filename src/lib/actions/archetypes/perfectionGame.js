import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';

/**
 * Svelte Action per gestire l'oscillazione del Perfection Game con GSAP.
 * 
 * @param {HTMLElement} node Il blob-wrapper a cui è applicata l'azione
 * @param {Object} [options={}] Opzioni dell'azione
 * @param {boolean} [options.isPlaying] Indica se il gioco è in esecuzione
 * @param {HTMLElement} [options.triggerElement] L'elemento che fa da trigger per lo ScrollTrigger
 * @param {Function} [options.onStop] Callback invocata quando il gioco viene fermato, riceve la X finale
 */
export function perfectionGameAction(node, options = {}) {
	let isPlaying = options.isPlaying ?? false;

	/** @type {gsap.core.Tween | undefined} */
	let tween;

	// Utilizziamo un context GSAP per raggruppare tutte le animazioni e gli ScrollTrigger,
	// garantendo una pulizia e rimozione sicura delle risorse al destroy dell'elemento.
	const ctx = gsap.context(() => {
		const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

		if (isMobile) {
			// Posiziona il blob all'estremo superiore per iniziare in modo deterministico
			gsap.set(node, { y: -140, x: 0, scale: 0.6 });

			tween = gsap.to(node, {
				y: 140,
				duration: 3,
				ease: 'sine.inOut',
				repeat: -1,
				yoyo: true,
				paused: true,
				onUpdate: function() {
					// Calcola dinamicamente la scala in base al valore y corrente.
					// Su mobile la pallina parte da scala 0.6 agli estremi e raggiunge 1.05 al centro
					const currentY = Number(gsap.getProperty(node, 'y'));
					const scale = 1.05 - (Math.abs(currentY) / 140) * 0.45;
					gsap.set(node, { scale: scale });
				}
			});
		} else {
			// Posiziona il blob all'estremo sinistro per iniziare in modo deterministico
			gsap.set(node, { x: -320, y: 0, scale: 0.55 });

			tween = gsap.to(node, {
				x: 320,
				duration: 3,
				ease: 'sine.inOut',
				repeat: -1,
				yoyo: true,
				paused: true,
				onUpdate: function() {
					// Calcola dinamicamente la scala in base al valore x corrente.
					// Lo scale deve essere massimo (1.0) al centro (0px) e minimo (0.55) a -320px e 320px.
					const currentX = Number(gsap.getProperty(node, 'x'));
					const scale = 1.0 - (Math.abs(currentX) / 320) * 0.45;
					gsap.set(node, { scale: scale });
				}
			});
		}

		// Commento solo il PERCHÉ: mantiene in esecuzione l'oscillazione solo quando la sezione è visibile a schermo, gestendo correttamente anche il ripristino o lo scroll iniziale.
		ScrollTrigger.create({
			trigger: options.triggerElement,
			start: 'top 80%',
			onToggle: (self) => {
				if (tween) {
					if (self.isActive && isPlaying) {
						tween.play();
					} else {
						tween.pause();
					}
				}
			}
		});
	}, node);

	return {
		/**
		 * Sincronizza l'animazione in base allo stato del gioco passato da Svelte
		 * @param {any} newOptions Le nuove opzioni ricevute
		 */
		update(newOptions) {
			const prevPlaying = isPlaying;
			isPlaying = newOptions.isPlaying;

			if (isPlaying && !prevPlaying) {
				if (tween) {
					if (tween.progress() === 0 || tween.progress() === 1) {
						tween.restart();
					} else {
						tween.play();
					}
				}
			} else if (!isPlaying && prevPlaying) {
				if (tween) {
					tween.pause();
					// Restituisce la posizione precisa in cui l'utente ha premuto il tasto/click
					const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
					const finalValue = Number(gsap.getProperty(node, isMobile ? 'y' : 'x'));
					if (newOptions.onStop) {
						newOptions.onStop(finalValue);
					}
				}
			}
		},
		destroy() {
			// Previene memory leak disattivando tutti i trigger e i tween registrati nel context
			ctx.revert();
		}
	};
}
