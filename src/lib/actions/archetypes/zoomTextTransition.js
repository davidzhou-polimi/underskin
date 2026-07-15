import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';
import { createPin } from '$lib/actions/scrollytelling/pin.js';
import { buildAsymmetricSnap } from '$lib/actions/scrollytelling/snap.js';
import { BREAKPOINT } from '$lib/actions/scrollytelling/presets.js';

/**
 * Azione Svelte per la transizione cinematografica dentro al testo SVG, costruita sulle
 * primitive della libreria di scrollytelling (createPin/buildAsymmetricSnap) ma tenuta
 * come action standalone: le serve la creazione DIFFERITA di un frame (vedi rAF sotto),
 * che il descrittore dichiarativo non prevede.
 * Su desktop usa lo zoom via viewBox nativo dell'SVG (massima nitidezza a qualsiasi scala).
 * Su mobile usa un fade della composizione tipografica: l'eyebrow appare prima, poi il blocco
 * titolo/anno entra con una leggera traslazione verso il basso, poi tutto sfuma all'uscita.
 *
 * onRevealChange(revealed) notifica l'attraversamento del punto della timeline in cui il carosello
 * viene rivelato (label 'reveal').
 *
 * @param {HTMLElement} node - Il container principale della sezione
 * @param {{ onRevealChange?: (revealed: boolean) => void }} [params]
 */
