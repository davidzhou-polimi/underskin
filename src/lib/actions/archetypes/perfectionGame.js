import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';
import { media } from '$lib/stores/mediaQuery.svelte.js';

const MAX_RANGE_MOBILE = 140;
const MAX_RANGE_DESKTOP = 320;

/**
 * Svelte Action per gestire l'oscillazione del Perfection Game con GSAP.
 *
 * @param {HTMLElement} node Il blob-wrapper a cui è applicata l'azione
 * @param {Object} [options={}] Opzioni dell'azione
 * @param {boolean} [options.isPlaying] Indica se il gioco è in esecuzione
 * @param {Function} [options.onStop] Callback invocata quando il gioco viene fermato, riceve la coordinata finale e il maxRange (raggio massimo di oscillazione) usato per calcolarla
 */
export function perfectionGameAction(node, options = {}) {
	let isPlaying = options.isPlaying ?? false;

	/** @type {gsap.core.Tween | undefined} */
	let tween;

	// Commento solo il PERCHÉ: letto una sola volta (invece che ricalcolato ad ogni stop)
	// così l'asse animato dal tween e l'asse letto allo stop restano sempre coerenti,
	// anche se il viewport attraversa il breakpoint mobile dopo il mount.
	const isMobile = media.isMobile;
	const maxRange = isMobile ? MAX_RANGE_MOBILE : MAX_RANGE_DESKTOP;

	// Utilizziamo un context GSAP per raggruppare tutte le animazioni e gli ScrollTrigger,
	// garantendo una pulizia e rimozione sicura delle risorse al destroy dell'elemento.
	const ctx = gsap.context(() => {
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
		// Il trigger si risolve dal nodo e mai da un bind:this dell'antenato: in Svelte 5 quel
		// bind arriva DOPO l'init delle action figlie, e uno ScrollTrigger senza elemento
		// risolve 'top 80%' contro la posizione 0 → attivo dal primo pixel di scroll.
		ScrollTrigger.create({
			id: 'perfectionPulse',
			trigger: node.closest('section') ?? node,
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
					const finalValue = Number(gsap.getProperty(node, isMobile ? 'y' : 'x'));
					if (newOptions.onStop) {
						newOptions.onStop(finalValue, maxRange);
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
