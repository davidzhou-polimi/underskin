<script>
	import AthleteSection from '$lib/components/sections/AthleteSection.svelte';
	import ArchetypeSection from '$lib/components/sections/ArchetypeSection.svelte';
	import ContinueNarrationSection from '$lib/components/sections/ContinueNarrationSection.svelte';
</script>

<main>
	<!-- Impila qui le sezioni (l'aggiornamento dello store è gestito internamente tramite use:trackSection) -->
	<AthleteSection type="favorito" />
	<AthleteSection type="insoddisfatto" />
	<AthleteSection type="infortunato" />
	<ArchetypeSection />
	<ContinueNarrationSection archetype="favorito" />
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

