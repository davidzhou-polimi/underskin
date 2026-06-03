<script>
    /**
     * Assunzioni per questa pagina rotta:
     * 1. Questa pagina funge da puro orchestratore sequenziale delle sezioni del profilo "L'Insoddisfatto".
     * 2. Ciascun componente gestisce autonomamente la propria veste grafica e i propri sfondi.
     * 3. Utilizziamo <svelte:head> per impostare i metadati SEO del profilo archetipico.
     */

    // Importa le sezioni della pagina in sequenza dalle sotto-cartelle modulari dedicate
    import HeroSection from '$lib/components/sections/archetypes/HeroSection.svelte';
    import PerfectionGame from '$lib/components/sections/archetypes/PerfectionGame.svelte';
    import NarrativeText from '$lib/components/sections/archetypes/NarrativeText.svelte';
    import ZoomTransition from '$lib/components/sections/archetypes/ZoomTransition.svelte';
    
    // 1. IMPORTA IL COMPONENTE DEL GRADIENTE INTERATTIVO
    import InteractiveGradient from "$lib/components/ui/InteractiveGradient.svelte";

    // 2. CONFIGURAZIONE DEI COLORI VIOLA PER L'INSODDISFATTO
    const GRADIENT_CONFIG = {
        colors: [
            "var(--viola-200)",
            "var(--archetipi-insoddisfatto)",
            "var(--viola-600)",
        ],
        coverage: 1.0, // Copertura totale iniziale
    };

    // Variabili per tracciare lo scroll reattivo di Svelte 5
    let scrollY = $state(0);
    let innerHeight = $state(0);

    // Rileva quando lo scroll supera i 2/3 del primo viewport (100vh)
    let isPastFirstViewport = $derived(scrollY > innerHeight / 1.5);

    // Cambia la copertura del gradiente viola a 0.3 quando si scende per agevolare la lettura
    let activeConfig = $derived(
        isPastFirstViewport
            ? { ...GRADIENT_CONFIG, coverage: 0.3 }
            : GRADIENT_CONFIG
    );
</script>

<svelte:head>
    <title>Insoddisfatto - UnderSkin</title>
    <meta 
        name="description" 
        content="Analisi dell'archetipo dell'Insoddisfatto: perfezionismo opprimente, il paradosso dell'argento, pensiero controfattuale e incapacità di godere dei traguardi raggiunti." 
    />
</svelte:head>

<svelte:window bind:scrollY bind:innerHeight />

<InteractiveGradient config={activeConfig} />

<main id="insoddisfatto-profile-page">
    <HeroSection 
        theme="insoddisfatto" 
        title="L'INSODDISFATTO" 
        sectionId="insoddisfatto-hero"
        textShadow="0 4px 40px rgba(128, 53, 210, 0.2)"
    />

    <PerfectionGame />

    <NarrativeText
        sectionId="insoddisfatto-narrative"
        theme="insoddisfatto"
        segments={[
            { type: 'text', content: "A volte il podio non basta. Chi arriva più vicino all’oro<br />è spesso quello che fa più fatica ad accettare<br />il risultato, intrappolato dal " },
            { type: 'keyword', content: "pensiero controfattuale", tooltip: "Tendenza a ricostruire mentalmente eventi passati immaginando esiti alternativi, valutando come scelte o circostanze diverse avrebbero potuto cambiare il risultato." },
            { type: 'text', content: ".<br /><br />Viene definito il " },
            { type: 'keyword', content: "paradosso dell’argento", tooltip: "Gli atleti con l’argento spesso sono meno soddisfatti di quelli con il bronzo, perché pensano alla vittoria mancata. \nLa soddisfazione dipende quindi più dal confronto mentale che dal risultato reale." },
            { type: 'text', content: ": la mente<br />continua a guardare ciò che è mancato, cancellando<br />quello che è stato raggiunto." }
        ]}
    />

    <ZoomTransition theme="insoddisfatto" />
</main>

<style>
    /* Contenitore principale che ospita gli elementi della pagina dell'archetipo, isolando lo scorrimento orizzontale */
    #insoddisfatto-profile-page {
        position: relative;
        width: 100%;
        min-height: 100vh;
        /* IMPORTANTE: Sfondo trasparente per far risaltare il gradiente sottostante */
        background-color: transparent; 
        overflow-x: hidden;
    }
</style>