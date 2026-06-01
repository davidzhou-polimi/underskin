<script>
	import { trailCanvasCCW } from '$lib/actions/trailCanvasCCW.js';
</script>

<div class="stage">
	<canvas use:trailCanvasCCW></canvas>
</div>

<style>
	.stage {
		width: 100vw;
		height: 100vh;
		background: var(--stage-background, #ffffff);
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
