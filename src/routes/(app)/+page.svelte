<script>
	import AthleteSection from '$lib/components/sections/AthleteSection.svelte';
</script>

<main>
	<!-- Impila qui le sezioni (l'aggiornamento dello store è gestito internamente tramite use:trackSection) -->
	<AthleteSection type="favorito" />
	<AthleteSection type="insoddisfatto" />
	<AthleteSection type="infortunato" />
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

