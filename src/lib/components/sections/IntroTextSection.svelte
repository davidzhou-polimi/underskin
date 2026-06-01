<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { trailCanvas } from '$lib/actions/trailCanvas.js';
	import { trackSection } from '$lib/actions/trackSection.js';
	import { scrollReveal } from '$lib/actions/scrollReveal.js';
	import { layers } from '$lib/stores/layers.svelte.js';

	let canvasAction = null;

	let opacity = $derived.by(() => {
		return layers.getLayerOpacity(0);
	});
	let layerStyle = $derived(layers.getLayerStyle(0));

	// Bind canvas per ottenere l'istanza dell'azione
	function bindCanvas(node) {
		canvasAction = trailCanvas(node);
		canvasAction.startLoop(false);
		return {
			destroy() {
				if (canvasAction) {
					canvasAction.destroy();
					canvasAction = null;
				}
			}
		};
	}
</script>

<section
	id="intro-text"
	class="intro-section"
	style:opacity={opacity}
	style={layerStyle}
	class:section-hidden={opacity === 0}
	use:trackSection={{ id: 'intro-text' }}
>
	<div class="canvas-layer">
		<canvas use:bindCanvas></canvas>
	</div>
	<div class="text-container" use:scrollReveal>
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
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background-color: var(--background-primary);
	}

	/* 当 opacity = 0 时彻底隐藏，释放布局空间 */
	.intro-section.section-hidden {
		display: none;
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

	/* reveal-hidden: stato iniziale GSAP — nascosto e sfocato */
	:global(.reveal-hidden) {
		opacity: 0;
		filter: blur(15px);
		transform: translateY(20px);
	}

	/* reveal-visible: prima riga già visibile all'avvio */
	:global(.reveal-visible) {
		opacity: 1;
		filter: blur(0px);
		transform: translateY(0);
	}
</style>
