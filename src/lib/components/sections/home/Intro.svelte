<script>
	import { trailCanvas } from '$lib/actions/home/trailCanvas.js';
	import { trackSection } from '$lib/actions/trackSection.js';
	import { scrollReveal } from '$lib/actions/scrollReveal.js';
	import { introPin } from '$lib/actions/home/introPin.js';

	/** @type {any} */
	let canvasAction = null;

	/**
	 * Gestisce l'inizializzazione del canvas di sfondo
	 * @param {HTMLCanvasElement} node
	 */
	function bindCanvas(node) {
		canvasAction = trailCanvas(node);
		if (canvasAction) {
			canvasAction.startLoop(false);
		}
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
	use:introPin={{ end: '+=300%' }}
	use:trackSection={{ id: 'intro-text' }}
>
	<div class="canvas-layer">
		<canvas use:bindCanvas></canvas>
	</div>
	<div class="text-container" use:scrollReveal={{ end: '+=200%' }}>
		<p class="reveal-line">Milano-Cortina 2026</p>
		<p class="reveal-line">2.900 atleti</p>
		<p class="reveal-line">1 vita di sacrifici</p>
		<p class="reveal-line">4 anni di preparazione</p>
		<div class="reveal-line final-phrase">
			<span>Tutto per soli</span>
			<span class="break-line gradient-text animate-gradient-text dynamic-archetypes">
				120 secondi di performance
			</span>
		</div>
	</div>
</section>

<style>
	.intro-section {
		position: relative;
		width: 100%;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background-color: transparent;
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

	/* Consuma i token senza dichiarare o sovrascrivere variabili CSS locali */
	.dynamic-archetypes {
		background: linear-gradient(
			135deg,
			var(--archetipi-favorito),
			var(--archetipi-insoddisfatto),
			var(--archetipi-infortunato)
		);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	:global(.reveal-hidden) {
		opacity: 0;
		filter: blur(15px);
		transform: translateY(20px);
	}

	:global(.reveal-visible) {
		opacity: 1;
		filter: blur(0px);
		transform: translateY(0);
	}
</style>