<script>
	/**
	 * Assunzioni per questa pagina rotta:
	 * 1. Questa pagina funge da puro orchestratore sequenziale delle sezioni del profilo "Il Favorito".
	 * 2. Ciascun componente gestisce autonomamente la propria veste grafica, animazioni e sfondi.
	 * 3. Utilizziamo <svelte:head> per impostare i metadati SEO del profilo archetipico.
	 */

	// Importa le sezioni della pagina in sequenza dalle sotto-cartelle modulari dedicate
	import HeroSection from '$lib/components/sections/HeroSection.svelte';
	import IntrusiveThoughts from '$lib/components/sections/IntrusiveThoughts.svelte';
	import NarrativeSection from '$lib/components/sections/NarrativeSection.svelte';
	import ZoomTransitionSection from '$lib/components/sections/ZoomTransitionSection.svelte';
</script>

<!-- SEO Best Practices: Titolo descrittivo e meta descrizione esclusivi per questo profilo -->
<svelte:head>
	<title>Favorito - UnderSkin</title>
	<meta 
		name="description" 
		content="Analisi dell'archetipo del Favorito: quando vincere diventa l'unico risultato accettabile, la pressione psicologica cresce fino a trasformarsi in Fear of Failure e Choking Under Pressure." 
	/>
</svelte:head>

<main id="favorito-profile-page">
	<!-- 1. Sezione di benvenuto con lo sfondo azzurro e il grande blob wiggling -->
	<HeroSection 
		theme="favorito" 
		title="IL FAVORITO" 
		sectionId="favorito-hero"
		bg="var(--azzurro-900)"
		blob1="#6A96DF"
		blob2="#3555A0"
		textShadow="none"
	/>

	<!-- 2. Sezione interattiva per rimuovere i pensieri intrusivi (Intrusive Thoughts) -->
	<IntrusiveThoughts />

	<!-- 3. Sezione narrativa di superamento con termini evidenziati e tooltip associati, unificata per evitare ridondanze -->
	<NarrativeSection
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
	<ZoomTransitionSection />
</main>

<style>
	/* Contenitore principale che ospita gli elementi della pagina dell'archetipo, isolando lo scorrimento orizzontale */
	#favorito-profile-page {
		position: relative;
		width: 100%;
		min-height: 100vh;
		background-color: var(--background-primary);
		overflow-x: hidden;
	}
</style>
