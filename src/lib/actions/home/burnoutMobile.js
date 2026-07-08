import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';
import { getLenis, lockScrollDown, unlockScrollDown } from '$lib/stores/lenis.svelte.js';
import { gradientConfig } from '$lib/stores/gradientConfig.svelte.js';

// Secondi di pressione continua per riempire il cerchio; il rilascio svuota più in fretta
// per dare la sensazione che lo "sforzo" vada mantenuto con costanza.
const FILL_SECONDS = 2;
const DECAY_SECONDS = 1.2;

/**
 * Azione Svelte per la variante mobile della sezione Burnout, composta da due blocchi
 * sequenziali in flusso:
 * 1. `.m-text-block` — pinnato via sticky: lo scroll rivela "È la performance." sotto il
 *    sottotitolo, poi (esaurito il pin) il blocco scorre via naturalmente verso l'alto.
 * 2. `.m-hold-block` — il press-and-hold: tenendo premuto, un cerchio pieno riempie quello
 *    tratteggiato mentre la parola BURNOUT cresce tremolando sullo sfondo; a riempimento
 *    completo la parola esplode e svanisce, entrano i testi finali e lo scroll si sblocca.
 *
 * Lo scroll verso il basso è bloccato in cima al blocco del cerchio finché l'interazione
 * non è stata completata almeno una volta (pattern direzionale di gameDownLock.js, più il
 * re-ancoraggio anti-fling: preventDefault non ferma un'inerzia già partita).
 *
 * @param {HTMLElement} node - Il contenitore esterno della sezione
 */
