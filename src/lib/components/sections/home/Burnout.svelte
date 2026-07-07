<script>
    import { burnoutScroll } from '$lib/actions/home/burnoutScroll.js';
    import { burnoutMobile } from '$lib/actions/home/burnoutMobile.js';
</script>

<section class="performance-outer-container" use:burnoutScroll use:burnoutMobile>
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

        <div class="mobile-flow">
            <div class="m-word-layer" aria-hidden="true">
                <div class="glass-effect m-burnout-word"></div>
            </div>

            <div class="m-intro">
                <h4 class="subtitle">La salute mentale non è<br />separata dalla performance.</h4>
                <h2 class="m-title gradient-text animate-gradient-text my-archetypes-color">
                    È la performance.
                </h2>
            </div>

            <div class="m-hold">
                <div class="m-hold-target">
                    <svg viewBox="0 0 320 320" role="presentation" focusable="false">
                        <circle
                            cx="160"
                            cy="160"
                            r="157.89"
                            fill="none"
                            stroke="var(--content-primary)"
                            stroke-width="4"
                            stroke-dasharray="0 12.4"
                            stroke-linecap="round"
                        />
                    </svg>
                    <div class="m-hold-fill"></div>
                </div>
                <span class="m-hold-label">Tieni premuto</span>
            </div>

            <div class="m-outro">
                <h2 class="new-title">Il burnout nasce in silenzio.</h2>
                <h4 class="new-subtitle">
                    Cresce ogni volta che un atleta viene ridotto a un tempo, una medaglia, un risultato.
                </h4>
            </div>
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

    /* Su desktop esiste solo la sequenza orizzontale: il flusso mobile non occupa spazio */
    .mobile-flow {
        display: none;
    }

    @media (max-width: 768px) {
        /* Commento solo il PERCHÉ: su mobile lo scrub copre reveal del titolo, plateau di
           lettura e scorrimento sequenziale testi→cerchio: 400vh danno a ogni fase circa una
           schermata di corsa; il press-and-hold avviene poi a sezione ferma sul fondo */
        .performance-outer-container {
            height: 400vh;
        }

        .text-container,
        .marquee-container {
            display: none;
        }

        .mobile-flow {
            display: block;
            position: absolute;
            inset: 0;
            z-index: 1;
        }

        .m-word-layer {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            /* Commento solo il PERCHÉ: la parola trema via transform GSAP; un translate CSS di
               centratura verrebbe sovrascritto, quindi centra il wrapper flex e non l'elemento */
            pointer-events: none;
            z-index: 1;
        }

        .m-burnout-word {
            width: 140vw;
            aspect-ratio: 5376 / 891;
            flex: none;
            border: none;
            mask-image: url('../../../assets/BURNOUT.svg');
            mask-size: contain;
            mask-repeat: no-repeat;
            mask-position: center;
            /* Stato iniziale: è il press-and-hold a farla emergere */
            opacity: 0;
            will-change: transform, opacity;
        }

        .m-intro {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-7);
            padding: 0 var(--spacing-4);
            text-align: center;
            pointer-events: none;
            z-index: 2;
            /* Scorre via verso l'alto (translate scrubbato), non fa cross-fade col giochino */
            will-change: transform;
        }

        .m-title {
            margin: 0;
            line-height: 1.2;
            /* Stato iniziale (progress 0): rivelato dallo scroll, evita il flash pre-action */
            opacity: 0;
        }

        .m-hold {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-4);
            /* Commento solo il PERCHÉ: solo il bersaglio circolare cattura i tocchi; il layer
               a schermo intero deve lasciar passare i gesti di scroll nelle fasi di testo */
            pointer-events: none;
            z-index: 3;
            /* Stato iniziale: entra da sotto dopo l'uscita dei testi (autoAlpha via action) */
            opacity: 0;
            visibility: hidden;
            will-change: transform;
        }

        .m-hold-target {
            position: relative;
            width: min(32vw, 130px);
            aspect-ratio: 1;
            pointer-events: auto;
            /* La pressione prolungata non deve diventare scroll nativo né selezione */
            touch-action: none;
            user-select: none;
        }

        .m-hold-target svg {
            display: block;
            width: 100%;
            height: 100%;
        }

        .m-hold-fill {
            position: absolute;
            /* Rientro pari allo spessore del tratteggio: a scala 1 riempie il cerchio senza coprirlo */
            inset: 2.5%;
            border-radius: 50%;
            background-color: var(--content-primary);
            transform: scale(0);
            will-change: transform;
        }

        .m-hold-label {
            font-family: var(--font-family-base);
            /* Dimensione richiesta al valore DESKTOP della scala (16px): la media query
               globale dei token la ridurrebbe a 14px */
            font-size: 1rem; /* token approssimativo: --text-2xs a valore desktop */
            color: var(--content-primary);
            user-select: none;
        }

        .m-outro {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-2);
            padding: 0 var(--spacing-4);
            text-align: center;
            pointer-events: none;
            z-index: 4;
            opacity: 0;
            will-change: transform;
        }
    }
</style>
