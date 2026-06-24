import { gsap } from 'gsap';

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

	/**
	 */
	function updateLayout() {
		const dots = node.querySelectorAll('.carousel-dot');

		dots.forEach((dot, i) => {
			let targetDiff = i - activeIndex;
			if (targetDiff > itemsCount / 2) targetDiff -= itemsCount;
			else if (targetDiff < -itemsCount / 2) targetDiff += itemsCount;

			const absDiff = Math.abs(targetDiff);
			
			// Commento solo il PERCHÉ: calcoliamo l'opacità in base alla distanza dal centro per sfumare l'evidenziazione in sincronia con il carosello
			let targetOpacity = 0.5;
			if (absDiff < 1) {
				targetOpacity = 1.0 - absDiff * 0.5;
			}

			// Se il dot è in hover, forziamo l'opacità massima
			if (i === hoveredIndex) {
				targetOpacity = 1.0;
			}

			// Commento solo il PERCHÉ: posizioniamo istantaneamente i dot e aggiorniamo l'opacità usando variabili CSS native per massimizzare le prestazioni
			const angle = targetDiff * ANGLE_STEP * (Math.PI / 180);
			gsap.set(dot, {
				x: radius * Math.sin(angle),
				y: -radius * Math.cos(angle),
				opacity: targetOpacity,
				fill: 'var(--content-primary)'
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
					const isActive = Math.abs(diff) === 0;
					if (isActive && !highlight) return;

					// Determiniamo l'opacità di destinazione in base alla distanza
					let baseOpacity = 0.5;
					if (Math.abs(diff) < 1) {
						baseOpacity = 1.0 - Math.abs(diff) * 0.5;
					}

					gsap.to(dot, {
						opacity: highlight || isActive ? 1.0 : baseOpacity,
						duration: 0.25,
						ease: 'power2.out',
						overwrite: 'auto'
					});
				};
				animateDot(prevHoveredIndex, false);
				animateDot(hoveredIndex, true);
			}
		},
		destroy() {}
	};
}
