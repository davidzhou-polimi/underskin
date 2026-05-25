<script>
	import GradientBackground from '$lib/components/ui/GradientBackground.svelte';
	import TrailCanvasCCW from '$lib/components/ui/TrailCanvasCCW.svelte';
</script>

<section class="page-section section-hero">
	<div class="canvas-layer">
		<GradientBackground />
	</div>
	<h1 class="hero-title">Milano-Cortina 2026</h1>
</section>

<section class="page-section section-next">
	<div class="canvas-layer">
		<TrailCanvasCCW />
	</div>
</section>

<style>
	.page-section {
		position: relative;
		width: 100%;
		height: 100vh;
		overflow: hidden;
	}

	.canvas-layer {
		position: absolute;
		inset: 0;
		z-index: 0;
	}

	.canvas-layer :global(canvas) {
		width: 100%;
		height: 100%;
	}

	.section-hero {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hero-title {
		position: absolute;
		z-index: 1;
		color: var(--content-primary);
		text-align: center;
		font-family: 'Rethink Sans', sans-serif;
		font-size: 56px;
		font-weight: 700;
		line-height: 60px;
		margin: 0;
	}
</style>
