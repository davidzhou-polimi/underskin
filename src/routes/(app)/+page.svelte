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
   import ArchetypeSection from '$lib/components/sections/ArchetypeSection.svelte';
    import Outro from '$lib/components/sections/home/Outro.svelte';
    import Burnout from '$lib/components/sections/home/Burnout.svelte';
    import Final from '$lib/components/sections/home/Final.svelte';
    import Footer from '$lib/components/sections/home/Footer.svelte';
    import InteractiveGradient from '$lib/components/ui/InteractiveGradient.svelte';

    // Stati reattivi per la gestione del blocco interattivo del Quiz
    let isLocked = $state(false);
    let quizExpanded = $state(false);
    
    // Tracciamento reattivo della finestra (Svelte 5 Runes)
    let scrollY = $state(0);
    let innerHeight = $state(0);

    onMount(() => {
        gsap.registerPlugin(ScrollTrigger);
    });

    /**
     * PALETTE CROMATICA UNIFICATA E PERFETTAMENTE BILANCIATA
     * Per evitare la prevalenza dell'arancione, i colori sono stati alternati uno a uno 
     * (Azzurro -> Viola -> Arancione) incrociando anche le tonalità (Chiaro / Medium / Scuro).
     * Questo costringe l'algoritmo del canvas a distribuire i pesi visivi in egual misura.
     */
    const TOTAL_COLORS = [
        "var(--azzurro-200)",            // Chiaro - Favorito
        "var(--viola-600)",              // Scuro  - Insoddisfatto
        "var(--arancione-200)",          // Chiaro - Infortunato
        
        "var(--archetipi-favorito)",     // Medium - Favorito
        "var(--viola-200)",              // Chiaro - Insoddisfatto
        "var(--arancione-600)",          // Scuro  - Infortunato
        
        "var(--azzurro-600)",            // Scuro  - Favorito
        "var(--archetipi-insoddisfatto)",// Medium - Insoddisfatto
        "var(--archetipi-infortunato)"   // Medium - Infortunato
    ];

    // LOGICA DI SCROLL COMPUTATA REATTIVAMENTE ($derived)
    
    // 1. Rileva se l'utente si trova nel corpo centrale della pagina (dopo la sezione Intro)
    let isPastFirstViewport = $derived(scrollY > innerHeight / 1.5);

    // 2. Rileva con precisione quando l'utente raggiunge la fine della pagina (Final e Footer)
    let isNearPageBottom = $derived(
        typeof document !== 'undefined' && 
        scrollY > (document.documentElement.scrollHeight - innerHeight * 1.8)
    );

    // 3. Generazione dinamica della configurazione dello sfondo in base alla posizione di scroll
    let activeConfig = $derived(
        isNearPageBottom
            ? {
                  colors: TOTAL_COLORS,
                  speed: 2.2,          // Accelerazione visiva d'impatto sul Footer
                  coverage: 1.0,        // Copertura totale immersiva per il finale della pagina
                  focusCenter: [0.5, -0.1],
                  focusRadius: [1.4, 1.0]
              }
            : isPastFirstViewport
                ? { 
                      colors: TOTAL_COLORS,
                      coverage: 0.35,   // Trasparenza controllata ed elegante sotto i testi centrali
                      speed: 0.6 
                  }
                : {
                      colors: TOTAL_COLORS,
                      coverage: 0.5,    // Presenza intermedia e stabile nella sezione iniziale Intro
                      speed: 0.8
                  }
    );

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
        /* Isola lo scorrimento orizzontale prevenendo anomalie visive dovute alle Cards o animazioni GSAP */
        overflow-x: hidden;
        background-color: var(--background-primary);
    }
</style>
