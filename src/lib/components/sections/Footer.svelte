<script>
    import { onMount } from 'svelte';
    // Commento solo il PERCHÉ: Importa l'azione fadeUp per applicare una transizione di
    // ingresso fluida al montaggio del componente.
    import { fadeUp } from '$lib/actions/fadeUp.js';
    // Commento solo il PERCHÉ: Importa lo store globale per controllare la visibilità
    // e il testo del tooltip al passaggio del mouse.
    import { tooltip } from '$lib/stores/tooltipState.svelte.js';
    // Commento solo il PERCHÉ: Importa goto di SvelteKit per navigare programmaticamente 
    // a una pagina senza mostrare l'anteprima dell'URL nel browser all'hover.
    import { goto } from '$app/navigation';

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
    <!-- Commento solo il PERCHÉ: Utilizza un pulsante per consentire la navigazione programmatica a /about 
         senza attivare l'anteprima nativa dell'URL del browser nella barra di stato in basso all'hover. -->
    <button 
        type="button"
        class="footer-brand-link"
        aria-label="UnderSkin - Scopri il progetto"
        onmouseenter={() => tooltip.show("Scopri il progetto", "semplice", "pointer")}
        onmouseleave={() => tooltip.hide()}
        onclick={() => goto('/about')}
    >
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
    </button>
    <div class="footer-bottom">
        <p class="footer-text">Laboratorio di Web e Digital Design, a.a. 2025/26</p>
        <p class="footer-text">© 2026</p>
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

    /* Commento solo il PERCHÉ: Evita comportamenti grafici di default dei pulsanti del browser sul blocco SVG e lo rende interattivo. */
    .footer-brand-link {
        display: block;
        width: 100%;
        text-decoration: none;
        cursor: pointer;
        background: none;
        border: none;
        padding: 0;
        margin: 0;
        text-align: left;
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
        /* Commento solo il PERCHÉ: utilizza il token di peso specifico predisposto per il footer del brand */
        font-weight: var(--text-footer-weight);
        fill: color-mix(in srgb, var(--content-dark-primary) 70%, transparent);
        /* Rimossa la spaziatura negativa per allinearla a quella naturale del logo della navbar */
        transition: fill var(--transition-duration-slow) var(--easing-in-out);
    }

    /* Commento solo il PERCHÉ: Evidenzia lo stato di hover aumentando la visibilità del brand in modo morbido senza renderlo completamente opaco. */
    .footer-brand-link:hover .brand-text {
        fill: color-mix(in srgb, var(--content-dark-primary) 80%, transparent);
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
        /* Adattato a -25px per compensare il cambio di aspect ratio dovuto alla nuova spaziatura */
        margin-block-start: -25px;
    }

    .footer-text {
        margin: 0;
        color: var(--content-dark-primary);
        font-weight: var(--text-service-weight);
    }

    @media (max-width: 768px) {
        .hero-footer {
            /* Commento solo il PERCHÉ: annulla il margine negativo desktop su mobile 
               per evitare che il footer si sovrapponga con la sezione Final precedente */
            margin-top: 0;
            padding-block-end: var(--spacing-4);
        }

        .footer-bottom {
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-2);
            text-align: center;
            /* Commento solo il PERCHÉ: usa un margine positivo per distanziare 
               la nota di copyright dall'SVG vettoriale su schermi piccoli */
            margin-block-start: var(--spacing-2);
        }
    }
</style>
