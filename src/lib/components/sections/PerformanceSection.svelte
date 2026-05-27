<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    let sectionRef = null;
    
    // Tracciamento dello scroll reattivo (Svelte 5 Runes)
    let scrollProgress = $state(0);
    
    // Calcolo del movimento della scritta BURNOUT gigante
    let translateXValue = $derived(`translateX(calc(140vw - (${scrollProgress} * 520vw)))`);

    function handleScroll() {
        if (!sectionRef) return;
        
        const rect = sectionRef.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        const totalScrollable = rect.height - windowHeight;
        if (totalScrollable <= 0) return;

        const scrolledPastTop = -rect.top;
        const progress = scrolledPastTop / totalScrollable;
        
        scrollProgress = Math.max(0, Math.min(1, progress));
    }

    onMount(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);
        handleScroll(); 
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    });
</script>

<section class="performance-outer-container" bind:this={sectionRef}>
    <div class="sticky-viewport">
        
        <div class="text-container">
            {#if scrollProgress < 0.5}
                <div class="text-wrapper" out:fade={{ duration: 250 }} in:fade={{ duration: 250 }}>
                    <p class="subtitle">La salute mentale non è separata dalla performance.</p>
                    <h1 class="main-title gradient-text animate-gradient-text my-archetypes-color">
                        è la performance
                    </h1>
                </div>
            {:else}
                <div class="text-wrapper new-spacing" in:fade={{ duration: 250, delay: 250 }} out:fade={{ duration: 250 }}>
                    <h2 class="new-title">Il burnout nasce in silenzio.</h2>
                    <p class="new-subtitle">
                        Cresce ogni volta che un atleta viene ridotto <br /> a un tempo, una medaglia, un risultato.
                    </p>
                </div>
            {/if}
        </div>

        <div class="marquee-container" style:transform={translateXValue}>
            <span class="giant-text">BURNOUT</span>
        </div>
        
    </div>
</section>

<style>
    .performance-outer-container {
        height: 500vh; 
        position: relative;
        margin-top: var(--spacing-1);
        background-color: var(--background-primary, #000000);
        width: 100%;
    }

    .sticky-viewport {
        position: sticky;
        top: 0;
        height: 100vh;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden; 
    }

    /* Mantiene i blocchi perfettamente allineati al centro esatto della viewport */
    .text-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: var(--spacing-2); 
        z-index: 1; 
    }

    /* Struttura base dei blocchi di testo */
    .text-wrapper {
        position: absolute; /* Evita scatti e sovrapposizioni verticali durante il fade */
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: var(--spacing-5); /* Spacing 5 (40px) per il primo blocco */
        width: 100%;
    }

    /* Configurazione per il secondo blocco di testo */
    .text-wrapper.new-spacing {
        gap: var(--spacing-2); /* Spacing 2 (16px) esatto richiesto */
    }

    /* Stili Primo Blocco */
    .subtitle {
        margin: 0;
        font-family: 'Rethink Sans', var(--font-family-base), sans-serif;
        font-size: 24px;
        font-weight: 400; 
        color: var(--content-primary, #ffffff);
        line-height: 1.4;
    }

    .main-title {
        margin: 0;
        font-family: 'Rethink Sans', var(--font-family-base), sans-serif;
        font-size: 56px;
        font-weight: 700; 
        line-height: 1.2;
    }

    /* Stili Secondo Blocco */
    .new-title {
        margin: 0;
        font-family: 'Rethink Sans', var(--font-family-base), sans-serif;
        font-size: 56px;
        font-weight: 800; /* ExtraBold */
        color: var(--content-primary, #ffffff);
        line-height: 1.2;
    }

    .new-subtitle {
        margin: 0;
        font-family: 'Rethink Sans', var(--font-family-base), sans-serif;
        font-size: 24px;
        font-weight: 400; /* Regular */
        color: var(--content-primary, #ffffff);
        line-height: 30px; /* Interlinea a 30px */
    }

    /* Animazione e stile BURNOUT */
    .marquee-container {
        position: absolute;
        left: 0;
        top: 0;
        height: 100vh;
        white-space: nowrap;
        will-change: transform;
        pointer-events: none; 
        z-index: 3; 
        display: flex;
        align-items: center; 
    }

    .giant-text {
        font-family: 'Rethink Sans', var(--font-family-base), sans-serif;
        font-size: 1230px; 
        font-weight: 900; 
        color: var(--content-primary, #ffffff); 
        text-transform: uppercase;
        letter-spacing: -0.04em; 
        line-height: 0.8; 
    }

    .my-archetypes-color {
        --gradient-c1: var(--archetipi-favorito, #6A96DF);
        --gradient-c2: var(--archetipi-insoddisfatto, #8035D2);
        --gradient-c3: var(--archetipi-infortunato, #D86146);
    }
</style>