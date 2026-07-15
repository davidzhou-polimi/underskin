<script>
    import { onMount } from 'svelte';
    import { browser, dev } from '$app/environment';
    import { afterNavigate, onNavigate } from '$app/navigation';
    import Lenis from 'lenis';
    import 'lenis/dist/lenis.css';
    import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';
    import "modern-normalize/modern-normalize.css";
    import "$lib/styles/tokens.css";
    import favicon from "$lib/assets/favicon.svg";
    // ?url: stesso URL fingerprintato + base-safe che Vite genera per l'@font-face → il preload
    // combacia con la fetch reale (niente "preloaded but not used", niente path /static in dev).
    import fontRegular from "$lib/assets/fonts/RethinkSans-VariableFont_wght.woff2?url";
    import fontItalic from "$lib/assets/fonts/RethinkSans-Italic-VariableFont_wght.woff2?url";
    import { tooltip } from "$lib/stores/tooltipState.svelte.js";
    import { setLenis, getLenis } from "$lib/stores/lenis.svelte.js";
    import { scrollLock } from "$lib/stores/scrollLock.svelte.js";
    import { navigationState } from "$lib/stores/navigationState.svelte.js";
    import { loadingState } from "$lib/stores/loadingState.svelte.js";
    import { heroExit } from "$lib/stores/heroExit.svelte.js";
    import { gradientConfig } from "$lib/stores/gradientConfig.svelte.js";
    import { scroll } from "$lib/stores/scroll.svelte.js";
    import { scrollX } from "$lib/stores/scrollX.svelte.js";
    import InteractiveGradient from "$lib/components/ui/InteractiveGradient.svelte";
    import LoadingScreen from "$lib/components/ui/LoadingScreen.svelte";
    import CursorTooltip from "$lib/components/ui/CursorTooltip.svelte";
    import ScrollLockDebug from "$lib/components/ui/ScrollLockDebug.svelte";
    import { snapshotScrollTriggers } from "$lib/utils/scrollDebug.js";
    import { PAGE_META, DEFAULT_META, SITE_ORIGIN } from '$lib/utils/metaData.js';
    import { relativePathname } from '$lib/utils/routePath.js';
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
        // Strumentazione della migrazione scrollytelling: snapshot dei trigger diffabile
        // tra fasi, invocabile dalla console. Solo dev, mai in produzione.
        if (dev) /** @type {any} */ (window).__scrollSnapshot = snapshotScrollTriggers;

        // Back/forward cache (swipe-back dei browser mobile): la pagina torna viva senza alcun
        // evento di navigazione SvelteKit, con scroll e trigger nello stato congelato — spesso
        // incoerente (barra URL diversa → metriche cambiate → si atterra a metà pagina).
        // Comportamento scelto: back = sempre in cima, come già accade su desktop via popstate.
        /** @param {PageTransitionEvent} e */
        const onPageShow = (e) => {
            if (!e.persisted) return;
            // La pagina rientra dal bfcache con l'eventuale lock congelato di un owner
            // ormai incoerente: rilascio totale prima del reset di scroll.
            scrollLock.forceRelease();
            const l = getLenis();
            if (l) {
                l.start();
                l.resize();
                l.scrollTo(0, { immediate: true, force: true });
            } else {
                window.scrollTo(0, 0);
            }
            ScrollTrigger.refresh();
        };
        window.addEventListener('pageshow', onPageShow);

        const lenis = getLenis();
        if (!lenis) {
            window.scrollTo(0, 0);
            return () => window.removeEventListener('pageshow', onPageShow);
        }

        lenis.on('scroll', ScrollTrigger.update);

        /** @param {number} time */
        const tick = (time) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        lenis.scrollTo(0, { immediate: true });

        return () => {
            gsap.ticker.remove(tick);
            window.removeEventListener('pageshow', onPageShow);
        };
    });

    // Commento solo il PERCHÉ: il layout (e quindi Lenis) persiste tra le navigazioni client-side.
    // ORDINE CRITICO: prima riportiamo la pagina in cima in modo autoritativo, POI ricalcoliamo i
    // trigger. Farlo al contrario valuta pin-spacer e scrub a scroll ≠ 0 (finestra ancora alla
    // posizione della pagina uscente), producendo spazio extra attorno ai pin e l'assestamento
    // visibile dello scrub. Eccezione: dagli archetipi il posizionamento lo gestisce cinematicScroll.
    afterNavigate((navigation) => {
        // Valvola di sicurezza del ScrollLockManager: la pagina uscente potrebbe essere
        // smontata a lock attivo (owner morto). Va PRIMA del reset autoritativo di scroll,
        // altrimenti lo scrollTo(0) sotto combatterebbe con un lenis ancora stopped.
        // staleOnly: le action della pagina entrante montano prima di questo callback e
        // possono aver già acquisito un lock legittimo (gate intro) da non strippare.
        scrollLock.forceRelease({ staleOnly: true });
        const lenis = getLenis();

        // Su popstate SvelteKit ri-applica la Y salvata PRIMA di questi callback: il reset sotto
        // vince già, ma su mobile restano attori tardivi (barra URL retrattile, restore parziali).
        // Un colpo di coda a frame successivi rende il "back = in cima" deterministico ovunque.
        if (navigation.type === 'popstate' && !navigationState.fromArchetype) {
            requestAnimationFrame(() => requestAnimationFrame(() => {
                if (window.scrollY === 0) return;
                const l = getLenis();
                if (l) l.scrollTo(0, { immediate: true, force: true });
                else window.scrollTo(0, 0);
                ScrollTrigger.refresh();
            }));
        }

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
        // Da qui in poi ogni lock detenuto appartiene alla pagina uscente: marcarlo come
        // stantio permette al forceRelease di afterNavigate di distinguerlo da quelli
        // che la pagina entrante acquisirà durante il proprio mount.
        scrollLock.bumpGeneration();
        heroExit.run();
        navigationState.hasNavigated = true;
        navigationState.fromHome = navigation.from ? relativePathname(navigation.from.url.pathname) === '/' : false;
        // Arma il ritardo teatrale per la sola transizione di questo cambio pagina (dalla home la
        // pausa dopo l'uscita del titolo è più lunga); lo consuma transitionConfig al primo uso.
        navigationState.gradientDelay = navigationState.fromHome ? 0.6 : 0.3;
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

    // Commento solo il PERCHÉ: all'hard load i pin (scrollableTextSwap e quelli creati da
    // scrollytelling/pin.js)
    // vengono misurati durante l'idratazione, PRIMA che i web-font siano caricati: dopo il font-swap
    // le metriche restano stantie (testi che scattano, sezioni tagliate su /about). Il loader attende
    // document.fonts.ready, quindi al complete le misure sono definitive: un solo refresh, a pagina
    // in cima e scroll quiescente. loadingState.complete non torna mai false: l'effect è one-shot.
    let hasRefreshedPostLoading = false;
    $effect(() => {
        if (!loadingState.complete || hasRefreshedPostLoading) return;
        hasRefreshedPostLoading = true;
        requestAnimationFrame(() => ScrollTrigger.refresh());
    });

    // Questi meta sono baked nell'HTML statico durante il prerender, dove `base` di $app/paths è
    // VUOTO mentre page.url.pathname include comunque il sottopath di deploy (/underskin/about):
    // relativePathname (che usa quel `base`) non striperebbe. Ricaviamo il base da SITE_ORIGIN
    // (unica fonte del sottopath, cfr. AGENTS.md) → robusto sia in prerender sia a runtime.
    const DEPLOY_BASE = new URL(SITE_ORIGIN).pathname.replace(/\/+$/, '');
    let metaPath = $derived(
        page.url.pathname.startsWith(DEPLOY_BASE)
            ? page.url.pathname.slice(DEPLOY_BASE.length) || '/'
            : page.url.pathname
    );
    let meta = $derived(
        page.error
            ? DEFAULT_META
            : (metaPath in PAGE_META ? PAGE_META[/** @type {keyof typeof PAGE_META} */ (metaPath)] : PAGE_META["/"])
    );

    // Gli URL Open Graph devono essere assoluti: i crawler social non risolvono i path relativi.
    // SITE_ORIGIN include già il base path (/underskin) → concatenando il pathname base-less
    // l'URL è completo e corretto anche in prerender.
    const ogImageUrl = `${SITE_ORIGIN}/images/og/share.jpg`;
    let ogUrl = $derived(`${SITE_ORIGIN}${metaPath}`);
</script>

<svelte:head>
    <title>{meta.title}</title>
    <meta name="description" content={meta.description} />
    <link rel="icon" href={favicon} />

    <!-- Regular usato dal primo paint. Italic: unico uso è il quote del quiz (display:none fino
         al suo step), quindi senza preload il face parte on-demand allo scroll e fa swap; lo
         precarichiamo in parallelo così il loader (che ora lo attende) aspetta al più ~48 KB. -->
    <link rel="preload" href={fontRegular} as="font" type="font/woff2" crossorigin="anonymous" />
    <link rel="preload" href={fontItalic} as="font" type="font/woff2" crossorigin="anonymous" />

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
    oncontextmenu={(e) => e.preventDefault()}
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

{#if dev}
    <ScrollLockDebug />
{/if}

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
