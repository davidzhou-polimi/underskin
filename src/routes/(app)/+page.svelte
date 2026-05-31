<script>
	// Importa qui in sequenza le macro-sezioni dalla cartella components/sections/
	import HeroSection from '$lib/components/sections/HeroSection.svelte';
</script>

<main>
	<!-- Impila qui le sezioni (l'aggiornamento dello store è gestito internamente tramite use:trackSection) -->
	<HeroSection />
	<section class="scroll-spacer" aria-hidden="true"></section>
</main>

<style>
    main {
        background: var(--background-primary);
    }

	.scroll-spacer {
		min-height: 120vh;
	}
</style>
