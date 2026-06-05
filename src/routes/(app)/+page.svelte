<script>
    /**
     * SVELTE 5 - ORCHESTRATORE HOME PAGE (UNDER SKIN)
     * Caratteristiche:
     * 1. Amalgama i colori di tutti e tre gli archetipi in modo perfettamente equo e bilanciato.
     * 2. Utilizza le Svelte 5 Runes per il monitoraggio geometrico della viewport.
     * 3. Attiva una transizione cromatica accelerata e intensa in prossimità del Footer.
     * 4. Isola e preserva i listener di blocco dello scroll quando il Quiz è attivo.
     */

    import { onMount } from 'svelte';
    import { gsap } from 'gsap';
    import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
    
    // Importazione dei componenti strutturali del flusso di pagina
    import Intro from '$lib/components/sections/home/Intro.svelte';
    import Quiz from '$lib/components/sections/home/Quiz.svelte';
    import Performance from '$lib/components/sections/home/Performance.svelte';
    import ArchetypeSection from '$lib/components/sections/archetypes/ArchetypeSection.svelte';
    import Outro from '$lib/components/sections/home/Outro.svelte';
    import Burnout from '$lib/components/sections/home/Burnout.svelte';
    import Final from '$lib/components/sections/home/Final.svelte';
    import Footer from '$lib/components/sections/home/Footer.svelte';
    import InteractiveGradient from '$lib/components/ui/InteractiveGradient.svelte';
    

    // Stati reattivi per la gestione del blocco interattivo del Quiz
    let isLocked = $state(false);
    let quizExpanded = $state(false);
    let scrollY = $state(0);
    let innerHeight = $state(0);

    // Configurazione cromatica universale bilanciata per lo sfondo
    const defaultColors = [
        '#6a96df', // Favorito (Azzurro/Teal)
        '#8035d2', // Insoddisfatto (Viola)
        '#d86143'  // Infortunato (Arancione/Salmone)
    ];

    let activeConfig = $state({
        colors: defaultColors,
        speed: 0.45,
        noiseSteps: 6.0,
        mouseStrength: 0.15
    });

    onMount(() => {
        gsap.registerPlugin(ScrollTrigger);

        // Controllo e reattività cromatica in prossimità del footer della pagina
        ScrollTrigger.create({
            trigger: 'footer',
            start: 'top bottom',
            end: 'bottom bottom',
            onUpdate: (self) => {
                if (self.isActive) {
                    activeConfig.speed = 1.2;
                    activeConfig.noiseSteps = 12.0;
                } else {
                    activeConfig.speed = 0.45;
                    activeConfig.noiseSteps = 6.0;
                }
            },
            refreshPriority: 0.8
        });
    });

    /**
     * Intercetta e blocca i tentativi di scroll quando il quiz è attivo,
     * consentendo il normale scorrimento se il quiz è espanso a schermo intero.
     * @param {WheelEvent | TouchEvent} e - L'evento di input della finestra
     */
    function handlePreventScroll(e) {
        if (quizExpanded) return;

        if (isLocked && e.cancelable) {
            e.preventDefault();
        }
    }
</script>

<svelte:window
    bind:scrollY
    bind:innerHeight
    onwheel={handlePreventScroll}
    ontouchmove={handlePreventScroll}
/>

<InteractiveGradient config={activeConfig} />

<main class="page-flow">
    <Intro />
    <Quiz
        lockScroll={() => isLocked = true}
        unlockScroll={() => isLocked = false}
        onExpand={() => quizExpanded = true}
        onCollapse={() => quizExpanded = false}
    />
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

    :global(body) {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
        background-color: var(--bg-primary, #ffffff);
    }
</style>