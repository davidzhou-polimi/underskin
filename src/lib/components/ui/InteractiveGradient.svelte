<script>
	import { interactiveGradient } from '$lib/actions/interactiveGradient.js';
	import { scroll } from '$lib/stores/scroll.svelte.js';
	import { scrollX } from '$lib/stores/scrollX.svelte.js';

	/**
	 * @typedef {Object} Props
	 * @property {import('$lib/utils/interactiveGradientRenderer.js').GradientConfig} [config]
	 * @property {boolean} [absolute] - Whether the canvas is absolute-positioned to its relative parent container
	 */

	/** @type {Props} */
	let { config = {}, absolute = false } = $props();

	/** @type {any} */
	let canvasElement;

	$effect(() => {
		if (canvasElement && canvasElement.__gradientRenderer) {
			canvasElement.__gradientRenderer.updateScrollY(scroll.viewports);
		}
	});

	$effect(() => {
		if (canvasElement && canvasElement.__gradientRenderer) {
			canvasElement.__gradientRenderer.updateScrollX(scrollX.viewports);
		}
	});
</script>

<canvas
	bind:this={canvasElement}
	use:interactiveGradient={{ config }}
	class="interactive-gradient-canvas"
	class:absolute
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

	/* Override fixed positioning to allow section-bound background rendering */
	.interactive-gradient-canvas.absolute {
		position: absolute;
	}
</style>
