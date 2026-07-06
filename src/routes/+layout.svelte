<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { afterNavigate, onNavigate } from '$app/navigation';
    import Lenis from 'lenis';
    import 'lenis/dist/lenis.css';
    import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';
    import "modern-normalize/modern-normalize.css";
    import "$lib/styles/tokens.css";
    import favicon from "$lib/assets/favicon.svg";
    import { tooltip } from "$lib/stores/tooltipState.svelte.js";
    import { setLenis, getLenis } from "$lib/stores/lenis.svelte.js";
    import { navigationState } from "$lib/stores/navigationState.svelte.js";
    import { heroExit } from "$lib/stores/heroExit.svelte.js";
    import { gradientConfig } from "$lib/stores/gradientConfig.svelte.js";
    import { scroll } from "$lib/stores/scroll.svelte.js";
    import { scrollX } from "$lib/stores/scrollX.svelte.js";
    import InteractiveGradient from "$lib/components/ui/InteractiveGradient.svelte";
    import LoadingScreen from "$lib/components/ui/LoadingScreen.svelte";
    import CursorTooltip from "$lib/components/ui/CursorTooltip.svelte";
    import { PAGE_META, DEFAULT_META, SITE_ORIGIN } from '$lib/utils/metaData.js';
    import { page } from "$app/state";

    let { children } = $props();

    let tooltipState = $derived(tooltip.current);

    // Commento solo il PERCHÉ: Lenis/Snap vanno creati nel corpo script del layout — non in onMount — perché
    // le use:action delle sezioni (es. introReveal, snapSection) girano durante il mount dei figli, PRIMA che
    // l'onMount del layout (genitore) venga eseguito: lo store deve già esporre le istanze a quel punto.
    // Con prefers-reduced-motion non istanziamo Lenis e lasciamo lo scroll nativo.
    const reducedMotion = browser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // La registrazione dei plugin GSAP avviene una sola volta in $lib/utils/gsapSetup.js
    if (browser && !reducedMotion) {
        const lenis = new Lenis({ smoothWheel: true, syncTouch: false });
        setLenis(lenis);
    }

    // Commento solo il PERCHÉ: il RAF condiviso (gsap.ticker guida lenis.raf) e il wiring di ScrollTrigger
    // si attivano in onMount, quando il DOM è pronto; nessun secondo requestAnimationFrame per evitare desync.
    onMount(() => {
        const lenis = getLenis();
        if (!lenis) {
            window.scrollTo(0, 0);
            return;
        }

        lenis.on('scroll', ScrollTrigger.update);

        /** @param {number} time */
        const tick = (time) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        lenis.scrollTo(0, { immediate: true });

        return () => {
            gsap.ticker.remove(tick);
        };
    });

    // Commento solo il PERCHÉ: il layout (e quindi Lenis) persiste tra le navigazioni client-side.
    // ORDINE CRITICO: prima riportiamo la pagina in cima in modo autoritativo, POI ricalcoliamo i
    // trigger. Farlo al contrario valuta pin-spacer e scrub a scroll ≠ 0 (finestra ancora alla
    // posizione della pagina uscente), producendo spazio extra attorno ai pin e l'assestamento
    // visibile dello scrub. Eccezione: dagli archetipi il posizionamento lo gestisce cinematicScroll.
    afterNavigate(() => {
        const lenis = getLenis();

        if (!navigationState.fromArchetype) {
            if (lenis) {
                // start(): rete di sicurezza se un lock (lenis.stop) è trapelato dalla pagina uscente
                // (es. Quiz in 'results'), altrimenti la nuova pagina non scrollerebbe.
                lenis.start();
                // resize() sincrono: il ResizeObserver di Lenis è async → dimensioni fresche prima di posizionare.
                lenis.resize();
                // force: il reset vince anche se Lenis fosse ancora stopped, eliminando la corsa col restore nativo.
                lenis.scrollTo(0, { immediate: true, force: true });
            } else {
                window.scrollTo(0, 0);
            }
        }

        // Pagina a riposo in cima → pin-spacer e scrub calcolati correttamente.
        ScrollTrigger.refresh();

        // Commento solo il PERCHÉ: azzerati qui (dopo il mount della pagina entrante e lo smontaggio
        // di quella uscente), non in onNavigate — la pagina uscente può dipendere da questi store nel
        // proprio $derived (es. isNearPageBottom in scrollGradient.svelte.js) e resettarli mentre è
        // ancora viva ne corromperebbe la config per un frame (flash cromatico alla navigazione).
        scroll.progress = 0;
        scroll.viewports = 0;
        scrollX.viewports = 0;
        if (navigationState.fromArchetype) return;

        // La pagina è tornata fisicamente in cima: con lo scroll del gradiente in unità viewport,
        // lasciar convergere il parallasse dal valore di fondo pagina sarebbe una lunga deriva
        // visibile. Snappiamo lo stato interno del renderer a riposo (mascherato dalla dissolvenza).
        /** @type {any} */
        const canvas = document.querySelector('.interactive-gradient-canvas');
        canvas?.__gradientRenderer?.snapScrollToRest();
    });

    // Commento solo il PERCHÉ: il canvas gradiente è unico e persistente su tutte le rotte. Prima che
    // la pagina entrante monti segnaliamo che non è più il primo atterraggio e riportiamo lo stato
    // interno del renderer (non lo store) alla baseline; la config transita comunque fluidamente via
    // transitionConfig.
    onNavigate((navigation) => {
        heroExit.run();
        navigationState.hasNavigated = true;
        navigationState.fromHome = navigation.from?.url.pathname === '/';
        /** @type {any} */
        const canvas = document.querySelector('.interactive-gradient-canvas');
        canvas?.__gradientRenderer?.resetScroll();
    });

    // Nasconde il tooltip ad ogni cambio di rotta: onmouseleave non si attiva
    // quando il componente viene smontato durante la navigazione.
    $effect(() => {
        page.url.pathname;
        tooltip.hide();
    });

    let meta = $derived(
        page.error
            ? DEFAULT_META
            : (page.url.pathname in PAGE_META ? PAGE_META[/** @type {keyof typeof PAGE_META} */ (page.url.pathname)] : PAGE_META["/"])
    );

    // Gli URL Open Graph devono essere assoluti: i crawler social non risolvono i path relativi
    const ogImageUrl = `${SITE_ORIGIN}/images/og/share.jpg`;
    let ogUrl = $derived(`${SITE_ORIGIN}${page.url.pathname}`);
