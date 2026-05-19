<script>
	import HeroSection from '$lib/components/sections/HeroSection.svelte';
	import ScrollBlob from '$lib/components/ui/ScrollBlob.svelte';
	import GradientBackgroundBlue from '$lib/components/ui/GradientBackgroundBlue.svelte';
</script>

<main class="stacked">
	<HeroSection />
	<ScrollBlob />
	<GradientBackgroundBlue />
</main>

<style>
	.stacked {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 0;
		gap: 0;
	}
</style>