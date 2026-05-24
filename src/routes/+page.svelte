<script>
	import GradientBackground from '$lib/components/ui/GradientBackground.svelte';
</script>

<main>
	<GradientBackground />
	<h1 class="hero-title">Milano-Cortina 2026</h1>
</main>

<style>
	main {
		position: relative;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hero-title {
		position: absolute;
		color: var(--content-primary);
		text-align: center;
		font-family: 'Rethink Sans', sans-serif;
		font-size: var(--text-xl:  3.5rem);
		font-weight: 700;
		line-height: 60px;
		margin: 0;
	}
</style>
