import { gsap } from '$lib/utils/gsapSetup.js';

const ANGLE_STEP = 18; // degrees between adjacent card positions

/**
 * @typedef {Object} CarouselParams
 * @property {number} [activeIndex]
 * @property {number} [itemsCount]
 * @property {number|null} [hoveredIndex]
 * @property {boolean} [isDragging]
 */

/**
 * Returns the circle radius for card positioning based on container width
 * @param {number} containerWidth
 */
function getRadius(containerWidth) {
	return containerWidth * (containerWidth < 768 ? 0.8 : 1.4);
}

/**
 * Svelte action that positions carousel items along a circular arc using GSAP.
 * Cards follow the arc exactly during animation by tweening the angle (diff)
 * instead of x/y coordinates directly.
 * @param {HTMLElement} node - The carousel track container
 * @param {CarouselParams} params
 */
export function carousel(node, params = {}) {
	let activeIndex = params.activeIndex ?? 0;
	let itemsCount = params.itemsCount ?? 0;
	let hoveredIndex = params.hoveredIndex ?? null;

	// Gestiamo il ciclo di vita dei tween tramite un contesto dedicato per garantire il cleanup corretto.
	const ctx = gsap.context(() => {}, node);

	/**
	 * @param {number} index - Target active index
	 */
	function updateLayout(index) {
		const cards = node.querySelectorAll('.carousel-item');
		const radius = getRadius(node.offsetWidth);

		cards.forEach((card, i) => {
			let targetDiff = i - index;
			if (targetDiff > itemsCount / 2) targetDiff -= itemsCount;
			else if (targetDiff < -itemsCount / 2) targetDiff += itemsCount;

			const absDiff = Math.abs(targetDiff);
			const isHovered = hoveredIndex === i;
			
			// Interpolate opacity continuously based on distance to prevent card flickering
			let targetOpacity = 0;
			if (absDiff < 1) {
				targetOpacity = 1 - absDiff * (1 - (isHovered ? 1 : 0.85));
			} else if (absDiff < 2) {
				targetOpacity = (2 - absDiff) * (isHovered ? 1 : 0.85);
			}

			const targetZIndex = Math.round(10 - absDiff);
			const targetPointerEvents = absDiff <= 1.2 ? 'auto' : 'none';

			// Commento solo il PERCHÉ: posizioniamo istantaneamente le card lungo l'arco in base all'indice interpolato da Svelte per massima fluidità
			ctx.add(() => {
				const angle = targetDiff * ANGLE_STEP * (Math.PI / 180);
				gsap.set(card, {
					x: radius * Math.sin(angle),
					y: radius * (1 - Math.cos(angle)),
					rotation: targetDiff * ANGLE_STEP,
					scale: 1,
					opacity: targetOpacity,
					zIndex: targetZIndex,
					pointerEvents: targetPointerEvents
				});
			});
		});

		activeIndex = index;
	}

	updateLayout(activeIndex);

	const onResize = () => updateLayout(activeIndex);
	window.addEventListener('resize', onResize);

	return {
		/** @param {CarouselParams} newParams */
		update(newParams) {
			const indexChanged = newParams.activeIndex !== activeIndex || newParams.itemsCount !== itemsCount;
			const hoverChanged = newParams.hoveredIndex !== hoveredIndex;

			// Capture previous hover before updating state
			const prevHoveredIndex = hoveredIndex;
			hoveredIndex = 'hoveredIndex' in newParams ? (newParams.hoveredIndex ?? null) : hoveredIndex;

			if (indexChanged) {
				itemsCount = newParams.itemsCount ?? itemsCount;
				const newIndex = newParams.activeIndex ?? activeIndex;
				updateLayout(newIndex);
			} else if (hoverChanged) {
				// Commento solo il PERCHÉ: animiamo localmente l'opacità per l'effetto hover delle card adiacenti
				const cards = node.querySelectorAll('.carousel-item');
				const animateCard = (/** @type {number | null} */ index, /** @type {boolean} */ highlight) => {
					if (index === null) return;
					const card = cards[index];
					if (!card) return;
					let diff = index - activeIndex;
					if (diff > itemsCount / 2) diff -= itemsCount;
					else if (diff < -itemsCount / 2) diff += itemsCount;
					// Only lateral cards (diff ±1) participate in hover opacity
					if (Math.abs(diff) !== 1) return;
					gsap.to(card, { opacity: highlight ? 1 : 0.85, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
				};
				animateCard(prevHoveredIndex, false);
				animateCard(hoveredIndex, true);
			}
		},
		destroy() {
			window.removeEventListener('resize', onResize);
			ctx.revert();
		}
	};
}
