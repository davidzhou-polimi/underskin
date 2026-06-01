<script>
	/**
	 * Assunzioni per questa pagina rotta:
	 * 1. Questa pagina funge da puro orchestratore sequenziale delle sezioni del profilo "L'Insoddisfatto".
	 * 2. Ciascun componente gestisce autonomamente la propria veste grafica e i propri sfondi.
	 * 3. Utilizziamo <svelte:head> per impostare i metadati SEO del profilo archetipico.
	 */

	// Importa le sezioni della pagina in sequenza dalle sotto-cartelle modulari dedicate
	import InsoddisfattoHero from '$lib/components/sections/insoddisfatto/InsoddisfattoHero.svelte';
	import PerfectionGame from '$lib/components/sections/insoddisfatto/PerfectionGame.svelte';
	import SilverParadoxSection from '$lib/components/sections/insoddisfatto/SilverParadoxSection.svelte';
	import ZoomTransitionSection from '$lib/components/sections/ZoomTransitionSection.svelte';
</script>

<!-- SEO Best Practices: Titolo descrittivo e meta descrizione esclusivi per questo profilo -->
<svelte:head>
	<title>Insoddisfatto — UnderSkin</title>
	<meta 
		name="description" 
		content="Analisi dell'archetipo dell'Insoddisfatto: perfezionismo opprimente, il paradosso dell'argento, pensiero controfattuale e incapacità di godere dei traguardi raggiunti." 
	/>
</svelte:head>

<main id="insoddisfatto-profile-page">
	<!-- 1. Sezione di benvenuto con morfologia fluida e grandi blob viola wiggling -->
	<InsoddisfattoHero />

	<!-- 2. Sezione interattiva per catturare il centro perfetto (Perfection Game) -->
	<PerfectionGame />

	<!-- 3. Sezione narrativa sul paradosso dell'argento e i casi di Milano Cortina 2026 -->
	<SilverParadoxSection />

	<!-- 4. Sezione di transizione zoom verso i casi reali di Milano Cortina 2026 -->
	<ZoomTransitionSection theme="insoddisfatto" />
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
