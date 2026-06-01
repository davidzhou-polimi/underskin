<script>
	/**
	 * Assunzioni per questa pagina rotta:
	 * 1. Questa pagina funge da puro orchestratore sequenziale delle sezioni del profilo "L'infortunato".
	 * 2. Ciascun componente gestisce autonomamente la propria veste grafica e i propri sfondi.
	 * 3. Utilizziamo <svelte:head> per impostare i metadati SEO del profilo archetipico.
	 */

	// Importa le sezioni della pagina in sequenza
	import InfortunatoHero from '$lib/components/sections/InfortunatoHero.svelte';
	import ShatterGlass from '$lib/components/sections/ShatterGlass.svelte';
	import RecoverySection from '$lib/components/sections/RecoverySection.svelte';
	import ZoomTransitionSection from '$lib/components/sections/ZoomTransitionSection.svelte';
</script>


<!-- SEO Best Practices: Titolo descrittivo e meta description unici per questa pagina -->
<svelte:head>
	<title>Infortunato — UnderSkin</title>
	<meta 
		name="description" 
		content="Analisi dell'archetipo dell'Infortunato: calo delle prestazioni in situazioni ad alta pressione, dinamiche di ansia e blocco dell'automatismo psicomotorio." 
	/>
</svelte:head>

<main id="infortunato-profile-page">
	<!-- 1. Sezione di benvenuto con sfondo arancione caldo -->
	<InfortunatoHero />

	<!-- 2. Sezione interattiva di scorrimento Voronoi con sfondo azzurro-ghiaccio -->
	<ShatterGlass />

	<!-- 3. Sezione narrativa di superamento e reset psicofisico post-recupero -->
	<RecoverySection />

	<!-- 4. Sezione di transizione zoom verso i casi reali di Milano Cortina 2026 -->
	<ZoomTransitionSection theme="infortunato" />
</main>

<style>
	/* Stili del contenitore principale che ospita gli elementi della pagina del profilo, isolando lo scorrimento orizzontale */
	#infortunato-profile-page {
		position: relative;
		width: 100%;
		min-height: 100vh;
		background-color: var(--background-primary);
		overflow-x: hidden;
	}
</style>
