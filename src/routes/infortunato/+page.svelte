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
</script>

<!-- SEO Best Practices: Titolo descrittivo e meta description unici per questa pagina -->
<svelte:head>
	<title>L'Infortunato — UnderSkin Profilo Archetipico</title>
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
</main>

<style>
	/* Stili del contenitore principale che ospita gli elementi della pagina del profilo */
	#infortunato-profile-page {
		position: relative;
		width: 100%;
		min-height: 100vh;
		background-color: var(--background-primary);
	}
</style>
