<script>
    import HeroSection from '$lib/components/sections/HeroSection.svelte';
    // Importa la nuova sezione dell'Outro
    import OutroSection from '$lib/components/sections/OutroSection.svelte';
    import PerformanceSection from '$lib/components/sections/PerformanceSection.svelte';
</script>

<main>
	<HeroSection />
	
	<OutroSection />
    <PerformanceSection />
</main>

<style>
	main {
		width: 100%;
		min-height: 100vh;
		background-color: var(--background-primary);
	}
    .page-layout {
        display: flex;
        flex-direction: column;
        width: 100%;
        min-height: 100vh;
        background-color: var(--background-primary, #000000);
        /* Rimuovi overflow-x o hidden se lo sticky fa i capricci */
    }

    /* Assicurati che non ci siano padding globali nel main che falsano i posizionamenti */
    :global(body) {
        margin: 0;
        padding: 0;
    }
</style>