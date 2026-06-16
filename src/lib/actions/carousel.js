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
	 * @param {number} direction - +1 next, -1 prev; used to pick the wrap entry side
	 */
	function updateLayout(index, animate = true, direction = 0) {
		const cards = node.querySelectorAll('.carousel-item');
		const radius = getRadius(node.offsetWidth);

		// Capture OLD activeIndex here — prevDiff must use the previous position.
		// (activeIndex is updated at the end of this function)
		const prevIndex = activeIndex;

		cards.forEach((card, i) => {
			let currentDiff = i - index;
			if (currentDiff > itemsCount / 2) currentDiff -= itemsCount;
			else if (currentDiff < -itemsCount / 2) currentDiff += itemsCount;

			let prevDiff = i - prevIndex;
			if (prevDiff > itemsCount / 2) prevDiff -= itemsCount;
			else if (prevDiff < -itemsCount / 2) prevDiff += itemsCount;

			const target = getCardTransform(currentDiff, radius);

			// isWrap is true when the shortest-path diff jumps by more than one step,
			// meaning the card must cross from one side of the arc to the other.
			const isWrap = animate && Math.abs(currentDiff - prevDiff) > 1.5;

			ctx.add(() => {
				gsap.set(card, { zIndex: target.zIndex });

				if (!animate) {
					// Initial layout — no animation, just place cards.
					gsap.killTweensOf(card);
					gsap.set(card, {
						x: target.x, y: target.y,
						rotation: target.rotation, scale: target.scale,
						opacity: target.opacity, pointerEvents: target.pointerEvents
					});
				} else if (!isWrap) {
					// Normal transition — animate from current GSAP position to target.
					gsap.to(card, {
						x: target.x, y: target.y,
						rotation: target.rotation, scale: target.scale,
						opacity: target.opacity, pointerEvents: target.pointerEvents,
						duration: 0.6, ease: 'power2.out',
						overwrite: true
					});
				} else {
					// Wrap transition: the card must jump sides.
					// Place it off-screen on the INCOMING side (right for next, left for prev),
					// using target.y so the card is already at the correct arc height.
					// This way, even if the animation is interrupted, y is never wrong.
					const startDiff = direction >= 0 ? itemsCount : -itemsCount;
					const start = getCardTransform(startDiff, radius);

					gsap.killTweensOf(card);
					gsap.set(card, {
						x: start.x,
						y: target.y,          // correct arc height from the start
						rotation: start.rotation,
						scale: target.scale,
						opacity: 0,
						pointerEvents: 'none'
					});
					gsap.to(card, {
						x: target.x, y: target.y,
						rotation: target.rotation, scale: target.scale,
						opacity: target.opacity, pointerEvents: target.pointerEvents,
						duration: 0.6, ease: 'power2.out',
						overwrite: true
					});
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
			const newIndex = newParams.activeIndex ?? activeIndex;
			const newCount = newParams.itemsCount ?? itemsCount;

			if (newIndex !== activeIndex || newCount !== itemsCount) {
				// Compute direction from the OLD activeIndex BEFORE anything is updated.
				let diffDir = newIndex - activeIndex;
				if (diffDir > itemsCount / 2) diffDir -= itemsCount;
				else if (diffDir < -itemsCount / 2) diffDir += itemsCount;
				const direction = diffDir >= 0 ? 1 : -1;

				itemsCount = newCount;
				// Do NOT update activeIndex here — updateLayout reads it as prevIndex.
				updateLayout(newIndex, true, direction);
			}
		},
		destroy() {
			window.removeEventListener('resize', onResize);
			ctx.revert();
		}
	};
}
