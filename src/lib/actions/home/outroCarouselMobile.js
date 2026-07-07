import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';
import { scrollTo } from '$lib/stores/lenis.svelte.js';

/**
 * @typedef {{ target: number, lines: string[] }} OutroStage
 */

/**
 * Azione Svelte per la variante mobile della sezione Outro: un carosello solo-testo
 * pilotato dal pulsante Successivo/Precedente (l'indice attivo arriva dal componente).
 * Anima il count-up della percentuale e il cross-fade delle didascalie; inoltre "aggancia"
 * la sezione a schermo intero quando entra nel viewport, così chi scrolla velocemente
 * non la salta senza vederla (scroll comunque libero, nessun lock).
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

		// Commento solo il PERCHÉ: il fermo vero è il pin CSS (sticky su 200svh) in Outro.svelte,
		// che regge anche l'inerzia del touch nativo; questo snap all'ingresso è il rifinitore
		// per wheel/trackpad, allineando il carosello a schermo intero appena entra in viewport.
		// Il flag evita ri-agganci finché non si riesce da sopra.
		let hasSnapped = false;
		ctx.add(() => {
			ScrollTrigger.create({
				trigger: node,
				start: 'top 75%',
				end: 'bottom top',
				onEnter: () => {
					if (hasSnapped) return;
					hasSnapped = true;
					scrollTo(node);
				},
				onLeaveBack: () => {
					hasSnapped = false;
				}
			});
		});

		return () => {
			applyStage = null;
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
