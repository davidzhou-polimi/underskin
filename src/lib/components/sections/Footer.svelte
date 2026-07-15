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
    import { base } from '$app/paths';
    // Commento solo il PERCHÉ: Importa page per identificare la rotta corrente ed evitare link ricorsivi.
    import { page } from '$app/state';
    // Commento solo il PERCHÉ: Importa lo stato del breakpoint mobile per disabilitare il logo su piccoli schermi.
    import { media } from '$lib/stores/mediaQuery.svelte.js';
    // Commento solo il PERCHÉ: Importa il componente UI del bottone riutilizzabile del brand.
    import Button from '$lib/components/ui/Button.svelte';
    // Commento solo il PERCHÉ: i confronti di rotta devono essere base-aware, altrimenti sul deploy
    // (base '/underskin') page.url.pathname non è mai '/' e la CTA non compare.
    import { relativePathname } from '$lib/utils/routePath.js';

    /** @type {SVGTextElement | null} */
    let textEl = $state(null);
    /** @type {SVGSVGElement | null} */
    let svgEl = $state(null);
    /** @type {HTMLElement | null} */
    let footerEl = $state(null);

    // Commento solo il PERCHÉ: isCtaVisible governa dinamicamente entrata/uscita della CTA scroll-driven;
    // non è un flag one-shot, ma uno stato bidirezionale che segue la direzione dello scroll.
    let isCtaVisible = $state(false);
    const relPath = $derived(relativePathname(page.url.pathname));
    // Commento solo il PERCHÉ: la CTA esiste nel DOM solo se siamo sulla homepage E su mobile;
    // su desktop il componente non viene montato, evitando timer e listener superflui.
    const showCta = $derived(relPath === '/' && media.isMobile);
    const isLogoClickable = $derived(relPath !== '/about' && !media.isMobile);

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
            document.fonts.ready.then(() => updateSvgViewBox());
        }
    });

    // Commento solo il PERCHÉ: $effect si riesegue ad ogni cambio di rotta e di breakpoint.
    // Strategia: IntersectionObserver per sapere se il footer è visibile + scroll listener
    // per nascondere la CTA al minimo gesto. Il debounce "scroll ended" riavvia il reveal timer
    // ogni volta che l'utente smette di scrollare con il footer ancora in vista.
    $effect(() => {
        if (!showCta || !footerEl) {
            isCtaVisible = false;
            return;
        }

        let footerInView = false;
        /** @type {ReturnType<typeof setTimeout> | undefined} */
        let revealTimer;
        /** @type {ReturnType<typeof setTimeout> | undefined} */
        let scrollEndTimer;

        const REVEAL_DELAY = 800;
        const SCROLL_END_DEBOUNCE = 250;

        const startRevealTimer = () => {
            clearTimeout(revealTimer);
            revealTimer = setTimeout(() => { isCtaVisible = true; }, REVEAL_DELAY);
        };

        const observer = new IntersectionObserver(([entry]) => {
            footerInView = entry.isIntersecting;
            if (footerInView) {
                // Commento solo il PERCHÉ: il footer è entrato nel viewport — avvia il timer di reveal.
                startRevealTimer();
            } else {
                clearTimeout(revealTimer);
                clearTimeout(scrollEndTimer);
                isCtaVisible = false;
            }
        }, { threshold: 0.1 });

        // Commento solo il PERCHÉ: Lenis ha syncTouch:false — su mobile lo scroll touch non passa
        // per Lenis, quindi usiamo window per intercettare tutti i gesti nativi.
        const handleScroll = () => {
            // Qualsiasi scroll: nascondi la CTA immediatamente e cancella i timer attivi
            isCtaVisible = false;
            clearTimeout(revealTimer);
            clearTimeout(scrollEndTimer);

            if (footerInView) {
                // Commento solo il PERCHÉ: se il footer è ancora in vista quando lo scroll si ferma,
                // riavvia il delay di reveal così il pulsante torna a comparire ogni volta.
                scrollEndTimer = setTimeout(startRevealTimer, SCROLL_END_DEBOUNCE);
            }
        };

        observer.observe(footerEl);
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            clearTimeout(revealTimer);
            clearTimeout(scrollEndTimer);
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    });
</script>

