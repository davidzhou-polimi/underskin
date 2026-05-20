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
			x: 550 + radius * Math.cos(angle),
			y: 550 + radius * Math.sin(angle),
			delay: (i / dotCount) * 1.5
		};
	});

	onMount(() => {
		const ctx = gsap.context(() => {
			const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.1 });

			gsap.set('.dot, .dot-right', { scale: 0, opacity: 0, transformOrigin: 'center' });

			tl.to('.dot', {
				scale: 1,
				opacity: 1,
				duration: 0.15,
				ease: 'back.out(2)',
				stagger: {
					each: 0.03,
					from: 'start'
				}
			})
				.to(
					'.dot-right',
					{
						scale: 1,
						opacity: 1,
						duration: 0.15,
						ease: 'back.out(2)',
						stagger: {
							each: 0.03,
							from: 'end'
						}
					},
					'<'
				)
				.to('.dot, .dot-right', {
					scale: 0,
					opacity: 0,
					duration: 0.15,
					ease: 'power2.in',
					stagger: {
						each: 0.03,
						from: 'end'
					}
				});

			gsap.to(circleContainer, {
				rotation: 360,
				duration: 2,
				ease: 'none',
				transformOrigin: '50% 50%'
			});

			gsap.to(circleContainerRight, {
				rotation: -360,
				duration: 2,
				ease: 'none',
				transformOrigin: '50% 50%'
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
			viewBox="0 0 1100 1100"
			xmlns="http://www.w3.org/2000/svg"
		>
			{#each dots as dot, i}
				<circle
					class="dot"
					cx={dot.x}
					cy={dot.y}
					r={dotRadius}
					fill="rgba(255, 255, 255, 0.2)"
				/>
			{/each}
		</svg>
	</div>

	<div class="decorative-circle right" data-node-id="600:765">
		<svg
			bind:this={circleContainerRight}
			class="circle-svg"
			viewBox="0 0 1100 1100"
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
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 100;
	}

	.decorative-circle {
		position: absolute;
		width: 1000px;
		height: 1000px;
	}

	.decorative-circle.left {
		top: -400px;
		left: -400px;
	}

	.decorative-circle.right {
		top: 200px;
		left: auto;
		right: -400px;
	}

	.circle-svg {
		width: 100%;
		height: 100%;
	}
</style>