export function burnoutMobile(node) {
	// Persiste fuori dal branch matchMedia: un resize desktop↔mobile non deve far rigiocare l'attività
	let hasCompleted = false;

	const mm = gsap.matchMedia();

	mm.add('(max-width: 768px)', () => {
		const titleEl = node.querySelector('.m-title');
		const textStickyEl = node.querySelector('.m-text-sticky');
		const holdEl = node.querySelector('.m-hold');
		const holdTargetEl = node.querySelector('.m-hold-target');
		const fillEl = node.querySelector('.m-hold-fill');
		const wordEls = node.querySelectorAll('.m-burnout-word');
		const outroEl = node.querySelector('.m-outro');

		if (
			!titleEl || !textStickyEl || !holdEl ||
			!holdTargetEl || !fillEl || wordEls.length === 0 || !outroEl
		) return;

		const outroChildren = outroEl.children;

		const ctx = gsap.context(() => {}, node);

		// ─── Lock direzionale sul plateau di interazione ──────────────────────

		let downLocked = false;

		/**
		 * @param {boolean} active
		 * @param {number} [snapPosition] - posizione scroll che allinea il blocco a schermo intero
		 */
		function setDownLock(active, snapPosition) {
			if (active && !hasCompleted) {
				if (!downLocked) {
					downLocked = true;
					lockScrollDown();
					// Incolla il blocco al top, uccidendo l'eventuale overshoot di inerzia di Lenis
					if (snapPosition !== undefined) {
						getLenis()?.scrollTo(snapPosition, { immediate: true, force: true });
					}
				}
			} else if (downLocked) {
				downLocked = false;
				unlockScrollDown();
			}
		}

		// ─── Press-and-hold ───────────────────────────────────────────────────

		let isPressed = false;
		let holdProgress = 0;
		// Commento solo il PERCHÉ: flag attivo durante l'esplosione finale, mantiene il ticker
		// in esecuzione con ampiezza massima affinché il tremolio continui fino all'uscita.
		let isExploding = false;

		function renderHold() {
			gsap.set(fillEl, { scale: holdProgress });

			// Commento solo il PERCHÉ: modula l'opacità del testo e lo sfondo solo se non è in corso l'esplosione finale,
			// evitando che il ticker continui a sovrascrivere lo stato del gradiente a copertura massima.
			if (!isExploding) {
				// Commento solo il PERCHÉ: acceleriamo il fade-out di .m-text-sticky portandolo a 0 entro il primo 50% di progresso (holdProgress = 0.5)
				// per anticipare l'ingresso della scritta BURNOUT ed evitare sovrapposizioni visive nel viewport.
				const textFadeProgress = Math.min(1, holdProgress * 2);
				gsap.set(textStickyEl, { opacity: 1 - textFadeProgress });

				// Commento solo il PERCHÉ: portiamo l'aumento di intensità del gradiente al massimo (coverage 1.0, speed 2.2)
				// entro il primo 10% di progresso (holdProgress = 0.1) per dare immediato contrasto non appena la scritta "BURNOUT" compare.
				const gradProgress = Math.min(1, holdProgress * 10);
				if (gradientConfig.config) {
					gradientConfig.config = {
						...gradientConfig.config,
						coverage: 0.35 + gradProgress * 0.65,
						speed: 0.6 + gradProgress * 1.6
					};
				}
			}

			// Commento solo il PERCHÉ: applica l'effetto tremolio (rumore per-frame) a entrambe 
			// le parole spaccate in due, facendole scalare e tremare in sincrono ma indipendenti.
			// Durante l'esplosione (isExploding) l'ampiezza è bloccata al massimo perché GSAP sovrascrive
			// scale e opacity con il tween di uscita: usiamo solo x/y/rotation per il tremolio.
			const amp = holdProgress * 6;
			wordEls.forEach((el) => {
				if (isExploding) {
					// Solo rumore posizionale: GSAP gestisce già scale e opacity nell'explosion tween
					gsap.set(el, {
						x: (Math.random() - 0.5) * amp,
						y: (Math.random() - 0.5) * amp,
						rotation: (Math.random() - 0.5) * amp * 0.15
					});
				} else {
					gsap.set(el, {
						opacity: holdProgress,
						scale: 0.6 + holdProgress * 0.7,
						x: (Math.random() - 0.5) * amp,
						y: (Math.random() - 0.5) * amp,
						rotation: (Math.random() - 0.5) * amp * 0.15
					});
				}
			});
		}

		function complete() {
			if (hasCompleted) return;
			hasCompleted = true;
			isPressed = false;
			isExploding = true;
			setDownLock(false);

			// Commento solo il PERCHÉ: ripristina immediatamente la luminosità e i colori originali chiari del gradiente
			// (coverage 0.35 e speed 0.6) nel momento esatto in cui l'esplosione comincia e scatta il secondo paragrafo.
			if (gradientConfig.config) {
				gradientConfig.config = {
					...gradientConfig.config,
					coverage: 0.35,
					speed: 0.6
				};
			}

			ctx.add(() => {
				// Commento solo il PERCHÉ: svuotiamo la timeline di scrollytelling iniziale per disattivare
				// gli scrub di risalita dello scroll, mantenendo permanentemente lo stato conclusivo dell'attività.
				if (scrollTl) {
					scrollTl.clear();
				}

				const tlExplode = gsap.timeline({
					onComplete() {
						// Commento solo il PERCHÉ: il tremolio va rimosso solo ora, quando la parola
						// è già svanita: così trema fino all'ultimo frame visibile e non si ferma prima.
						isExploding = false;
						gsap.ticker.remove(tick);
					}
				});
				// La parola esplode verso l'osservatore e svanisce tremando; il cerchio e il testo iniziale la seguono permanentemente
				tlExplode.to(wordEls, { scale: 2.5, autoAlpha: 0, duration: 0.9, ease: 'power2.in' })
					.to(holdEl, { autoAlpha: 0, scale: 0.85, duration: 0.5, ease: 'power2.out' }, '<')
					.to(textStickyEl, { autoAlpha: 0, scale: 0.85, duration: 0.5, ease: 'power2.out' }, '<')
					.set(outroEl, { opacity: 1 })
					.fromTo(
						outroChildren,
						{ y: 24, autoAlpha: 0 },
						{ y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.15, ease: 'power2.out' },
						'-=0.25'
					);
			});
		}

		/**
		 * @param {number} _time
		 * @param {number} deltaTime
		 */
		function tick(_time, deltaTime) {
			// Commento solo il PERCHÉ: durante l'esplosione il ticker rimane attivo per mantenere il tremolio;
			// la guardia su !hasCompleted verrebbe anche usata per fermare il loop, ma è ora rimpiazzata da isExploding.
			if (!isExploding && hasCompleted) return;
			if (!isExploding && !isPressed && holdProgress <= 0) return;

			// Durante l'esplosione manteniamo holdProgress = 1 per massimizzare l'ampiezza del tremolio
			if (!isExploding) {
				const dt = deltaTime / 1000;
				holdProgress = isPressed
					? Math.min(1, holdProgress + dt / FILL_SECONDS)
					: Math.max(0, holdProgress - dt / DECAY_SECONDS);
			}

			renderHold();
			if (!isExploding && holdProgress >= 1) complete();
		}

		function onPointerDown() {
			if (hasCompleted) return;
			isPressed = true;
		}

		function onPointerUp() {
			isPressed = false;
		}

		holdTargetEl.addEventListener('pointerdown', onPointerDown);
		window.addEventListener('pointerup', onPointerUp);
		window.addEventListener('pointercancel', onPointerUp);
		gsap.ticker.add(tick);

		// ─── Timeline di Scrollytelling mobile ─────────────────────────────────

		/** @type {gsap.core.Timeline | undefined} */
		let scrollTl;

		ctx.add(() => {
			// Impostiamo lo stato iniziale degli elementi prima dell'avvio dello scroll
			gsap.set(titleEl, { opacity: 0, y: 20 });
			gsap.set(holdEl, { opacity: 0, y: '40vh', pointerEvents: 'none' });
			/* Commento solo il PERCHÉ: inizializza entrambe le parti della parola a scala ridotta e invisibili. */
			gsap.set(wordEls, { opacity: 0, scale: 0.6 });

			scrollTl = gsap.timeline({
				scrollTrigger: {
					trigger: node,
					start: 'top top',
					end: '+=250%',
					pin: true,
					pinSpacing: true,
					scrub: 1.2,
					invalidateOnRefresh: true,
					onUpdate: (self) => {
						if (hasCompleted) return;
						// Il lock si attiva al 70% del progresso, dove il cerchio hold è fully revealed
						const lockProgress = 0.7;
						const snapPos = self.start + (self.end - self.start) * lockProgress;
						if (!downLocked && self.progress >= lockProgress) {
							setDownLock(true, snapPos);
						} else if (downLocked && self.scroll() > snapPos + 1) {
							getLenis()?.scrollTo(snapPos, { immediate: true, force: true });
						}
					},
					onLeaveBack: () => {
						setDownLock(false);
					}
				}
			});

			// Fase 1: Revel della frase "È la performance." al centro (0% -> 30%)
			scrollTl.to(titleEl, {
				opacity: 1,
				y: 0,
				duration: 1.0,
				ease: 'power2.out'
			});

			// Fase 2: Spostamento testo in alto e comparsa cerchio dal basso (30% -> 70%)
			scrollTl.to(textStickyEl, {
				y: '-22vh',
				duration: 1.5,
				ease: 'power2.inOut'
			}, 'transition');

			scrollTl.to(holdEl, {
				opacity: 1,
				/* Commento solo il PERCHÉ: a y: 32vh il cerchio viene spinto in basso per liberare spazio a BURNOUT,
				   mentre l'etichetta rimane a schermo grazie al layout compatto definito in Burnout.svelte. */
				y: '32vh',
				pointerEvents: 'auto',
				duration: 1.5,
				ease: 'power2.inOut'
			}, 'transition');

			// Fase 3: Plateau / stasi per consentire l'interazione sul cerchio (70% -> 100%)
			scrollTl.to({}, { duration: 1.5 });

			if (hasCompleted) {
				scrollTl.clear();
			}
		});

		// Stato iniziale coerente se montato a completamento già avvenuto
		if (hasCompleted) {
			ctx.add(() => {
				gsap.set(textStickyEl, { autoAlpha: 0 });
				gsap.set(holdEl, { autoAlpha: 0 });
				gsap.set(outroEl, { opacity: 1 });
			});
		}

		return () => {
			holdTargetEl.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('pointerup', onPointerUp);
			window.removeEventListener('pointercancel', onPointerUp);
			gsap.ticker.remove(tick);
			setDownLock(false);
			ctx.revert();
		};
	});

	return {
		destroy() {
			mm.revert();
		}
	};
}
