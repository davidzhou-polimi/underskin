<script>
    /**
     * Assunzioni per questa pagina rotta:
     * 1. Questa pagina funge da puro orchestratore sequenziale delle sezioni del profilo "L'infortunato".
     * 2. Ciascun componente gestisce autonomamente la propria veste grafica e i propri sfondi.
     * 3. Utilizziamo <svelte:head> per impostare i metadati SEO del profilo archetipico.
     */

    // Importa le sezioni della pagina in sequenza dalle sotto-cartelle modulari dedicate
    import HeroSection from '$lib/components/sections/archetypes/HeroSection.svelte';
    import ShatterGlass from '$lib/components/sections/archetypes/ShatterGlass.svelte';
    import NarrativeText from '$lib/components/sections/archetypes/NarrativeText.svelte';
    import ZoomTransition from '$lib/components/sections/archetypes/ZoomTransition.svelte';
	import AthleteSection from '$lib/components/sections/archetypes/AthleteSection.svelte';
    import ArchetypeSection from '$lib/components/sections/archetypes/ArchetypeSection.svelte';
	import ContinueNarrationSection from '$lib/components/sections/archetypes/ContinueNarrationSection.svelte';
    
    // 1. IMPORTA IL COMPONENTE DEL GRADIENTE
    import InteractiveGradient from "$lib/components/ui/InteractiveGradient.svelte";

    // 2. CONFIGURAZIONE DEI COLORI PER L'INFORTUNATO
    const GRADIENT_CONFIG = {
        colors: [
            "var(--arancione-200)",
            "var(--archetipi-infortunato)",
            "var(--arancione-600)",
        ],
        coverage: 1.0, // Copertura totale iniziale
    };

    // Variables per tracciare la posizione dello scroll
    let scrollY = $state(0);
    let innerHeight = $state(0);

    // Determina se l'utente ha scrollato oltre i 2/3 del primo viewport (100vh)
    let isPastFirstViewport = $derived(scrollY > innerHeight / 1.5);

    // 3. CALCOLA LA CONFIGURAZIONE DINAMICA
    // Se l'utente scende nella pagina, riduce la copertura del gradiente a 0.3 per non disturbare la lettura
    let activeConfig = $derived(
        isPastFirstViewport
            ? { ...GRADIENT_CONFIG, coverage: 0.3 }
            : GRADIENT_CONFIG
    );
</script>

<svelte:head>
    <title>Infortunato - UnderSkin</title>
    <meta 
        name="description" 
        content="Analisi dell'archetipo dell'Infortunato: calo delle prestazioni in situazioni ad alta pressione, dinamiche di ansia e blocco dell'automatismo psicomotorio." 
    />
</svelte:head>

<svelte:window bind:scrollY bind:innerHeight />

<InteractiveGradient config={activeConfig} />

<main id="infortunato-profile-page">
    <HeroSection 
        theme="infortunato" 
        title="L'INFORTUNATO" 
        sectionId="infortunato-hero"
        bg="var(--arancione-900)"
        blob1="var(--arancione-500)"
        blob2="var(--arancione-700)"
        textShadow="none"
    />

    <ShatterGlass />

    <NarrativeText
        sectionId="recovery"
        theme="infortunato"
        segments={[
            { type: 'text', content: "Dopo il recupero, molti atleti convivono con<br />la " },
            { type: 'keyword', content: "kinesiophobia", tooltip: "Ansia della prestazione legata al timore di non riuscire a raggiungere un determinato obiettivo." },
            { type: 'text', content: " e perdita di fiducia.<br /><br />Tornare davvero in campo significa affrontare<br />un processo di " },
            { type: 'keyword', content: "reset mentale", tooltip: "Improvviso calo delle prestazioni in situazioni ad alta pressione. L’ansia interferisce con l’esecuzione automatica di competenze consolidate." },
            { type: 'text', content: ": smettendo di <br />competere con il ricordo del dolore." }
        ]}
    />

	<!-- 4. Sezione di transizione zoom verso i casi reali di Milano Cortina 2026 -->
	<!-- ZoomTransition apre sulla sezione athlete carousel sottostante -->
	<ZoomTransition theme="infortunato">
		{#snippet children()}
			<AthleteSection type="infortunato" />
		{/snippet}
	</ZoomTransition>

    <ContinueNarrationSection archetype="infortunato" />
	<section class="scroll-spacer" aria-hidden="true"></section>
</main>

<style>
    /* Stili del contenitore principale che ospita gli elementi della pagina del profilo, isolando lo scorrimento orizzontale */
    #infortunato-profile-page {
        position: relative;
        width: 100%;
        min-height: 100vh;
        /* IMPORTANTE: lo sfondo deve essere trasparente, altrimenti copre il canvas del gradiente che sta sotto! */
        background-color: transparent; 
        overflow-x: hidden;
    }
</style>