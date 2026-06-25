<script>
    import { onMount } from 'svelte';
    import "modern-normalize/modern-normalize.css";
    import "$lib/styles/tokens.css";
    import favicon from "$lib/assets/favicon.svg";
    import { tooltip } from "$lib/stores/tooltipState.svelte.js";
    import CursorTooltip from "$lib/components/ui/CursorTooltip.svelte";
    import { PAGE_META, DEFAULT_META } from '$lib/utils/metaData.js';
    import { page } from "$app/state";

    let { children } = $props();

    let tooltipState = $derived(tooltip.current);

    // Commento solo il PERCHÉ: assicura che il client si posizioni in cima alla pagina ad ogni caricamento iniziale o refresh completo
    onMount(() => {
        window.scrollTo(0, 0);
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
