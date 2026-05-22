<script>
    import { onMount } from 'svelte';

    let sectionRef = null;
    
    // Tracciamento dello scroll reattivo (Svelte 5 Runes)
    let scrollProgress = $state(0);
    
    // Ricalibrato il movimento: parte molto più a destra (140vw) e corre molto più a sinistra (-380vw)
    // Questo garantisce che anche a 1230px di dimensione la parola "BURNOUT" passi tutta dall'inizio alla fine
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
            <p class="subtitle">La salute mentale non è separata dalla performance.</p>
            <h1 class="main-title gradient-text animate-gradient-text my-archetypes-color">
                è la performance
            </h1>
        </div>

        <div class="marquee-container" style:transform={translateXValue}>
            <span class="giant-text">BURNOUT</span>
        </div>
        
    </div>
</section>

<style>
    /* 500vh assicura lo spazio di manovra per far sfilare una parola da 1230px */
    .performance-outer-container {
        height: 500vh; 
        position: relative;
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

    .text-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: var(--spacing-5); /* 40px */
        width: 100%;
        padding: var(--spacing-2); 
        z-index: 1; /* Sotto la scritta BURNOUT */
    }

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

    /* SISTEMATO: Ora si allinea perfettamente al centro esatto dello schermo senza scendere */
    .marquee-container {
        position: absolute;
        left: 0;
        top: 0;
        height: 100vh;
        white-space: nowrap;
        will-change: transform;
        pointer-events: none; 
        z-index: 3; /* Sopra a tutto */
        display: flex;
        align-items: center; /* Centra verticalmente il testo gigante */
    }

    .giant-text {
        font-family: 'Rethink Sans', var(--font-family-base), sans-serif;
        font-size: 1230px; 
        font-weight: 900; 
        color: var(--content-primary, #ffffff); 
        text-transform: uppercase;
        letter-spacing: -0.04em; 
        line-height: 0.8; /* Abbassata per stringere la bounding box ed evitare spostamenti verticali */
    }

    .my-archetypes-color {
        --gradient-c1: var(--archetipi-favorito, #6A96DF);
        --gradient-c2: var(--archetipi-insoddisfatto, #8035D2);
        --gradient-c3: var(--archetipi-infortunato, #D86146);
    }
</style>