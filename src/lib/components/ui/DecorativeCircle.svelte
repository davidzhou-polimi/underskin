<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	/** @type {SVGSVGElement | null} */
	let circleContainer;
	/** @type {SVGSVGElement | null} */
	let circleContainerRight;
	/** @type {HTMLDivElement | null} */
	let circleWrapper;

	const dotCount = 200;
	const radius = 500;
	const dotRadius = 3;

	const dots = Array.from({ length: dotCount }, (_, i) => {
		const angle = (i / dotCount) * 2 * Math.PI - Math.PI / 2;
		return {
			x: 650 + radius * Math.cos(angle),
			y: 650 + radius * Math.sin(angle)
		};
	});

	onMount(() => {
		if (!circleWrapper) return;
		const ctx = gsap.context(() => {
			gsap.set('.dot, .dot-right', { scale: 0, opacity: 0, transformOrigin: 'center' });

			gsap.to(circleContainer, {
				rotation: 360,
				duration: 3,
				ease: 'none',
				transformOrigin: '50% 50%'
			});

			gsap.to(circleContainerRight, {
				rotation: -360,
				duration: 3,
				ease: 'none',
				transformOrigin: '50% 50%'
			});

			gsap.to('.dot', {
				scale: 1,
				opacity: 1,
				duration: 0.5,
				ease: 'power2.out',
				stagger: {
					each: 0.015,
					from: 'start'
				}
			});

			gsap.to('.dot-right', {
				scale: 1,
				opacity: 1,
				duration: 0.5,
				ease: 'power2.out',
				stagger: {
					each: 0.015,
					from: 'end'
				},
				delay: 0.3,
				onComplete: () => {
					gsap.killTweensOf(circleContainer);
					gsap.killTweensOf(circleContainerRight);
					gsap.set(circleContainer, { rotation: 0 });
					gsap.set(circleContainerRight, { rotation: 0 });
				}
			});

		}, circleWrapper);

		return () => ctx.revert();
	});
</script>

<div class="circle-wrapper" bind:this={circleWrapper}>
	<div class="decorative-circle left" data-node-id="600:765">
		<svg
			bind:this={circleContainer}
			class="circle-svg"
			viewBox="0 0 1300 1300"
			xmlns="http://www.w3.org/2000/svg"
		>
			{#each dots as dot, i}
				<circle
					class="dot"
					cx={dot.x}
					cy={dot.y}
					r={dotRadius}
					fill="rgba(255, 255, 255, 0.1)"
				/>
			{/each}
		</svg>
	</div>

	<div class="decorative-circle right" data-node-id="600:765">
		<svg
			bind:this={circleContainerRight}
			class="circle-svg"
			viewBox="0 0 1300 1300"
			xmlns="http://www.w3.org/2000/svg"
		>
			{#each dots as dot, i}
				<circle
					class="dot dot-right"
					cx={dot.x}
					cy={dot.y}
					r={dotRadius}
					fill="rgba(255, 255, 255, 0.2)"
				/>
			{/each}
		</svg>
	</div>
</div>

<style>
	.circle-wrapper {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		min-height: 300px;
		overflow: hidden;
		z-index: 1;
	}

	.decorative-circle {
		position: absolute;
		width: 1300px;
		height: 1300px;
	}

	.decorative-circle.left {
		top: -500px;
		left: -600px;
	}

	.decorative-circle.right {
		top: 300px;
		left: auto;
		right: -400px;
	}

	.circle-svg {
		width: 100%;
		height: 100%;
	}

	:global(.dot), :global(.dot-right) {
		fill: rgba(255, 255, 255, 0.2) !important;
	}
</style>
