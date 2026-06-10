<script>
    import { onMount } from 'svelte';
    // Commento solo il PERCHÉ: Importa l'azione fadeUp per applicare una transizione di
    // ingresso fluida al montaggio del componente.
    import { fadeUp } from '$lib/actions/fadeUp.js';

    /** @type {SVGTextElement | null} */
    let textEl = null;
    /** @type {SVGSVGElement | null} */
    let svgEl = null;

    // Funzione per calcolare l'ingombro geometrico esatto dei glifi vettoriali
    function updateSvgViewBox() {
        if (textEl && svgEl) {
            const bbox = textEl.getBBox();
            // Imposta il viewBox esattamente partendo dall'origine della 'U' (bbox.x)
            // fino alla fine della 'n' (bbox.width), eliminando ogni sfasamento.
            svgEl.setAttribute(
                'viewBox', 
                `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
            );
        }
    }

    onMount(() => {
        updateSvgViewBox();

        // Ricalcola non appena il font personalizzato è stato renderizzato nel DOM
        if (document && document.fonts) {
            document.fonts.ready.then(() => {
                updateSvgViewBox();
            });
        }
    });
</script>

<footer class="hero-footer" use:fadeUp={{ duration: 1.2, delay: 0.1, y: 30 }}>
    <!-- L'SVG riempie il 100% dello spazio orizzontale disponibile tra i padding laterali -->
    <svg bind:this={svgEl} class="footer-brand-svg" preserveAspectRatio="none">
        <text 
            bind:this={textEl}
            x="0" 
            y="0" 
            dominant-baseline="hanging" 
            text-anchor="start" 
            class="brand-text"
        >
            UnderSkin
        </text>
    </svg>
    <div class="footer-bottom">
        <span class="footer-text">Laboratorio di Web e Digital Design, a.a. 2025/26</span>
        <span class="footer-text">© 2026</span>
    </div>
</footer>

<style>
    /* Commento solo il PERCHÉ: Posiziona il footer nel flusso e lo solleva di 30vh per farlo entrare in anticipo sullo schermo sopra lo spazio vuoto della sezione soprastante. */
    .hero-footer {
        position: relative;
        margin-top: -45vh;
        padding-block-end: var(--spacing-6);
        display: flex;
        flex-direction: column;
        align-items: center;
        z-index: 2;
        background: transparent;
        width: 100%;
        box-sizing: border-box;
    }

    /* Commento solo il PERCHÉ: Applica il padding-inline per allineare l'SVG 
       ai margini esatti della Navbar di UnderSkin. */
    .footer-brand-svg {
        display: block;
        width: 100%;
        height: auto;
        padding-inline: var(--spacing-6);
        box-sizing: border-box;
        margin-block-end: -20px; /* Aiuta a ridurre ulteriormente il bounding box virtuale sotto */
        overflow: visible;
    }

    /* Commento solo il PERCHÉ: Font-size stabile ad alta risoluzione per permettere 
       un calcolo perfetto delle coordinate vettoriali. */
    .brand-text {
        font-family: "Rethink Sans", Arial, sans-serif;
        font-size: 500px; 
        font-weight: 1000;
        fill: color-mix(in srgb, var(--content-dark-primary) 70%, transparent);
        letter-spacing: -0.02em;
    }

    /* Commento solo il PERCHÉ: Distribuisce le note informative toccando i medesimi margini. */
    .footer-bottom {
        display: flex;
        justify-content: space-between;
        padding-inline: var(--spacing-6); /* Perfettamente coordinato con l'SVG sopra */
        width: 100%;
        box-sizing: border-box;
        
        /* MODIFICA QUESTO VALORE: */
        /* Usando un valore negativo (es. -30px), tiri su i testi sotto 
           andando a mangiare lo spazio vuoto lasciato dall'SVG. 
           Puoi aumentarlo a -40px o diminuirlo a -15px finché non è perfetto per te! */
        margin-block-start: -30px;
    }

    .footer-text {
        font-size: var(--text-service-size);
        font-weight: var(--text-service-weight);
        color: var(--content-dark-primary);
    }

    @media (max-width: 768px) {
        .footer-bottom {
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-2);
            text-align: center;
        }
    }
</style>