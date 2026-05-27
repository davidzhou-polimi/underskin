<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	/** @type {SVGSVGElement | null} */
	let circleContainer = null;
	/** @type {SVGSVGElement | null} */
	let circleContainerRight = null;

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
		if (!circleContainer || !circleContainerRight) return;

		const cLeft = circleContainer;
		const cRight = circleContainerRight;

		const ctx = gsap.context(() => {
			gsap.set('.dot, .dot-right', { scale: 0, opacity: 0, transformOrigin: 'center' });

			gsap.to(cLeft, {
				rotation: 360,
				duration: 3,
				ease: 'none',
				transformOrigin: '50% 50%'
			});

			gsap.to(cRight, {
				rotation: -360,
				duration: 3,
				ease: 'none',
				transformOrigin: '50% 50%'
			});

			gsap.to('.dot', {
				scale: 1,
				opacity: 1,
				duration: 1,
				stagger: {
					amount: 1.5,
					from: 'start',
					grid: 'auto'
				},
				ease: 'power2.out',
				onComplete: () => {
					gsap.to(cLeft, {
						rotation: '+=360',
						duration: 45,
						repeat: -1,
						ease: 'none'
					});
				}
			});

			gsap.to('.dot-right', {
				scale: 1,
				opacity: 1,
				duration: 1,
				stagger: {
					amount: 1.5,
					from: 'end',
					grid: 'auto'
				},
				ease: 'power2.out',
				onComplete: () => {
					gsap.to(cRight, {
						rotation: '-=360',
						duration: 45,
						repeat: -1,
						ease: 'none'
					});
				}
			});

			gsap.timeline({
				scrollTrigger: {
					trigger: '.blob-section',
					start: 'top top',
					end: 'bottom top',
					scrub: true,
					onLeave: () => {
						gsap.set(cLeft, { rotation: 0 });
						gsap.set(cRight, { rotation: 0 });
					}
				}
			});
		});

		return () => ctx.revert();
	});
</script>

<div class="decorative-circle left" data-node-id="600:765">
	<svg
		bind:this={circleContainer}
		class="circle-svg"
		viewBox="0 0 1300 1300"
		xmlns="http://www.w3.org/2000/svg"
	>
		{#each dots as dot}
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
		{#each dots as dot}
			<circle
				class="dot dot-right"
				cx={dot.x}
				cy={dot.y}
				r={dotRadius}
				fill="rgba(255, 255, 255, 0.1)"
			/>
		{/each}
	</svg>
</div>

<style>
	.decorative-circle {
		position: absolute;
		/* Ridotta la dimensione generale del cerchio per renderlo più piccolo come in "giusto" */
		width: 70vw;
		height: 70vw;
		/* max-width: 1000px;
		max-height: 1000px; */
		pointer-events: none;
		z-index: 1;
	}

	/* Cerchio di sinistra: Spostato in alto e parzialmente fuori a sinistra */
	.left {
		top: -50%;
		left: -30%;
	}

	/* Cerchio di destra: Spostato in basso e parzialmente fuori a destra */
	.right {
		bottom: -50%;
		right: -30%;
	}

	.circle-svg {
		width: 100%;
		height: 100%;
		overflow: visible;
	}
</style>