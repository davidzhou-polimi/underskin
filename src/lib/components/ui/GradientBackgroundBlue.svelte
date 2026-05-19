<script>
	import { trailCanvasBlue } from '$lib/actions/trailCanvasBlue.js';
</script>

<div class="stage">
	<canvas use:trailCanvasBlue></canvas>
</div>

<style>
	.stage {
		width: 100vw;
		height: 100vh;
		background: var(--color-stage-background, #ffffff);
		overflow: hidden;
		position: relative;
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
		filter: blur(60px) saturate(1);
		will-change: filter;
	}
</style>
