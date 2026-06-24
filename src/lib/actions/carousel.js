import { gsap } from 'gsap';

const ANGLE_STEP = 18; // degrees between adjacent card positions

/**
 * @typedef {Object} CarouselParams
 * @property {number} [activeIndex]
 * @property {number} [itemsCount]
 * @property {number|null} [hoveredIndex]
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

	const ctx = gsap.context(() => {}, node);

	// Per-card proxy objects { diff } and their running tweens
	const cardProxies = new Map();
	const proxyTweens = new Map();

	/**
	 * @param {number} index - Target active index
	 * @param {boolean} animate
	 */
	function updateLayout(index, animate = true) {
		const cards = node.querySelectorAll('.carousel-item');
		const radius = getRadius(node.offsetWidth);

		cards.forEach((card, i) => {
			let targetDiff = i - index;
			if (targetDiff > itemsCount / 2) targetDiff -= itemsCount;
			else if (targetDiff < -itemsCount / 2) targetDiff += itemsCount;

			let prevDiff = i - activeIndex;
			if (prevDiff > itemsCount / 2) prevDiff -= itemsCount;
			else if (prevDiff < -itemsCount / 2) prevDiff += itemsCount;

			const absDiff = Math.abs(targetDiff);
			// Lateral card gets full opacity when hovered directly or when its dot is hovered
			const isHovered = hoveredIndex === i;
			const targetOpacity = absDiff === 0 ? 1 : absDiff === 1 ? (isHovered ? 1 : 0.85) : 0;
			const targetZIndex = 10 - absDiff;
			const targetPointerEvents = absDiff <= 1 ? 'auto' : 'none';

			// Kill existing proxy tween so we start from current animated position
			proxyTweens.get(card)?.kill();

			ctx.add(() => {
				gsap.set(card, { zIndex: targetZIndex, pointerEvents: targetPointerEvents });

				if (!animate) {
					const angle = targetDiff * ANGLE_STEP * (Math.PI / 180);
					gsap.set(card, {
						x: radius * Math.sin(angle),
						y: radius * (1 - Math.cos(angle)),
						rotation: targetDiff * ANGLE_STEP,
						scale: 1,
						opacity: targetOpacity
					});
					const proxy = cardProxies.get(card) ?? { diff: targetDiff };
					proxy.diff = targetDiff;
					cardProxies.set(card, proxy);
					return;
				}

				const isWrap = Math.abs(targetDiff - prevDiff) > 1.5;

				if (isWrap) {
					const angle = targetDiff * ANGLE_STEP * (Math.PI / 180);
					gsap.killTweensOf(card);
					gsap.set(card, {
						x: radius * Math.sin(angle),
						y: radius * (1 - Math.cos(angle)),
						rotation: targetDiff * ANGLE_STEP,
						scale: 1,
						opacity: 0
					});
					const proxy = cardProxies.get(card) ?? { diff: targetDiff };
					proxy.diff = targetDiff;
					cardProxies.set(card, proxy);
					gsap.fromTo(card, { opacity: 0 }, { opacity: targetOpacity, duration: 0.6, ease: 'power2.out' });
					return;
				}

				// Arc-following: tween the diff angle, compute x/y/rotation per frame
				let proxy = cardProxies.get(card);
				if (!proxy) {
					proxy = { diff: prevDiff };
					cardProxies.set(card, proxy);
				}

				const tween = gsap.to(proxy, {
					diff: targetDiff,
					duration: 0.6,
					ease: 'power2.out',
					onUpdate() {
						const angle = proxy.diff * ANGLE_STEP * (Math.PI / 180);
						gsap.set(card, {
							x: radius * Math.sin(angle),
							y: radius * (1 - Math.cos(angle)),
							rotation: proxy.diff * ANGLE_STEP
						});
					}
				});
				proxyTweens.set(card, tween);

				// Opacity animated independently (doesn't need to follow the arc)
				gsap.to(card, { opacity: targetOpacity, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
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
			const indexChanged = newParams.activeIndex !== activeIndex || newParams.itemsCount !== itemsCount;
			const hoverChanged = newParams.hoveredIndex !== hoveredIndex;

			// Capture previous hover before updating state
			const prevHoveredIndex = hoveredIndex;
			hoveredIndex = 'hoveredIndex' in newParams ? (newParams.hoveredIndex ?? null) : hoveredIndex;

			if (indexChanged) {
				// Update itemsCount first; keep activeIndex at old value so prevDiff is correct
				itemsCount = newParams.itemsCount ?? itemsCount;
				const newIndex = newParams.activeIndex ?? activeIndex;
				updateLayout(newIndex, true);
				// activeIndex is set to newIndex at the end of updateLayout
			} else if (hoverChanged) {
				// Animate only the two lateral cards that actually change opacity
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
			proxyTweens.forEach(t => t.kill());
			ctx.revert();
		}
	};
}
