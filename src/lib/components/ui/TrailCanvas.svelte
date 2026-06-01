<script>
	import { trailCanvas } from '$lib/actions/trailCanvas.js';
</script>

<div class="stage">
	<canvas use:trailCanvas></canvas>
</div>

<style>
	.stage {
		width: 100%;
		height: 100%;
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