<footer bind:this={footerEl} class="hero-footer" use:fadeUp={{ duration: 1.2, delay: 0.1, y: 30 }}>
    <!-- Commento solo il PERCHÉ: Utilizza un pulsante per consentire la navigazione programmatica a /about 
         senza attivare l'anteprima nativa dell'URL del browser nella barra di stato in basso all'hover.
         Controlla la classe e gli eventi in base alla cliccabilità del logo (disabilitato su mobile o su /about). -->
    <button 
        type="button"
        class="footer-brand-link"
        class:is-disabled={!isLogoClickable}
        aria-label="UnderSkin - Scopri il progetto"
        onmouseenter={() => isLogoClickable && tooltip.show("Scopri il progetto", "semplice", "pointer")}
        onmouseleave={() => tooltip.hide()}
        onclick={() => isLogoClickable && goto(`${base}/about`)}
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
        {#if media.isMobile}
            <!-- Colophon su due righe bilanciate: il © si fonde con l'anno accademico,
                 niente riga orfana sotto il logo a colonna centrata. -->
            <p class="footer-text">Laboratorio di Web e Digital Design</p>
            <p class="footer-text">a.a. 2025/26 · © 2026</p>
        {:else}
            <p class="footer-text">Laboratorio di Web e Digital Design, a.a. 2025/26</p>
            <p class="footer-text">© 2026</p>
        {/if}
    </div>
</footer>

<!-- Commento solo il PERCHÉ: il wrapper CTA sta FUORI dal footer per evitare che il transform GSAP
     del fadeUp applicato al footer rompa il posizionamento fixed rispetto al viewport. -->
{#if showCta}
    <div class="fixed-cta-wrapper">
        <div class="fade-reveal" class:is-active={isCtaVisible}>
            <Button href="/about" ariaLabel="Scopri il progetto">
                Scopri il progetto
            </Button>
        </div>
    </div>
{/if}

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

    /* Commento solo il PERCHÉ: disattiva completamente puntatore, selezione ed hover quando il logo non è cliccabile */
    .footer-brand-link.is-disabled {
        pointer-events: none;
        cursor: default;
    }



    /* Commento solo il PERCHÉ: personalizza durata e coordinata Y del token fade-reveal;
       slow (500ms) per un'entrata e un'uscita morbide e percettibili. */
    .fixed-cta-wrapper :global(.fade-reveal) {
        --fade-duration: var(--transition-duration-slow);
        --fade-y: 20px;
    }

    /* Commento solo il PERCHÉ: solo il pulsante ATTIVO è interattivo; il wrapper è pointer-events:none
       (contenitore di sola posizione), quindi i figli ereditano none e va riattivato esplicitamente
       il solo .is-active. Impedisce anche il click quando è invisible (opacity:0). */
    .fixed-cta-wrapper :global(.fade-reveal.is-active) {
        pointer-events: auto;
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
            /* Le due righe sono un unico colophon, non blocchi separati: gap minimo */
            gap: var(--spacing-1);
            text-align: center;
            /* Commento solo il PERCHÉ: margine positivo che, al netto del margin-block-end
               negativo dell'SVG, stacca davvero le note dai discendenti del logo */
            margin-block-start: var(--spacing-3);
        }

        .footer-text {
            /* Note di servizio: non devono pesare quanto il testo di lettura (16px del body) */
            font-size: var(--text-service-size);
        }

        /* Commento solo il PERCHÉ: il posizionamento fisso al centro esatto del viewport
           è scoped nella media query mobile, così su desktop il wrapper non genera nessun box fixed. */
        .fixed-cta-wrapper {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 100;
            /* Commento solo il PERCHÉ: il wrapper è montato per tutta la homepage mobile (showCta) e
               fisso al centro esatto del viewport a z-index 100: con pointer-events:auto rubava OGNI
               tocco al centro dello schermo — occludeva la maniglia del quiz. È un puro contenitore di
               posizione, non deve mai catturare input; l'interattività vive solo sul pulsante attivo. */
            pointer-events: none;
        }
    }
</style>