</script>

<svelte:head>
    <title>{meta.title}</title>
    <meta name="description" content={meta.description} />
    <link rel="icon" href={favicon} />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content={ogUrl} />
    <meta property="og:title" content={meta.title} />
    <meta property="og:description" content={meta.description} />
    <meta property="og:image" content={ogImageUrl} />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content={ogUrl} />
    <meta property="twitter:title" content={meta.title} />
    <meta property="twitter:description" content={meta.description} />
    <meta property="twitter:image" content={ogImageUrl} />
</svelte:head>

<!-- Canvas gradiente unico e persistente su tutte le rotte (error inclusa): la config è pilotata
     dalla pagina attiva via lo store, così il cambio pagina anima la transizione invece di rimontare
     il canvas. Reso prima delle pagine così il renderer esiste quando le loro sezioni lo interrogano. -->
<InteractiveGradient config={gradientConfig.config} />

<div
    class="app-shell"
    role="application"
    onmousemove={(e) => tooltip.updatePosition(e.clientX, e.clientY)}
    style:cursor={tooltipState.cursor}
>
    {@render children()}

    <CursorTooltip
        visible={tooltipState.visible}
        text={tooltipState.text}
        type={tooltipState.type}
        x={tooltipState.x}
        y={tooltipState.y}
        centered={tooltipState.centered}
    />
</div>

<!-- Loader unico nel layout root persistente: compare a ogni caricamento hard (e reload), mai nelle
     navigazioni client-side. Reso per ultimo così sta sopra a tutto (oltre allo z-index). -->
<LoadingScreen />

<style>
    .app-shell {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }

    /* Lo stile globale del body vive nel layout radice (presente su ogni rotta):
       altrimenti lo sfondo verrebbe scaricato uscendo dalla home, lasciando bianche le pagine interne. */
    :global(body) {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
        background-color: var(--background-primary);
    }

    /* Il selettore html.lenis ha specificità (0,3,1) > (0,3,0) di Lenis: vince senza !important.
       Impedisce che overflow:clip rimuova html come scroll container (causando thumb full-height). */
    :global(html.lenis:not(.lenis-autoToggle).lenis-stopped) {
        overflow: initial;
    }

    @media (max-width: 768px) {
        /* Commento solo il PERCHÉ: disattiva lo scorrimento touch nativo su viewport mobile senza forzare height: 100%, 
           evitando così che la pagina salti all'inizio (scroll to top) al momento del blocco. */
        :global(html.scroll-locked) {
            overflow: hidden !important;
        }
    }
</style>
