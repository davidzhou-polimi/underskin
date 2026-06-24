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
 * Svelte action that positions carousel items along a circular arc using GSAP.
 * Cards follow the arc exactly during animation by tweening the angle (diff)
 * instead of x/y coordinates directly.
 * @param {HTMLElement} node - The carousel track container
 * @param {CarouselParams} params
 */
export function carousel(node, params = {}) {
	let activeIndex = params.activeIndex ?? 0;
	let itemsCount = params.itemsCount ?? 0;

	const ctx = gsap.context(() => {}, node);

	// Per-card proxy objects { diff } and their running tweens
	const cardProxies = new Map();
	const proxyTweens = new Map();

	// Gestione dell'hover per portare l'opacità a 1 sulle carte laterali
	const cards = node.querySelectorAll('.carousel-item');
	/** @type {Array<{card: Element, enterHandler: () => void, leaveHandler: () => void}>} */
	const hoverListeners = [];

	cards.forEach((card, i) => {
		const enterHandler = () => {
			let currentDiff = i - activeIndex;
			if (currentDiff > itemsCount / 2) currentDiff -= itemsCount;
			else if (currentDiff < -itemsCount / 2) currentDiff += itemsCount;
			if (Math.abs(currentDiff) === 1) {
				gsap.to(card, { opacity: 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
			}
		};

		const leaveHandler = () => {
			let currentDiff = i - activeIndex;
			if (currentDiff > itemsCount / 2) currentDiff -= itemsCount;
			else if (currentDiff < -itemsCount / 2) currentDiff += itemsCount;
			if (Math.abs(currentDiff) === 1) {
				gsap.to(card, { opacity: 0.85, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
			}
		};

		card.addEventListener('mouseenter', enterHandler);
		card.addEventListener('mouseleave', leaveHandler);
		hoverListeners.push({ card, enterHandler, leaveHandler });
	});

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
			const targetOpacity = absDiff === 0 ? 1 : absDiff === 1 ? 0.85 : 0;
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
			if (newParams.activeIndex !== activeIndex || newParams.itemsCount !== itemsCount) {
				// Update itemsCount first; keep activeIndex at old value so prevDiff is correct
				itemsCount = newParams.itemsCount ?? itemsCount;
				const newIndex = newParams.activeIndex ?? activeIndex;
				updateLayout(newIndex, true);
				// activeIndex is set to newIndex at the end of updateLayout
			}
		},
		destroy() {
			window.removeEventListener('resize', onResize);
			proxyTweens.forEach(t => t.kill());
			hoverListeners.forEach(({ card, enterHandler, leaveHandler }) => {
				card.removeEventListener('mouseenter', enterHandler);
				card.removeEventListener('mouseleave', leaveHandler);
			});
			ctx.revert();
		}
	};
}
