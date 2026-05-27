<script>
	import HeroSection from '$lib/components/sections/HeroSection.svelte';
	// Importa la nuova sezione dell'Outro
	import OutroSection from '$lib/components/sections/OutroSection.svelte';
</script>

<main>
	<HeroSection />
	
	<OutroSection />
</main>

<style>
	main {
		width: 100%;
		min-height: 100vh;
		background-color: var(--background-primary);
	}
</style>