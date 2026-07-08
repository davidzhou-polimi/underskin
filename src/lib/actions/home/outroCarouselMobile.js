import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';
import { lockScroll, unlockScroll } from '$lib/stores/lenis.svelte.js';
import { navigationState } from '$lib/stores/navigationState.svelte.js';

// Durata del micro-stop all'ingresso: quanto basta a uccidere il momentum del flick
// e far registrare la sezione all'occhio, senza che il freno sembri un blocco.
const ENTRY_STOP_SECONDS = 0.6;

/**
 * @typedef {{ target: number, lines: string[] }} OutroStage
 */

/**
 * Azione Svelte per la variante mobile della sezione Outro: un carosello solo-testo
 * pilotato dal pulsante Successivo/Precedente (l'indice attivo arriva dal componente).
 * Anima il count-up della percentuale e il cross-fade delle didascalie; inoltre all'ingresso
 * ferma davvero lo scroll (micro-stop: lock CSS sul posto che uccide il momentum del flick);
 * subito dopo lo scroll torna libero e il pin sticky completa l'inquadratura.
 *
 * @param {HTMLElement} node - La sezione `.outro-scroll-container`
 * @param {{ stages: OutroStage[], activeIndex?: number }} params
 */
export function outroCarouselMobile(node, params) {
	const stages = params.stages;
	let activeIndex = params.activeIndex ?? 0;

	const mm = gsap.matchMedia();

	// Assegnata dal branch mobile e azzerata alla sua cleanup: così update() resta inerte su desktop
	/** @type {((targetIndex: number) => void) | null} */
	let applyStage = null;

	mm.add('(max-width: 768px)', () => {
		const percentageEl = node.querySelector('.mobile-percentage');
		const captionEls = node.querySelectorAll('.mobile-caption');

		/** @type {gsap.core.Tween | null} */
		let currentTween = null;
		const animState = { value: stages[activeIndex]?.target ?? 0 };

		/** @param {number} v */
		function renderValue(v) {
			if (percentageEl) percentageEl.textContent = `${Math.round(v)}%`;
		}

		const ctx = gsap.context(() => {}, node);

		// Stato iniziale: percentuale e didascalia dello stage attivo subito visibili
		renderValue(animState.value);
		ctx.add(() => {
			captionEls.forEach((el, idx) => {
				gsap.set(el, { opacity: idx === activeIndex ? 1 : 0 });
			});
		});

		applyStage = (targetIndex) => {
			const stage = stages[targetIndex];
			if (!stage) return;

			// Commento solo il PERCHÉ: interrompe il count-up precedente per evitare sovrapposizioni
			// se l'utente tocca il pulsante in rapida successione.
			if (currentTween) currentTween.kill();

			ctx.add(() => {
				currentTween = gsap.to(animState, {
					value: stage.target,
					duration: 0.5,
					ease: 'power2.out',
					onUpdate() {
						renderValue(animState.value);
					}
				});

				captionEls.forEach((el, idx) => {
					gsap.to(el, {
						opacity: idx === targetIndex ? 1 : 0,
						duration: 0.25,
						ease: 'power1.out',
						overwrite: 'auto'
					});
				});
			});
		};

		// Commento solo il PERCHÉ: con syncTouch:false lo scroll touch è NATIVO e il momentum di
		// un flick non si ferma né con snap né con preventDefault a dito sollevato: l'unico freno
		// reale è il lock CSS (html.scroll-locked → overflow hidden). Il freeze scatta SOLO quando
		// il top della sezione tocca il top del viewport: grazie al pin sticky (200svh) lì
		// l'inquadratura è già piena, quindi il fermo si legge come "arrivato sull'Outro" — un
		// confine più alto (55%/75%, provati) congelava a cavallo della sezione precedente e
		// sembrava uno stallo. Un fling percorre il tratto mancante in un paio di frame, la
		// protezione non cambia. Niente salti né glide programmatici (scattosi, provati anche
		// quelli): si congela sul posto e basta. Il flag si ri-arma solo riuscendo da sopra, e
		// gli eventi emessi durante il freeze vengono ignorati: a scroll congelato (lenis.stop)
		// i trigger sparano onLeaveBack spuri che ri-armavano il freno (blocchi ripetuti).
		let hasStopped = false;
		let stopLockActive = false;
		/** @type {gsap.core.Tween | null} */
		let unlockCall = null;

		ctx.add(() => {
			ScrollTrigger.create({
				trigger: node,
				start: 'top top+=2',
				end: 'bottom top',
				onEnter: () => {
					if (hasStopped) return;
					// Durante lo scroll cinematico "Vai alla conclusione" (fromArchetype ancora alto:
					// si azzera solo all'onComplete) il lock congelerebbe il glide programmatico di
					// Lenis a metà corsa: si segna la sosta come già consumata e non si blocca.
					if (navigationState.fromArchetype) {
						hasStopped = true;
						return;
					}
					hasStopped = true;
					lockScroll();
					stopLockActive = true;
					unlockCall = gsap.delayedCall(ENTRY_STOP_SECONDS, () => {
						stopLockActive = false;
						unlockScroll();
					});
				},
				onLeaveBack: () => {
					if (stopLockActive) return;
					hasStopped = false;
				}
			});
		});

		return () => {
			applyStage = null;
			unlockCall?.kill();
			// Mai lasciare la pagina congelata se si smonta/cambia breakpoint durante il micro-stop
			if (stopLockActive) {
				stopLockActive = false;
				unlockScroll();
			}
			ctx.revert();
		};
	});

	return {
		/** @param {{ stages: OutroStage[], activeIndex?: number }} newParams */
		update(newParams) {
			const newIndex = newParams.activeIndex ?? 0;
			if (newIndex !== activeIndex) {
				activeIndex = newIndex;
				applyStage?.(newIndex);
			}
		},
		destroy() {
			mm.revert();
		}
	};
}
