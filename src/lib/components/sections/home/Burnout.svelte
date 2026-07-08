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

    </div>

    <!-- Su mobile la sezione è pinnata via GSAP in un unico viewport:
         inizialmente il testo è centrato, poi si sposta in alto e fa entrare il cerchio. -->
    <div class="mobile-flow">
        <div class="m-container">
            <div class="m-text-sticky">
                <h4 class="subtitle">La salute mentale non è<br />separata dalla performance.</h4>
                <h2 class="m-title gradient-text animate-gradient-text my-archetypes-color">
                    È la performance.
                </h2>
            </div>

            <div class="m-word-layer" aria-hidden="true">
                <div class="glass-effect m-burnout-word m-burn-part"></div>
                <div class="glass-effect m-burnout-word m-out-part"></div>
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
                <h2 class="new-title">Il burnout nasce<br />in silenzio.</h2>
                <h4 class="new-subtitle">
                    Cresce ogni volta che un atleta<br />viene ridotto a un tempo, una<br />medaglia, un risultato.
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
        /* Commento solo il PERCHÉ: su mobile testi e cerchio sono due blocchi sequenziali in
           flusso — niente contenitore di scrub: l'altezza la dettano i blocchi stessi */
        .performance-outer-container {
            height: auto;
        }

        .sticky-viewport {
            display: none;
        }

        .mobile-flow {
            display: block;
            position: relative;
            height: 100svh;
            width: 100%;
            overflow: hidden;
        }

        .m-container {
            position: relative;
            height: 100svh;
            width: 100%;
            overflow: hidden;
        }

        .m-text-sticky {
            /* Commento solo il PERCHÉ: il pinning è delegato interamente a GSAP tramite 
               burnoutMobile. È posizionato in absolute ed allineato inizialmente al centro del viewport. */
            position: absolute;
            top: 50%;
            left: 0;
            width: 100%;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            /* Commento solo il PERCHÉ: gap ridotto a var(--spacing-4) (32px) per legare 
               maggiormente la frase introduttiva e la sua conclusione "È la performance." */
            gap: var(--spacing-3);
            padding: var(--spacing-12) var(--spacing-4) 0;
            box-sizing: border-box;
            text-align: center;
            z-index: 2;
        }

        .subtitle {
            /* Commento solo il PERCHÉ: valore mobile incrementato a var(--text-m) (20px) per 
               dare maggiore presenza visiva alla frase introduttiva prima dello scroll. */
            font-size: var(--text-m);
        }

        .m-title {
            margin: 0;
            line-height: 1.2;
            /* Stato iniziale (progress 0): rivelato dallo scroll, evita il flash pre-action */
            opacity: 0;
        }

        .m-word-layer {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            /* Commento solo il PERCHÉ: gap aumentato a var(--spacing-6) (48px) per evitare 
               collisioni o sovrapposizioni tra le scritte BURN e OUT. */
            gap: var(--spacing-6);
            pointer-events: none;
            /* Commento solo il PERCHÉ: z-index alzato a 4 (davanti a testi e cerchio) per 
               riprodurre l'effetto di sovrapposizione tridimensionale (vetro sopra i testi) presente su desktop. */
            z-index: 4;
        }

        .m-burnout-word {
            flex: none;
            border: none;
            opacity: 0;
            will-change: transform, opacity;
        }

        .m-burn-part {
            /* Commento solo il PERCHÉ: scala e maschera la prima parte del SVG ("BURN")
               portandola all'80vw di larghezza per riempire e dominare la scena su mobile */
            width: 80vw;
            aspect-ratio: 2953 / 891;
            mask-image: url('../../../assets/BURNOUT.svg');
            mask-size: 182.05% auto;
            mask-repeat: no-repeat;
            mask-position: left center;
        }

        .m-out-part {
            /* Commento solo il PERCHÉ: scala e maschera la seconda parte del SVG ("OUT")
               portandola alla stessa larghezza di BURN (80vw) per allineare geometricamente i blocchi. */
            width: 80vw;
            aspect-ratio: 2371 / 891;
            mask-image: url('../../../assets/BURNOUT.svg');
            mask-size: 226.74% auto;
            mask-repeat: no-repeat;
            mask-position: right center;
        }

        .m-hold {
            /* Commento solo il PERCHÉ: posizionamento assoluto centrato; la comparsa e la traslazione
               (y: 28vh, opacity: 1) avvengono in modo coordinato tramite la timeline di GSAP. */
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            /* Commento solo il PERCHÉ: gap ridotto a var(--spacing-2) (16px) per mantenere
               vicini cerchio ed etichetta, evitando tagli o occultamenti causati dalle safe area. */
            gap: var(--spacing-3);
            z-index: 3;
            opacity: 0;
            pointer-events: none;
        }

        .m-hold-target {
            position: relative;
            width: min(32vw, 130px);
            aspect-ratio: 1;
            /* La pressione prolungata non deve diventare scroll nativo né selezione */
            touch-action: none;
            user-select: none;
        }

        @keyframes m-circle-pulse {
            0% {
                opacity: 0.5;
                transform: scale(0.96);
            }
            50% {
                opacity: 1;
                transform: scale(1.04);
            }
            100% {
                opacity: 0.5;
                transform: scale(0.96);
            }
        }

        .m-hold-target svg {
            display: block;
            width: 100%;
            height: 100%;
            transform-origin: center;
            /* Commento solo il PERCHÉ: applica un'animazione pulsante all'anello tratteggiato 
               per catturare l'attenzione e rendere chiara l'interattività del bottone. */
            animation: m-circle-pulse 2s infinite ease-in-out;
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
            /* Commento solo il PERCHÉ: applica un padding-top di var(--spacing-12) (80px) in 
               linea con .m-text-sticky per allineare otticamente il testo finale sotto la Navbar. */
            padding: var(--spacing-12) var(--spacing-4) 0;
            text-align: center;
            pointer-events: none;
            /* Commento solo il PERCHÉ: z-index impostato a 5 per posizionarlo sopra il word-layer 
               in vetro al completamento del gioco. */
            z-index: 5;
            opacity: 0;
        }
    }
</style>
