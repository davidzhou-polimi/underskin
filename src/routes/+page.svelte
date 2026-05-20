<script>
	// Importa qui in sequenza le macro-sezioni dalla cartella components/sections/
	import HeroSection from '$lib/components/sections/HeroSection.svelte';
	import IntrusiveThoughts from '$lib/components/sections/IntrusiveThoughts.svelte';
</script>

<main>
	<!-- Impila qui le sezioni (l'aggiornamento dello store è gestito internamente tramite use:trackSection) -->
	<HeroSection />
	<IntrusiveThoughts />
</main>
