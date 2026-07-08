<script>
	import { heroParallax } from '$lib/actions/archetypes/heroParallax.js';

	// Commento solo il PERCHÉ: memorizziamo il riferimento al container della sezione per passarlo come trigger dell'effetto ScrollTrigger di GSAP
	/** @type {HTMLElement | null} */
	let sectionRef = $state(null);
</script>

<section class="about-hero" bind:this={sectionRef}>
	<div class="sticky-viewport">
		<div class="text-container">
			{#if sectionRef}
				<h1 use:heroParallax={{ trigger: sectionRef }} class="title">
					IL PROGETTO
				</h1>
			{/if}
		</div>
	</div>
</section>

<style>
	.about-hero {
		position: relative;
		width: 100%;
		height: 100dvh;
		background-color: transparent;
	}

	.sticky-viewport {
		position: sticky;
		top: 0;
		left: 0;
		width: 100%;
		height: 100dvh;
		overflow: hidden;
	}

	.text-container {
		position: absolute;
		inset: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 10;
		padding: 0 var(--spacing-4);
		pointer-events: none;
	}

	.title {
		text-align: center;
		margin: 0;
		white-space: nowrap;
		word-wrap: normal;
		max-width: 100%;
		line-height: 1.05;
		color: var(--neutral-50);
		font-size: var(--text-title-size);
	}

	@media (max-width: 768px) {
		.title {
			font-size: var(--text-xl);
		}
	}
</style>

