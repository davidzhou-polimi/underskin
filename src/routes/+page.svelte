<script>
	// Importa qui in sequenza le macro-sezioni dalla cartella components/sections/
	import HeroSection from '$lib/components/sections/HeroSection.svelte';
	import { trackScrollProgress } from '$lib/actions/trackScrollProgress.js';
</script>

<main use:trackScrollProgress>
	<!-- Impila qui le sezioni (l'aggiornamento dello store è gestito internamente tramite use:trackSection) -->
	<HeroSection />
	<section class="scroll-spacer" aria-hidden="true"></section>
</main>

<style>
	.scroll-spacer {
		min-height: 120vh;
	}
</style>
