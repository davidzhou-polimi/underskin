<script>
	import AboutSection from '$lib/components/sections/about/AboutSection.svelte';
</script>

<svelte:head>
	<title>About - UnderSkin</title>
	<meta name="description" content="Chi siamo e la filosofia dietro il progetto UnderSkin." />
</svelte:head>

<main id="about">
	<AboutSection />
</main>

<style>
	#about {
		width: 100%;
		background-color: var(--background-primary);
	}
</style>
