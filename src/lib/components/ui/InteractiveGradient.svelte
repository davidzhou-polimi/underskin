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
		left: 0;
		width: 100vw;
		/* fallback per browser senza svh/lvh: comportamento storico */
		top: 0;
		height: 100vh;
		/* Copre il viewport lungo (bottom a 100lvh, nessuna striscia scoperta a URL bar ritratta)
		   col CENTRO a 50svh, dove è centrato il titolo dell'intro: top = svh−lvh (sborda sopra,
		   invisibile), height = 2·lvh − svh. Il box è statico rispetto alla URL bar (niente thrash
		   del resize). Su desktop svh == lvh → top: 0, height: 100vh: identico a prima. */
		top: calc(100svh - 100lvh);
		height: calc(200lvh - 100svh);
		z-index: -1;
		pointer-events: none;
		background-color: var(--background-primary);
	}

	/* Override fixed positioning to allow section-bound background rendering */
	.interactive-gradient-canvas.absolute {
		position: absolute;
	}
</style>
