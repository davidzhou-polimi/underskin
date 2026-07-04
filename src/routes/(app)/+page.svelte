<script>
    /**
     * SVELTE 5 - ORCHESTRATORE HOME PAGE (UNDER SKIN)
     * Caratteristiche:
     * 1. Amalgama i colori di tutti e tre gli archetipi in modo perfettamente equo e bilanciato.
     * 2. Utilizza le Svelte 5 Runes per il monitoraggio geometrico della viewport.
     * 3. Attiva una transizione cromatica accelerata e intensa in prossimità del Footer.
     * 4. Isola e preserva i listener di blocco dello scroll quando il Quiz è attivo.
     */

    // Importazione dei componenti strutturali del flusso di pagina
    import IntroSection from '$lib/components/sections/home/IntroSection.svelte';
    import Preface from '$lib/components/sections/home/Preface.svelte';
    import Quiz from '$lib/components/sections/home/Quiz.svelte';
    import Performance from '$lib/components/sections/home/Performance.svelte';
    import ArchetypeSection from '$lib/components/sections/home/ArchetypeSection.svelte';
    import Outro from '$lib/components/sections/home/Outro.svelte';
    import Burnout from '$lib/components/sections/home/Burnout.svelte';
    import Final from '$lib/components/sections/home/Final.svelte';
    import Footer from '$lib/components/sections/Footer.svelte';
    import { trackScrollProgress } from '$lib/actions/trackScrollProgress.js';
    import { createFullPageGradientConfig } from '$lib/stores/scrollGradient.svelte.js';
    import { gradientConfig } from '$lib/stores/gradientConfig.svelte.js';
    import { cinematicScroll } from '$lib/actions/cinematicScroll.js';

    const gradient = createFullPageGradientConfig(undefined, true);

    // Propaga la config scroll-driven al canvas unico del layout (app).
    $effect(() => { gradientConfig.config = gradient.activeConfig; });
</script>

<svelte:window bind:scrollY={gradient.scrollY} bind:innerHeight={gradient.innerHeight} />

<main class="page-flow" use:trackScrollProgress use:cinematicScroll>
    <IntroSection />
    <Preface />
    <Quiz />
    <Performance />
	<ArchetypeSection />
    <Outro />
    <Burnout />
    <Final />
    <Footer />
</main>

<style>
    /* Mantiene il flusso di pagina strutturalmente trasparente per esporre il canvas in posizione fixed */
    .page-flow {
        position: relative;
        width: 100%;
        min-height: 100vh;
        background: transparent;
    }
</style>