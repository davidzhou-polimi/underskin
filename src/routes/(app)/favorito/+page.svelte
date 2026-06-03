<script>
    /**
     * Assunzioni per questa pagina rotta:
     * 1. Questa pagina funge da puro orchestratore sequenziale delle sezioni del profilo "Il Favorito".
     * 2. Ciascun componente gestisce autonomamente la propria veste grafica, animazioni e sfondi.
     * 3. Utilizziamo <svelte:head> per impostare i metadati SEO del profilo archetipico.
     */

    // Importa le sezioni della pagina in sequenza dalle sotto-cartelle modulari dedicate
    import HeroSection from '$lib/components/sections/archetypes/HeroSection.svelte';
    import IntrusiveThoughts from '$lib/components/sections/archetypes/IntrusiveThoughts.svelte';
    import NarrativeText from '$lib/components/sections/archetypes/NarrativeText.svelte';
    import ZoomTransition from '$lib/components/sections/archetypes/ZoomTransition.svelte';
	import AthleteSection from '$lib/components/sections/archetypes/AthleteSection.svelte';
    
    // 1. IMPORTA IL COMPONENTE DEL GRADIENTE INTERATTIVO
    import InteractiveGradient from "$lib/components/ui/InteractiveGradient.svelte";

    // 2. CONFIGURAZIONE DEI COLORI AZZURRI PER IL FAVORITO
    const GRADIENT_CONFIG = {
        colors: [
            "var(--azzurro-200)",
            "var(--archetipi-favorito)",
            "var(--azzurro-600)",
        ],
        coverage: 1.0, // Copertura totale iniziale
    };

    // Variabili di stato reattive (Svelte 5 Runes) per tracciare lo scroll
    let scrollY = $state(0);
    let innerHeight = $state(0);

    // Determina se l'utente ha scrollato oltre i 2/3 della prima schermata (100vh)
    let isPastFirstViewport = $derived(scrollY > innerHeight / 1.5);

    // Abbassa l'intensità dell'azzurro a 0.3 durante la lettura per far risaltare i testi e l'effetto vetro
    let activeConfig = $derived(
        isPastFirstViewport
            ? { ...GRADIENT_CONFIG, coverage: 0.3 }
            : GRADIENT_CONFIG
    );
</script>

<svelte:head>
    <title>Favorito - UnderSkin</title>
    <meta 
        name="description" 
        content="Analisi dell'archetipo dell'Favorito: quando vincere diventa l'unico risultato accettabile, la pressione psicologica cresce fino a trasformarsi in Fear of Failure e Choking Under Pressure." 
    />
</svelte:head>

<svelte:window bind:scrollY bind:innerHeight />

<InteractiveGradient config={activeConfig} />

<main id="favorito-profile-page">
    <HeroSection 
        theme="favorito" 
        title="IL FAVORITO" 
        sectionId="favorito-hero"
        textShadow="none"
    />

    <IntrusiveThoughts />

    <NarrativeText
        sectionId="favorito-narrative"
        theme="favorito"
        segments={[
            { type: 'text', content: "Quando l'aspettativa esterna si fa insostenibile,<br />la pressione cresce fino a diventare " },
            { type: 'keyword', content: "Fear of Failure", tooltip: "Ansia della prestazione legata al timore di non riuscire a raggiungere un determinato obiettivo." },
            { type: 'text', content: ".<br /><br />Il bisogno ossessivo di essere perfetti porta spesso<br />al " },
            { type: 'keyword', content: "Choking Under Pressure", tooltip: "Improvviso calo delle prestazioni in situazioni ad alta pressione. L’ansia interferisce con l’esecuzione automatica di competenze consolidate." },
            { type: 'text', content: ": un blocco in cui la mente<br />ostacola ciò che l'allenamento aveva reso naturale." }
        ]}
    />

	<!-- 4. Sezione di transizione zoom verso i casi reali di Milano Cortina 2026 -->
	<!-- ZoomTransition apre sulla sezione athlete carousel sottostante -->
	<ZoomTransition>
		{#snippet children()}
			<AthleteSection type="favorito" />
		{/snippet}
	</ZoomTransition>
</main>

<style>
    /* Contenitore principale che ospita gli elementi della pagina dell'archetipo, isolando lo scorrimento orizzontale */
    #favorito-profile-page {
        position: relative;
        width: 100%;
        min-height: 100vh;
        /* IMPORTANTE: Sfondo trasparente per far passare l'effetto dell'azzurro globale */
        background-color: transparent; 
        overflow-x: hidden;
    }
</style>