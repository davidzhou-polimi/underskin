<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { afterNavigate } from '$app/navigation';
    import Lenis from 'lenis';
    import 'lenis/dist/lenis.css';
    import { gsap } from 'gsap';
    import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
    import { Observer } from 'gsap/dist/Observer';
    import "modern-normalize/modern-normalize.css";
    import "$lib/styles/tokens.css";
    import favicon from "$lib/assets/favicon.svg";
    import { tooltip } from "$lib/stores/tooltipState.svelte.js";
    import { setLenis, getLenis } from "$lib/stores/lenis.svelte.js";
    import CursorTooltip from "$lib/components/ui/CursorTooltip.svelte";
    import { PAGE_META, DEFAULT_META } from '$lib/utils/metaData.js';
    import { page } from "$app/state";

    let { children } = $props();

    let tooltipState = $derived(tooltip.current);

    // Commento solo il PERCHÉ: Lenis/Snap vanno creati nel corpo script del layout — non in onMount — perché
    // le use:action delle sezioni (es. introReveal, snapSection) girano durante il mount dei figli, PRIMA che
    // l'onMount del layout (genitore) venga eseguito: lo store deve già esporre le istanze a quel punto.
    // Con prefers-reduced-motion non istanziamo Lenis e lasciamo lo scroll nativo.
    const reducedMotion = browser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (browser && !reducedMotion) {
        gsap.registerPlugin(ScrollTrigger, Observer);

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

    // Commento solo il PERCHÉ: il layout (e quindi Lenis) persiste tra le navigazioni client-side: a ogni
    // cambio rotta ricalcoliamo i trigger sulle nuove altezze e riportiamo lo scroll in cima — tranne quando
    // arriviamo con ?fromArchetype, dove il posizionamento lo gestisce cinematicScroll (non va sovrascritto a 0).
    afterNavigate(() => {
        ScrollTrigger.refresh();
        const fromArchetype =
            typeof window !== 'undefined' &&
            new URLSearchParams(window.location.search).get('fromArchetype') === 'true';
        if (fromArchetype) return;

        const lenis = getLenis();
        if (lenis) lenis.scrollTo(0, { immediate: true });
        else window.scrollTo(0, 0);
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

    // Determiniamo l'URL relativo dell'immagine per la condivisione social
    const ogImageUrl = "/images/og/share.png";
    let ogUrl = $derived(page.url.pathname);
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

<div
    role="application"
    onmousemove={(e) => tooltip.updatePosition(e.clientX, e.clientY)}
    style:cursor={tooltipState.cursor}
    style="min-height: 100vh; display: flex; flex-direction: column;"
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

<style>
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

</style>
