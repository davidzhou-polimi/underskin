import { gsap } from 'gsap';

const ANGLE_STEP = 18; // degrees — must match carousel.js

/**
 * @typedef {Object} CarouselDotsParams
 * @property {number} [activeIndex]
 * @property {number} [itemsCount]
 * @property {number} [cx]      - SVG x of the dot arc circle center
 * @property {number} [cy]      - SVG y of the dot arc circle center
 * @property {number} [radius]  - Dot arc circle radius (R_nav)
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
		radius = 0
	} = params;

	// Per-dot proxy objects { diff } and their running tweens
	const dotProxies = new Map();
	const proxyTweens = new Map();

	/**
	 * @param {boolean} animate
	 */
	function updateLayout(animate = true) {
		const dots = node.querySelectorAll('.carousel-dot');

		dots.forEach((dot, i) => {
			let targetDiff = i - activeIndex;
			if (targetDiff > itemsCount / 2) targetDiff -= itemsCount;
			else if (targetDiff < -itemsCount / 2) targetDiff += itemsCount;

			// All navigation dots should be fully visible and opaque.
			const targetOpacity = 1;

			const absDiff = Math.abs(targetDiff);
			// Active dot gets the primary content color, side dots get a lower contrast neutral token.
			const targetColor = absDiff === 0 ? 'var(--content-primary)' : 'var(--neutral-500)';

			const prevProxy = dotProxies.get(dot);
			const prevDiff = prevProxy?.diff ?? targetDiff;

			// Kill existing proxy tween so we start from current animated position
			proxyTweens.get(dot)?.kill();

			if (!animate) {
				const angle = targetDiff * ANGLE_STEP * (Math.PI / 180);
				gsap.set(dot, {
					x: radius * Math.sin(angle),
					y: -radius * Math.cos(angle),
					opacity: targetOpacity,
					fill: targetColor
				});
				const proxy = prevProxy ?? { diff: targetDiff };
				proxy.diff = targetDiff;
				dotProxies.set(dot, proxy);
				return;
			}

			const isWrap = Math.abs(targetDiff - prevDiff) > 1.5;

			if (isWrap) {
				const angle = targetDiff * ANGLE_STEP * (Math.PI / 180);
				gsap.set(dot, {
					x: radius * Math.sin(angle),
					y: -radius * Math.cos(angle),
					opacity: 0,
					fill: targetColor
				});
				const proxy = prevProxy ?? { diff: targetDiff };
				proxy.diff = targetDiff;
				dotProxies.set(dot, proxy);
				gsap.to(dot, { opacity: targetOpacity, duration: 0.6, ease: 'power2.out' });
				return;
			}

			// Arc-following: tween diff, compute dot position per frame
			let proxy = prevProxy;
			if (!proxy) {
				proxy = { diff: prevDiff };
				dotProxies.set(dot, proxy);
			}

			const tween = gsap.to(proxy, {
				diff: targetDiff,
				duration: 0.6,
				ease: 'power2.out',
				onUpdate() {
					const angle = proxy.diff * ANGLE_STEP * (Math.PI / 180);
					gsap.set(dot, {
						x: radius * Math.sin(angle),
						y: -radius * Math.cos(angle)
					});
				}
			});
			proxyTweens.set(dot, tween);

			// Opacity and color/fill animated independently
			gsap.to(dot, {
				opacity: targetOpacity,
				fill: targetColor,
				duration: 0.6,
				ease: 'power2.out',
				overwrite: 'auto'
			});
		});
	}

	updateLayout(false);

	return {
		/** @param {CarouselDotsParams} newParams */
		update(newParams) {
			const indexChanged =
				newParams.activeIndex !== activeIndex || newParams.itemsCount !== itemsCount;
			const geomChanged =
				newParams.cx !== cx ||
				newParams.cy !== cy ||
				newParams.radius !== radius;

			activeIndex = newParams.activeIndex ?? activeIndex;
			itemsCount = newParams.itemsCount ?? itemsCount;
			cx = newParams.cx ?? cx;
			cy = newParams.cy ?? cy;
			radius = newParams.radius ?? radius;

			if (indexChanged) updateLayout(true);
			else if (geomChanged) updateLayout(false);
		},
		destroy() {
			proxyTweens.forEach(t => t.kill());
		}
	};
}
