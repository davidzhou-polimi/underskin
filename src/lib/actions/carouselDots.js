import { gsap } from '$lib/utils/gsapSetup.js';

const ANGLE_STEP = 18; // degrees — must match carousel.js

/**
 * @typedef {Object} CarouselDotsParams
 * @property {number} [activeIndex]
 * @property {number} [itemsCount]
 * @property {number} [cx]      - SVG x of the dot arc circle center
 * @property {number} [cy]      - SVG y of the dot arc circle center
 * @property {number} [radius]  - Dot arc circle radius (R_nav)
 * @property {number|null} [hoveredIndex]
 * @property {boolean} [isDragging]
 */

/**
 * Svelte action: animates N SVG dots (.carousel-dot) along a circular arc,
 * one dot per carousel card, in sync with the card animation.
 *
 * Each dot uses cx/cy as its base position (set by Svelte, reactive to resize).
 * GSAP owns only the x/y transform offsets — no conflict on resize.
 *
 * Dot angle mirrors the card angle exactly: diff × ANGLE_STEP degrees.
 *
 * @param {SVGElement} node - The <svg> element containing the dots
 * @param {CarouselDotsParams} params
 */
export function carouselDots(node, params = {}) {
	let {
		activeIndex = 0,
		itemsCount = 0,
		cx = 0,
		cy = 0,
		radius = 0,
		hoveredIndex = null
	} = params;

	// Gestiamo il ciclo di vita dei tween tramite un contesto dedicato per garantire il cleanup corretto.
	const ctx = gsap.context(() => {}, node);

	/**
	 */
	function updateLayout() {
		const dots = node.querySelectorAll('.carousel-dot');

		dots.forEach((dot, i) => {
			let targetDiff = i - activeIndex;
			if (targetDiff > itemsCount / 2) targetDiff -= itemsCount;
			else if (targetDiff < -itemsCount / 2) targetDiff += itemsCount;

			const absDiff = Math.abs(targetDiff);
			
			// Commento solo il PERCHÉ: calcoliamo l'opacità in base alla distanza dal centro in modo speculare alla visibilità delle card per nascondere i dot non visibili
			let targetOpacity = 0;
			if (absDiff < 1) {
				targetOpacity = 1.0 - absDiff * 0.5;
			} else if (absDiff < 2) {
				targetOpacity = (2.0 - absDiff) * 0.5;
			}

			// Se il dot è in hover, forziamo l'opacità massima
			if (i === hoveredIndex && absDiff < 2) {
				targetOpacity = 1.0;
			}

			// Commento solo il PERCHÉ: posizioniamo istantaneamente i dot e aggiorniamo l'opacità usando variabili CSS native per massimizzare le prestazioni
			const angle = targetDiff * ANGLE_STEP * (Math.PI / 180);
			ctx.add(() => {
				gsap.set(dot, {
					x: radius * Math.sin(angle),
					y: -radius * Math.cos(angle),
					opacity: targetOpacity,
					fill: 'var(--content-primary)',
					pointerEvents: targetOpacity > 0 ? 'auto' : 'none'
				});
			});
		});
	}

	updateLayout();

	return {
		/** @param {CarouselDotsParams} newParams */
		update(newParams) {
			const indexChanged =
				newParams.activeIndex !== activeIndex || newParams.itemsCount !== itemsCount;
			const geomChanged =
				newParams.cx !== cx ||
				newParams.cy !== cy ||
				newParams.radius !== radius;
			const hoverChanged = newParams.hoveredIndex !== hoveredIndex;

			// Capture previous hover before updating state
			const prevHoveredIndex = hoveredIndex;

			activeIndex = newParams.activeIndex ?? activeIndex;
			itemsCount = newParams.itemsCount ?? itemsCount;
			cx = newParams.cx ?? cx;
			cy = newParams.cy ?? cy;
			radius = newParams.radius ?? radius;
			hoveredIndex = 'hoveredIndex' in newParams ? (newParams.hoveredIndex ?? null) : hoveredIndex;

			if (indexChanged || geomChanged) {
				updateLayout();
			}
			else if (hoverChanged) {
				// Commento solo il PERCHÉ: animiamo l'opacità del dot al variare dello stato hover dell'utente
				const dots = node.querySelectorAll('.carousel-dot');
				const animateDot = (/** @type {number | null} */ index, /** @type {boolean} */ highlight) => {
					if (index === null) return;
					const dot = dots[index];
					if (!dot) return;
					let diff = index - activeIndex;
					if (diff > itemsCount / 2) diff -= itemsCount;
					else if (diff < -itemsCount / 2) diff += itemsCount;
					const absDiff = Math.abs(diff);
					const isActive = absDiff === 0;
					if (isActive && !highlight) return;

					// Determiniamo l'opacità di destinazione in base alla distanza
					let baseOpacity = 0;
					if (absDiff < 1) {
						baseOpacity = 1.0 - absDiff * 0.5;
					} else if (absDiff < 2) {
						baseOpacity = (2.0 - absDiff) * 0.5;
					}

					ctx.add(() => {
						gsap.to(dot, {
							opacity: (highlight && absDiff < 2) || isActive ? 1.0 : baseOpacity,
							pointerEvents: (highlight && absDiff < 2) || isActive || baseOpacity > 0 ? 'auto' : 'none',
							duration: 0.25,
							ease: 'power2.out',
							overwrite: 'auto'
						});
					});
				};
				animateDot(prevHoveredIndex, false);
				animateDot(hoveredIndex, true);
			}
		},
		destroy() {
			ctx.revert();
		}
	};
}
