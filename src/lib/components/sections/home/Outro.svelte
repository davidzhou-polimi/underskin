<script>
    import { trackSection } from '$lib/actions/trackSection.js';
    import { outroScrollAnimation } from '$lib/actions/home/outroScrollAnimation.js';
</script>

<section class="outro-scroll-container" aria-label="Titolo sul dopo podio" use:trackSection>
    <div class="scene" use:outroScrollAnimation>
        <h2 class="podium-title">
            Questo è ciò che non si vede sul podio:
        </h2>

        <div class="circle-stage">
            <svg
                class="dotted-circle"
                viewBox="0 0 471 471"
                preserveAspectRatio="xMidYMid meet"
                width="100%"
                height="100%"
                role="presentation"
                focusable="false"
            >
                <defs>
                    <linearGradient id="outro-circle-gradient" x1="0%" y1="100%" x2="100%" y2="0%" gradientUnits="objectBoundingBox">
                        <animateTransform
                            attributeName="gradientTransform"
                            type="translate"
                            from="-1 0"
                            to="1 0"
                            dur="6s"
                            repeatCount="indefinite"
                        />
                        <stop offset="0%" stop-color="var(--archetipi-insoddisfatto)" />
                        <stop offset="50%" stop-color="var(--azzurro-500)" />
                        <stop offset="100%" stop-color="var(--arancione-500)" />
                    </linearGradient>
                </defs>

                <!-- Cerchio di sfondo a puntini, con raggio 230 e densità/aspetto allineati a Quiz.svelte -->
                <circle
                    cx="235.5"
                    cy="235.5"
                    r="230"
                    fill="none"
                    stroke="var(--content-primary)"
                    stroke-width="4"
                    stroke-linecap="round"
                    stroke-dasharray="0 18.06"
                />

                <!-- Cerchio di avanzamento (reveal), raggio 230 per evitare clipping laterali -->
                <circle
                    class="reveal-circle"
                    cx="235.5"
                    cy="235.5"
                    r="230"
                    fill="none"
                    stroke="url(#outro-circle-gradient)"
                    stroke-width="6"
                    stroke-linecap="round"
                    pathLength="100"
                    stroke-dasharray="0 100"
                    transform="rotate(-90 235.5 235.5)"
                />

                <!-- Testo percentuale con token --text-title-size / --text-2xl (128px) -->
                <text class="circle-percentage" x="235.5" y="225" text-anchor="middle" dominant-baseline="middle">
                    0%
                </text>

                <!-- Testo descrittivo con token --text-caption-size / --text-s (24px) -->
                <text class="circle-description" x="235.5" y="300" text-anchor="middle">
                </text>
            </svg>
        </div>
    </div>
</section>

<style>
    /* Altezza totale della sezione per permettere uno scorrimento prolungato (scrollytelling) */
    .outro-scroll-container {
        position: relative;
        height: calc(100vh * 7);
        background-color: transparent;
        width: 100%;
    }

    /* Contenitore bloccato in sticky durante lo scroll della sezione */
    .scene {
        position: sticky;
        top: 0;
        height: 100vh;
        width: 100%;
        display: block;
        overflow: hidden;
    }

    /* Titolo posizionato inizialmente al centro perfetto dello schermo */
    .podium-title {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: max-content;
        white-space: nowrap;
        line-height: 1.25;
        margin: 0;
        text-align: center;
        will-change: transform, top, opacity;
    }

    /* Area centrale del cerchio e delle statistiche, posizionata responsivamente sotto il titolo finale */
    .circle-stage {
        position: absolute;
        left: 50%;
        top: 58%;
        transform: translate(-50%, -50%);
        width: min(80vw, 50vh, 470px);
        height: min(80vw, 50vh, 470px);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        will-change: opacity;
    }

    /* Grafica SVG del cerchio a tutto schermo per l'area assegnata */
    .dotted-circle {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
        flex: none;
    }

    /* Stile tipografico per il numero percentuale centrale */
    .circle-percentage {
        font-family: var(--font-family-base);
        font-size: var(--text-title-size);
        font-weight: var(--text-title-weight);
        fill: var(--content-primary);
    }

    /* Stile tipografico per la descrizione sotto la percentuale */
    .circle-description {
        font-family: var(--font-family-base);
        font-size: var(--text-caption-size);
        /* Commento solo il PERCHÉ: allinea la descrizione dello stage al peso bold globale */
        font-weight: var(--text-bold);
        fill: var(--content-primary);
        will-change: opacity;
    }
</style>