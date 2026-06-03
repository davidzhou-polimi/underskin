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
</script>

<!-- SEO Best Practices: Titolo descrittivo e meta descrizione esclusivi per questo profilo -->
<svelte:head>
	<title>Insoddisfatto - UnderSkin</title>
	<meta 
		name="description" 
		content="Analisi dell'archetipo dell'Insoddisfatto: perfezionismo opprimente, il paradosso dell'argento, pensiero controfattuale e incapacità di godere dei traguardi raggiunti." 
	/>
</svelte:head>

<main id="insoddisfatto-profile-page">
	<!-- 1. Sezione di benvenuto con morfologia fluida e grandi blob viola wiggling -->
	<HeroSection 
		theme="insoddisfatto" 
		title="L'INSODDISFATTO" 
		sectionId="insoddisfatto-hero"
		bg="var(--background-primary)"
		blob1="var(--viola-500)"
		blob2="var(--viola-700)"
		textShadow="0 4px 40px rgba(128, 53, 210, 0.2)"
	/>

	<!-- 2. Sezione interattiva per catturare il centro perfetto (Perfection Game) -->
	<PerfectionGame />

	<!-- 3. Sezione narrativa sul paradosso dell'argento, unificata per coerenza architetturale -->
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

	<!-- 4. Sezione di transizione zoom verso i casi reali di Milano Cortina 2026 -->
	<ZoomTransition theme="insoddisfatto" />
</main>

<style>
	/* Contenitore principale che ospita gli elementi della pagina dell'archetipo, isolando lo scorrimento orizzontale */
	#insoddisfatto-profile-page {
		position: relative;
		width: 100%;
		min-height: 100vh;
		background-color: var(--background-primary);
		overflow-x: hidden;
	}
</style>
