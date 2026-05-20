import { gsap } from 'gsap';

/**
 * @typedef {Object} CarouselParams
 * @property {number} [activeIndex] - The current active card index
 * @property {number} [itemsCount] - Total number of cards
 */

/**
 * Svelte Action to position items on a curved arc and animate a custom Bezier track dot
 * @param {HTMLElement} node - The carousel container
 * @param {CarouselParams} params - The active index and item count
 */
export function carousel(node, params = {}) {
	let activeIndex = params.activeIndex ?? 0;
	let itemsCount = params.itemsCount ?? 0;

	// Bezier control points for the SVG indicator track
	const p0 = { x: 100, y: 80 };
	const p1 = { x: 500, y: 10 };
	const p2 = { x: 900, y: 80 };

	/**
	 * Helper to calculate a point along a quadratic Bezier curve
	 * @param {number} t
	 * @param {{x: number, y: number}} p0
	 * @param {{x: number, y: number}} p1
	 * @param {{x: number, y: number}} p2
	 * @returns {{x: number, y: number}}
	 */
	function getBezierPoint(t, p0, p1, p2) {
		const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
		const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
		return { x, y };
	}

	// Store the current animated progress of the indicator dot
	let progressObj = { progress: activeIndex };

	// Track screen size for responsive offset calculations
	let isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

	// GSAP context to ensure all tweens are cleaned up on destroy
	const ctx = gsap.context(() => {}, node);

	/**
	 * Positions cards and updates the SVG indicator dot
	 * @param {number} index - Target active index
	 * @param {boolean} animate - Whether to animate the transition or snap instantly
	 */
	function updateLayout(index, animate = true) {
		const cards = node.querySelectorAll('.carousel-item');
		const activeDot = node.querySelector('.active-dot');

		cards.forEach((card, i) => {
			let currentDiff = i - index;
			if (currentDiff > itemsCount / 2) {
				currentDiff -= itemsCount;
			} else if (currentDiff < -itemsCount / 2) {
				currentDiff += itemsCount;
			}

			let prevDiff = i - activeIndex;
			if (prevDiff > itemsCount / 2) {
				prevDiff -= itemsCount;
			} else if (prevDiff < -itemsCount / 2) {
				prevDiff += itemsCount;
			}

			let x = 0;
			let y = 0;
			let rotation = 0;
			let scale = 1;
			let opacity = 1;
			let zIndex = 10;
			let pointerEvents = 'auto';

			if (currentDiff === 0) {
				// Center active card
				x = 0;
				y = 0;
				rotation = 0;
				scale = 1;
				opacity = 1;
				zIndex = 10;
				pointerEvents = 'auto';
			} else if (currentDiff === -1) {
				// Left neighbor
				x = isMobile ? -180 : -420;
				y = isMobile ? 40 : 90;
				rotation = -12;
				scale = isMobile ? 0.78 : 0.85;
				opacity = 0.85;
				zIndex = 5;
				pointerEvents = 'auto';
			} else if (currentDiff === 1) {
				// Right neighbor
				x = isMobile ? 180 : 420;
				y = isMobile ? 40 : 90;
				rotation = 12;
				scale = isMobile ? 0.78 : 0.85;
				opacity = 0.85;
				zIndex = 5;
				pointerEvents = 'auto';
			} else if (currentDiff === -2) {
				// Far left neighbor (hidden/fade-out target for circular transitions)
				x = isMobile ? -320 : -780;
				y = isMobile ? 90 : 180;
				rotation = -24;
				scale = isMobile ? 0.6 : 0.7;
				opacity = 0;
				zIndex = 3;
				pointerEvents = 'none';
			} else if (currentDiff === 2) {
				// Far right neighbor (hidden/fade-in start for circular transitions)
				x = isMobile ? 320 : 780;
				y = isMobile ? 90 : 180;
				rotation = 24;
				scale = isMobile ? 0.6 : 0.7;
				opacity = 0;
				zIndex = 3;
				pointerEvents = 'none';
			} else {
				// Off-screen
				x = currentDiff < 0 ? (isMobile ? -450 : -1000) : (isMobile ? 450 : 1000);
				y = isMobile ? 150 : 280;
				rotation = currentDiff < 0 ? -36 : 36;
				scale = 0.5;
				opacity = 0;
				zIndex = 1;
				pointerEvents = 'none';
			}

			const isWrap = animate && Math.abs(currentDiff - prevDiff) > 1.5;

			// Apply card transformations
			ctx.add(() => {
				if (animate && !isWrap) {
					gsap.to(card, {
						x,
						y,
						rotation,
						scale,
						opacity,
						zIndex,
						pointerEvents,
						duration: 0.6,
						overwrite: 'auto'
					});
				} else {
					// Stop active transitions on this card to prevent fighting/sliding back
					gsap.killTweensOf(card);
					gsap.set(card, {
						x,
						y,
						rotation,
						scale,
						zIndex,
						pointerEvents
					});
					if (isWrap) {
						gsap.fromTo(card,
							{ opacity: 0 },
							{ opacity, duration: 0.6, ease: 'power2.out', overwrite: 'auto' }
						);
					} else {
						gsap.set(card, { opacity });
					}
				}
			});
		});

		// Animate the active dot along the Bezier curve
		ctx.add(() => {
			if (animate) {
				gsap.to(progressObj, {
					progress: index,
					duration: 0.6,
					ease: 'power2.out',
					overwrite: 'auto',
					onUpdate: () => {
						const t = itemsCount > 1 ? progressObj.progress / (itemsCount - 1) : 0.5;
						const pt = getBezierPoint(t, p0, p1, p2);
						if (activeDot) {
							gsap.set(activeDot, { attr: { cx: pt.x, cy: pt.y } });
						}
					}
				});
			} else {
				progressObj.progress = index;
				const t = itemsCount > 1 ? index / (itemsCount - 1) : 0.5;
				const pt = getBezierPoint(t, p0, p1, p2);
				if (activeDot) {
					gsap.set(activeDot, { attr: { cx: pt.x, cy: pt.y } });
				}
			}
		});

		// Update activeIndex to match current layout index
		activeIndex = index;
	}

	// Position items immediately without animation on startup
	updateLayout(activeIndex, false);

	// Handle screen resizes to adjust responsive offsets
	const onResize = () => {
		isMobile = window.innerWidth < 768;
		updateLayout(activeIndex, false);
	};
	window.addEventListener('resize', onResize);

	return {
		/**
		 * @param {CarouselParams} newParams
		 */
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
