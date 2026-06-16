<script>
    import "modern-normalize/modern-normalize.css";
    import "$lib/styles/tokens.css";
    import favicon from "$lib/assets/favicon.svg";
    import { tooltip } from "$lib/stores/tooltipState.svelte.js";
    import CursorTooltip from "$lib/components/ui/CursorTooltip.svelte";
    import { page } from "$app/state";

    let { children } = $props();

    let tooltipState = $derived(tooltip.current);

    /** @type {Record<string, {title: string, description: string}>} */
    const PAGE_META = {
        "/": {
            title: "UnderSkin",
            description:
                "Cosa c'è oltre il podio? UnderSkin svela come la pressione di Milano–Cortina 2026 modella la salute mentale degli atleti attraverso tre archetipi narrativi.",
        },
        "/about": {
            title: "About · UnderSkin",
            description:
                "Cosa si nasconde dietro il successo? Scopri la visione, il team e la ricerca di UnderSkin per dare voce al lato invisibile degli atleti.",
        },
        "/favorito": {
            title: "Favorito · UnderSkin",
            description:
                "Quando l'oro è l'unico traguardo concesso. Esplora il Favorito: la complessa convivenza con il peso e le ombre delle aspettative assolute.",
        },
        "/infortunato": {
            title: "Infortunato · UnderSkin",
            description:
                "Quando il corpo si ferma, ma la mente continua a correre. Scopri l'Infortunato: l'esperienza silenziosa del recupero e la ricerca di un nuovo equilibrio mentale.",
        },
        "/insoddisfatto": {
            title: "Insoddisfatto · UnderSkin",
            description:
                "Il secondo posto può diventare una condanna? Esplora l'Insoddisfatto: l’eterna rincorsa a una perfezione che sembra sempre sfuggire di mano.",
        },
    };

    let meta = $derived(PAGE_META[page.url.pathname] ?? PAGE_META["/"]);
</script>

<svelte:head>
    <title>{meta.title}</title>
    <meta name="description" content={meta.description} />
    <link rel="icon" href={favicon} />
</svelte:head>

<div
    role="application"
    onmousemove={(e) => tooltip.updatePosition(e.clientX, e.clientY)}
    style:cursor={tooltipState.cursor}
    style="min-height: 100vh; display: flex; flex-direction: column;"
>
    {@render children()}

    {#if tooltipState.visible && tooltipState.text}
        <CursorTooltip
            visible={true}
            text={tooltipState.text}
            type={tooltipState.type}
            x={tooltipState.x}
            y={tooltipState.y}
        />
    {/if}
</div>
