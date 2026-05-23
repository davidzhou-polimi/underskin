<script>
	import { trailCanvasBlue2 } from '$lib/actions/trailCanvasBlue2.js';
</script>

<div class="canvas-container">
	<canvas use:trailCanvasBlue2></canvas>
</div>

<style>
	.canvas-container {
		width: 100%;
		height: 200vh;
		position: relative;
		z-index: 0;
		overflow: hidden;
			background: var(--stage-background-blue, #E0F2F9);
	}

	canvas {
		display: block;
		width: 100%;
		height: 100vh;
		position: sticky;
		top: 0;
		filter: blur(60px) saturate(1);
		will-change: filter;
	}
</style>
