<script>
	import { interactiveGradient } from '$lib/actions/interactiveGradient.js';
	import { scroll } from '$lib/stores/scroll.svelte.js';

	/** @type {{ config?: import('$lib/utils/interactiveGradientRenderer.js').GradientConfig }} */
	let { config = {} } = $props();

	/** @type {any} */
	let canvasElement;

	$effect(() => {
		if (canvasElement && canvasElement.__gradientRenderer) {
			canvasElement.__gradientRenderer.updateScroll(scroll.progress);
		}
	});
</script>

<canvas
	bind:this={canvasElement}
	use:interactiveGradient={{ config }}
	class="interactive-gradient-canvas"
></canvas>

<style>
	.interactive-gradient-canvas {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: -1;
		pointer-events: none;
		background-color: var(--background-primary);
	}
</style>
