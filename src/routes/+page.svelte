<script>
	import ScrollBlob from '$lib/components/ui/ScrollBlob.svelte';
	import Grainient from '$lib/components/ui/Grainient.svelte';
	import TrailCanvasCCW from '$lib/components/ui/TrailCanvasCCW.svelte';
</script>

<main class="stacked">
	<ScrollBlob />
	<div style="width: 100%; height: 100vh; position: relative;">
		<Grainient
			color1="#ffffff"
			color2="#6A96DF"
			color3="#ffffff"
			timeSpeed={1}
			colorBalance={0.1}
			warpStrength={0}
			warpFrequency={5.1}
			warpSpeed={2}
			warpAmplitude={29}
			blendAngle={0}
			blendSoftness={0.05}
			rotationAmount={500}
			noiseScale={2}
			grainAmount={0.1}
			grainScale={2}
			grainAnimated={false}
			contrast={1}
			gamma={1}
			saturation={1}
			centerX={0}
			centerY={0}
			zoom={0.9}
		/>
	</div>
	<section class="trail-section">
		<TrailCanvasCCW />
	</section>
</main>

<style>
	.stacked {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 0;
		gap: 0;
	}

	.trail-section {
		width: 100%;
		height: 100vh;
		position: relative;
	}
</style>
