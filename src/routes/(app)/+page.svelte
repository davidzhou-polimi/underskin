<script>
    import OutroSection from '$lib/components/sections/OutroSection.svelte';
    import FinaleSection from '$lib/components/sections/FinaleSection.svelte';
    import PerformanceSection from '$lib/components/sections/PerformanceSection.svelte';
</script>

<main>
    <OutroSection />
    <PerformanceSection />
    <FinaleSection />
</main>

<style>
    main {
        width: 100%;
        min-height: 100vh;
        background-color: var(--background-primary);
    }

    :global(body) {
        margin: 0;
        padding: 0;
        margin: 0;
    }

</style>
