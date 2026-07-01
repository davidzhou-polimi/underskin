<script>
    import { onMount } from 'svelte';

    /** @type {HTMLElement | null} */
    let sectionRef = null;
    
    // Tracciamento dello scroll reattivo (Svelte 5 Runes)
    let scrollProgress = $state(0);
    let isMobile = $state(false);
    
    // Commento solo il PERCHÉ: su schermi mobili (<= 768px), la parola BURNOUT (che è larga 633vh) 
    // richiede uno spostamento orizzontale molto maggiore in vw rispetto a desktop per uscire dal viewport.
    let scrollMultiplier = $derived(isMobile ? 1300 : 520);
    let startOffset = $derived(isMobile ? 100 : 140);
    let burnoutPositionVw = $derived(startOffset - (scrollProgress * scrollMultiplier));
    let translateXValue = $derived(`translateX(${burnoutPositionVw}vw)`);

    // 1. IL PRIMO BLOCCO (Intro) viene spinto via da sinistra verso destra
    let introPushProgress = $derived(Math.max(0, Math.min(1, (60 - burnoutPositionVw) / 90)));
    let introScale = $derived(1 - (introPushProgress * 0.1)); // scala da 1 a 0.9
    let introTranslateXValue = $derived(`scale(${introScale}) translateX(${-introPushProgress * 120}vw)`);
    let introOpacityValue = $derived(Math.max(0, Math.min(1, 1 - (introPushProgress * 1.15))));
    let introBlur = $derived(introPushProgress * 10); // 0→10px blur sull'uscita

    // 2. IL SECONDO BLOCCO (Outro) entra da destra agganciato alla "T" di BURNOUT
    // Commento solo il PERCHÉ: su mobile il punto di coda si sposta proporzionalmente in avanti (1100vw) 
    // rispetto al valore desktop (350vw) a causa del moltiplicatore di scroll aumentato.
    let tailOffset = $derived(isMobile ? 1100 : 350);
    let tailOfBurnout = $derived(burnoutPositionVw + tailOffset); 

    // Il testo arriva da destra seguendo la T, e si pianta a 0 (centro esatto) quando la T raggiunge il centro
    let outroX = $derived(Math.max(0, tailOfBurnout));
    let outroOpacityValue = $derived(Math.max(0, Math.min(1, (60 - outroX) / 30)));
    let outroScale = $derived(0.9 + (outroOpacityValue * 0.1)); // scala da 0.9 a 1
    let outroTranslateXValue = $derived(`scale(${outroScale}) translateX(${outroX}vw)`);
    let outroBlur = $derived((1 - outroOpacityValue) * 8); // 8px→0 sull'entrata

    function handleScroll() {
        if (!sectionRef) return;
        
        isMobile = window.innerWidth <= 768;
        
        const rect = sectionRef.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        const totalScrollable = rect.height - windowHeight;
        if (totalScrollable <= 0) return;

        const scrolledPastTop = -rect.top;
        const progress = scrolledPastTop / totalScrollable;
        
        scrollProgress = Math.max(0, Math.min(1, progress));
    }

    onMount(() => {
        handleScroll(); 
    });
</script>

<svelte:window onscroll={handleScroll} onresize={handleScroll} />

<section class="performance-outer-container" bind:this={sectionRef}>
    <div class="sticky-viewport">
        
        <div class="text-container">
            <div
                class="text-wrapper intro-wrapper"
                style:transform={introTranslateXValue}
                style:opacity={introOpacityValue}
                style:filter="blur({introBlur}px)"
            >
                <h4 class="subtitle">La salute mentale non è separata dalla performance.</h4>
                <h2 class="main-title gradient-text animate-gradient-text my-archetypes-color">
                    È la performance.
                </h2>
            </div>

            <div
                class="text-wrapper new-spacing outro-wrapper"
                style:transform={outroTranslateXValue}
                style:opacity={outroOpacityValue}
                style:filter="blur({outroBlur}px)"
            >
                <h2 class="new-title">Il burnout nasce in silenzio.</h2>
                <h4 class="new-subtitle">
                    Cresce ogni volta che un atleta viene ridotto <br /> a un tempo, una medaglia, un risultato.
                </h4>
            </div>
        </div>

        <div class="marquee-container" style:transform={translateXValue}>
            <div class="glass-effect glass-text"></div>
        </div>
        
    </div>
</section>

<style>
    .performance-outer-container {
        height: 500vh; 
        position: relative;
        margin-top: var(--spacing-1);
        background-color: transparent;
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
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: var(--spacing-2);
        z-index: 1;
    }

    .text-wrapper {
        position: absolute; 
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: var(--spacing-5); 
        width: 100%;
        will-change: transform, opacity;
    }

    .text-wrapper.new-spacing {
        gap: var(--spacing-2); 
    }

    .intro-wrapper {
        z-index: 2;
        transform-origin: center;
    }

    .outro-wrapper {
        z-index: 4;
        transform-origin: center;
    }

    .subtitle {
        margin: 0;
        color: var(--content-primary, #ffffff);
        line-height: 1.2;
    }

    .main-title {
        margin: 0;
        line-height: 1.2;
    }

    .new-title {
        margin: 0;
        line-height: 1.2;
    }

    .new-subtitle {
        margin: 0;
        color: var(--content-primary, #ffffff);
        line-height: 1.5;
    }

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

    .glass-text {
        height: 105vh;
        width: 633.535vh;
        mask-image: url('../../../assets/BURNOUT.svg');
        mask-size: contain;
        mask-repeat: no-repeat;
        mask-position: center;
        display: block;
        border: none;
    }

    .my-archetypes-color {
        --gradient-c1: var(--archetipi-favorito, #6A96DF);
        --gradient-c2: var(--archetipi-insoddisfatto, #8035D2);
        --gradient-c3: var(--archetipi-infortunato, #D86146);
    }

    @media (max-width: 768px) {
        .text-container {
            /* Commento solo il PERCHÉ: aumenta il padding laterale su mobile 
               per evitare che i testi tocchino i bordi fisici dello schermo del telefono */
            padding: 0 var(--spacing-4);
        }

        .text-wrapper {
            /* Commento solo il PERCHÉ: riduce lo spazio verticale tra titolo 
               e sottotitolo su schermi mobili per renderlo compatto */
            gap: var(--spacing-3);
        }
    }
</style>
