<script>
    import { burnoutScroll } from '$lib/actions/home/burnoutScroll.js';
</script>

<section class="performance-outer-container" use:burnoutScroll>
    <div class="sticky-viewport">

        <div class="text-container">
            <div class="text-wrapper intro-wrapper">
                <h4 class="subtitle">La salute mentale non è separata dalla performance.</h4>
                <h2 class="main-title gradient-text animate-gradient-text my-archetypes-color">
                    È la performance.
                </h2>
            </div>

            <div class="text-wrapper new-spacing outro-wrapper">
                <h2 class="new-title">Il burnout nasce in silenzio.</h2>
                <h4 class="new-subtitle">
                    Cresce ogni volta che un atleta viene ridotto <br /> a un tempo, una medaglia, un risultato.
                </h4>
            </div>
        </div>

        <div class="marquee-container">
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
        /* Stato iniziale (progress 0) applicato in CSS per evitare il flash
           prima che l'action burnoutScroll prenda il controllo */
        opacity: 0;
        transform: translateX(490vw);
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
        /* Stato iniziale (progress 0): la scritta parte fuori schermo a destra */
        transform: translateX(140vw);
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
</style>