export function zoomTextTransition(node, params = {}) {
	const { onRevealChange } = params;
	const firstText = node.querySelector('.first-text');
	const zoomSvg = node.querySelector('.zoom-svg');
	const zoomTextMobile = node.querySelector('.zoom-text-mobile');
	const nextContent = node.querySelector('.next-section-content');

	if (!firstText || !nextContent) return;

	const eyebrow = zoomTextMobile ? zoomTextMobile.querySelector('.mobile-eyebrow') : null;
	const titleBlock = zoomTextMobile ? zoomTextMobile.querySelector('.mobile-title-block') : null;

	// Commento solo il PERCHÉ: azzeriamo subito (sincrono, prima del rAF) l'opacità di nextContent e degli
	// elementi animati di entrambi i branch. La creazione degli ScrollTrigger è differita di un frame: senza
	// questo hiding immediato, in quel frame d'attesa il testo (SVG su desktop, blocco tipografico su mobile)
	// lampeggerebbe a piena opacità. Ogni branch imposterà poi lo stato iniziale completo (blur, y, viewBox).
	gsap.set(nextContent, { autoAlpha: 0 });
	if (zoomSvg) gsap.set(zoomSvg, { opacity: 0 });
	gsap.set(firstText, { opacity: 0 });
	if (eyebrow) gsap.set(eyebrow, { opacity: 0 });
	if (titleBlock) gsap.set(titleBlock, { opacity: 0 });

	const mm = gsap.matchMedia();
	let rafId = 0;

	/**
	 * onUpdate condiviso dai due branch: notifica l'attraversamento della label 'reveal'.
	 * @param {(revealed: boolean) => void} [cb]
	 */
	const makeRevealNotifier = (cb) => {
		let lastRevealed = false;
		/** @param {ScrollTrigger} self */
		return (self) => {
			if (!cb) return;
			const anim = /** @type {gsap.core.Timeline} */ (self.animation);
			const revealed = self.progress >= anim.labels.reveal / anim.duration();
			if (revealed !== lastRevealed) {
				lastRevealed = revealed;
				cb(revealed);
			}
		};
	};

	// Differisce la creazione degli ScrollTrigger al prossimo frame di rendering,
	// garantendo che tutti i pin-spacer a monte (es. ShatterGlass) siano già nel DOM
	rafId = requestAnimationFrame(() => {
		// ===========================================================================
		// DESKTOP: zoom cinematografico via attributo viewBox SVG
		// ===========================================================================
		mm.add(BREAKPOINT.desktop, () => {
			if (!zoomSvg) return;

			gsap.set(zoomSvg, {
				opacity: 0,
				filter: 'blur(15px)',
				y: 20,
				attr: { viewBox: '0 0 1000 400' }
			});
			gsap.set(firstText, { opacity: 0, filter: 'blur(15px)', y: 30 });

			const ctx = gsap.context(() => {
				const tl = gsap.timeline();

				// 1. Comparsa iniziale sincronizzata
				tl.to(firstText, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1 })
				  .to(zoomSvg, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1 }, '<')

				  // 2. Zoom cinematografico super-nitido tramite animazione del viewBox nativo
				  .to(zoomSvg, {
						attr: { viewBox: '418 333 50 20' },
						/* La durata maggiorata rende lo zoom più graduale e cinematografico */
						duration: 2.5,
						ease: 'power2.out'
				  }, '+=1.5')

				  // Scomparsa contemporanea del testo di intro
				  .to(firstText, {
						opacity: 0,
						filter: 'blur(10px)',
						y: -40,
						duration: 1.0
				  }, '<')

				  // 3. Dissolvenza della sezione successiva
				  .addLabel('reveal', '-=0.8')
				  .to(nextContent, {
						autoAlpha: 1,
						duration: 1.0,
						ease: 'power1.out'
				  }, 'reveal')
				  .to(zoomSvg, {
						/* Sfuma l'SVG zoomato contemporaneamente all'ingresso del carosello */
						opacity: 0,
						duration: 1.0,
						ease: 'power1.out'
				  }, '<')

				  // 4. Buffer di riposo
				  .to({}, { duration: 2.5 });

				createPin(node, {
					id: 'zoomTrigger',
					length: 'long',
					// Override deliberato del preset desktop (1): lo zoom via viewBox chiede uno
					// smoothing più ammortizzato per restare cinematografico.
					scrub: 1.5,
					animation: tl,
					// Snap asimmetrico: in risalita si ferma a 0.20 (testo stabile) invece di 0.0.
					// Timing "cinematografico" deliberato al posto della ricetta SNAP standard.
					snap: buildAsymmetricSnap(
						(value) => {
							const trigger = ScrollTrigger.getById('zoomTrigger');
							const direction = trigger ? trigger.direction : 1;
							if (direction === 1) {
								return value > 0.30 ? 1.0 : 0.20;
							} else {
								return value < 0.80 ? 0.20 : 1.0;
							}
						},
						{ duration: { min: 0.8, max: 1.4 }, delay: 0.02, ease: 'power3.out' }
					),
					onUpdate: makeRevealNotifier(onRevealChange)
				});
			}, node);

			return () => ctx.revert();
		});

		// ===========================================================================
		// MOBILE: fade della composizione tipografica
		// Eyebrow entra per primo, poi il blocco titolo/anno sale dal basso.
		// All'uscita l'intera composizione sfuma verso l'alto.
		// ===========================================================================
		mm.add(BREAKPOINT.mobile, () => {
			if (!zoomTextMobile) return;

			// Stato iniziale nascosto completo (l'opacità è già stata azzerata sincronamente sopra)
			if (eyebrow) gsap.set(eyebrow, { opacity: 0, y: 10 });
			if (titleBlock) gsap.set(titleBlock, { opacity: 0, y: 30 });

			const ctx = gsap.context(() => {
				const tl = gsap.timeline();

				// 1. Eyebrow entra per primo (piccolo movimento verso l'alto)
				tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' })
				  // 2. Blocco titolo+anno sale dal basso con più enfasi
				  .to(titleBlock, { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' }, '-=0.3')

				  // 3. Hold — la composizione rimane visibile
				  .to({}, { duration: 2.0 })

				  // 4. Uscita lenta: il testo sfuma mentre il carosello è già in dissolvenza
				  //    d'ingresso — è il tratto di vero crossfade tra le due scene
				  .to(zoomTextMobile, {
						opacity: 0,
						y: -24,
						duration: 1.6,
						ease: 'power2.inOut'
				  })

				  // 5. Reveal sezione successiva: parte appena dopo l'inizio dell'uscita del testo
				  //    (qui scatta anche la transizione ~0.8s del gradiente, fusa nel crossfade)
				  .addLabel('reveal', '<+=0.2')
				  .to(nextContent, {
						autoAlpha: 1,
						duration: 2.4,
						ease: 'power2.inOut'
				  }, 'reveal')

				  // 6. Buffer lungo: il reveal si esaurisce molto prima della fine del pin,
				  //    così l'unpin avviene a scena ferma e non si percepisce lo stacco
				  .to({}, { duration: 2.5 });

				createPin(node, {
					id: 'zoomTriggerMobile',
					/* Override deliberato: pin più corto del preset 'long' per una navigazione
					   più snella su mobile */
					length: '+=210%',
					scrub: 'auto',
					isMobile: true,
					animation: tl,
					/* Niente snap: lo scrub continuo lascia il controllo al dito — lo snap
					   asimmetrico (fino a 2.4s di animazione autonoma) è ciò che rendeva
					   brusco il rilascio del pin verso il free-scroll. */
					onUpdate: makeRevealNotifier(onRevealChange)
				});
			}, node);

			return () => ctx.revert();
		});
	});

	return {
		destroy() {
			cancelAnimationFrame(rafId);
			mm.revert();
		}
	};
}
