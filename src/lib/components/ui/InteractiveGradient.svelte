<script>
	import { interactiveGradient } from '$lib/actions/interactiveGradient.js';
</script>

<!-- Renders the full-screen interactive background. The canvas is controlled by a custom WebGL Svelte Action -->
<canvas use:interactiveGradient class="interactive-gradient-canvas"></canvas>

<style>
	/* Position fixed to screen boundary behind all section wrappers */
	.interactive-gradient-canvas {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: -1;
		pointer-events: none; /* Allows click events to pass through to normal page contents */
		background-color: var(--background-primary); /* Uses design token fallback if WebGL fails context init */
	}
</style>
