import { gsap } from 'gsap';

const ANGLE_STEP = 18; // degrees between adjacent card positions

/**
 * @typedef {Object} CarouselParams
 * @property {number} [activeIndex]
 * @property {number} [itemsCount]
 */

/**
 * Returns the circle radius for card positioning based on container width
 * @param {number} containerWidth
 */
function getRadius(containerWidth) {
	return containerWidth * (containerWidth < 768 ? 0.8 : 1.4);
}

/**
 * Computes the GSAP target properties for a card at a given angular diff
 * @param {number} diff - Integer distance from active index (circular)
 * @param {number} radius
 */
function getCardTransform(diff, radius) {
	const absDiff = Math.abs(diff);
	const angle = diff * ANGLE_STEP * (Math.PI / 180);
	const x = radius * Math.sin(angle);
	// Stesso raggio del cerchio SVG (R_nav = navWidth * 0.694) → distanza arco→card uguale per tutte le card
	const arcR = (typeof window !== 'undefined' ? window.innerWidth : 1200) * 0.694;
	const y = arcR * (1 - Math.cos(angle));
	const rotation = diff * ANGLE_STEP;
	return {
		x,
		y,
		rotation,
		scale: 1,
		opacity: absDiff === 0 ? 1 : absDiff === 1 ? 0.85 : 0,
		zIndex: 10 - absDiff,
		pointerEvents: absDiff <= 1 ? 'auto' : 'none'
	};
}

/**
 * Svelte action that positions carousel items along a circular arc using GSAP
 * @param {HTMLElement} node - The carousel track container
 * @param {CarouselParams} params
 */
export function carousel(node, params = {}) {
	let activeIndex = params.activeIndex ?? 0;
	let itemsCount = params.itemsCount ?? 0;

	const ctx = gsap.context(() => {}, node);

	/**
	 * @param {number} index - Target active index
	 * @param {boolean} animate
	 */
	function updateLayout(index, animate = true) {
		const cards = node.querySelectorAll('.carousel-item');
		const radius = getRadius(node.offsetWidth);

		cards.forEach((card, i) => {
			let currentDiff = i - index;
			if (currentDiff > itemsCount / 2) currentDiff -= itemsCount;
			else if (currentDiff < -itemsCount / 2) currentDiff += itemsCount;

			let prevDiff = i - activeIndex;
			if (prevDiff > itemsCount / 2) prevDiff -= itemsCount;
			else if (prevDiff < -itemsCount / 2) prevDiff += itemsCount;

			const { x, y, rotation, scale, opacity, zIndex, pointerEvents } =
				getCardTransform(currentDiff, radius);

			const isWrap = animate && Math.abs(currentDiff - prevDiff) > 1.5;

			ctx.add(() => {
				gsap.set(card, { zIndex });

				if (animate && !isWrap) {
					gsap.to(card, {
						x,
						y,
						rotation,
						scale,
						opacity,
						pointerEvents,
						duration: 0.6,
						ease: 'power2.out',
						overwrite: 'auto'
					});
				} else {
					gsap.killTweensOf(card);
					gsap.set(card, { x, y, rotation, scale, pointerEvents });
					if (isWrap) {
						gsap.fromTo(card, { opacity: 0 }, { opacity, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
					} else {
						gsap.set(card, { opacity });
					}
				}
			});
		});

		activeIndex = index;
	}

	updateLayout(activeIndex, false);

	const onResize = () => updateLayout(activeIndex, false);
	window.addEventListener('resize', onResize);

	return {
		/** @param {CarouselParams} newParams */
		update(newParams) {
			if (newParams.activeIndex !== activeIndex || newParams.itemsCount !== itemsCount) {
				activeIndex = newParams.activeIndex ?? 0;
				itemsCount = newParams.itemsCount ?? 0;
				updateLayout(activeIndex, true);
			}
		},
		destroy() {
			window.removeEventListener('resize', onResize);
			ctx.revert();
		}
	};
}
