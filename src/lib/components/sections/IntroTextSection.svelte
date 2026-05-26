<script>
	import { trailCanvas } from '$lib/actions/trailCanvas.js';
	import { scrollTextReveal } from '$lib/actions/scrollTextReveal.js';
	import { trackSection } from '$lib/actions/trackSection.js';
</script>

<section id="intro-text" class="intro-section" use:trackSection use:scrollTextReveal>
	<div class="canvas-layer">
		<canvas use:trailCanvas></canvas>
	</div>
	<div class="text-container">
		<p class="reveal-line">Milano-Cortina 2026</p>
		<p class="reveal-line">2.900 atleti</p>
		<p class="reveal-line">1 vita di sacrifici</p>
		<p class="reveal-line">4 anni di preparazione</p>
		<div class="reveal-line final-phrase">
			<span>Tutto per soli</span>
			<span class="break-line gradient-text animate-gradient-text my-archetypes-color">120 secondi di performance</span>
		</div>
	</div>
</section>

<style>
	.intro-section {
		position: relative;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background-color: var(--background-primary);
	}

	.canvas-layer {
		position: absolute;
		inset: 0;
		z-index: 0;
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
		filter: blur(60px) saturate(1);
		will-change: filter;
	}

	.text-container {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		align-items: center;
		justify-items: center;
		text-align: center;
		width: 100%;
		padding: var(--spacing-4);
	}

	.reveal-line {
		grid-area: 1 / 1 / 2 / 2;
		margin: var(--spacing-0);

		font-size: var(--text-important-size);
		font-weight: var(--text-important-weight);
		color: var(--content-primary);

		font-family: var(--font-family-base);
		line-height: 1.4;
	}

	.final-phrase {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.break-line {
		display: block;
		margin-top: var(--spacing-1);
	}

	.my-archetypes-color {
		--gradient-c1: var(--archetipi-favorito);
		--gradient-c2: var(--archetipi-insoddisfatto);
		--gradient-c3: var(--archetipi-infortunato);
	}
</style>
