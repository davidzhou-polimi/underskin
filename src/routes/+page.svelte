<script>
	// Importa qui in sequenza le macro-sezioni dalla cartella components/sections/
	import HeroSection from '$lib/components/sections/HeroSection.svelte';
	import IntrusiveThoughts from '$lib/components/sections/IntrusiveThoughts.svelte';
	import FavoritotextSection from '$lib/components/sections/FavoritotextSection.svelte';
	import ZoomTransitionSection from '$lib/components/sections/ZoomTransitionSection.svelte';
</script>

<main>
	<!-- Impila qui le sezioni (l'aggiornamento dello store è gestito internamente tramite use:trackSection) -->
	<HeroSection />
	<IntrusiveThoughts />
	<FavoritotextSection />
	<ZoomTransitionSection />
</main>


<style>
	main {
		width: 100%;
		min-height: 100vh;
		background-color: var(--background-primary);
		overflow-x: hidden;
	}
</style>