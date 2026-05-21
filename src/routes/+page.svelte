<script>
    import HeroSection from '$lib/components/sections/HeroSection.svelte';
    import PerformanceSection from '$lib/components/sections/PerformanceSection.svelte';
</script>

<main class="page-layout">
    <HeroSection />
    
    <PerformanceSection />
</main>

<style>
    /* Forza il main a gestire correttamente il flusso verticale delle macro-sezioni */
    .page-layout {
        display: flex;
        flex-direction: column;
        width: 100%;
        min-height: 100vh;
        background-color: var(--background-primary, #000000);
        /* Evita che i margini dei figli collassino sballando i calcoli di offsetTop */
        overflow-x: hidden;
    }

    /* Assicurati che non ci siano padding globali nel main che falsano i posizionamenti */
    :global(body) {
        margin: 0;
        padding: 0;
    }
</style>