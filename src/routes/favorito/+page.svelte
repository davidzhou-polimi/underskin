<script>
	/**
	 * Assunzioni per questa pagina rotta:
	 * 1. Questa pagina funge da puro orchestratore sequenziale delle sezioni del profilo "Il Favorito".
	 * 2. Ciascun componente gestisce autonomamente la propria veste grafica, animazioni e sfondi.
	 * 3. Utilizziamo <svelte:head> per impostare i metadati SEO del profilo archetipico.
	 */

	// Importa le sezioni della pagina in sequenza
	import HeroSection from '$lib/components/sections/HeroSection.svelte';
	import IntrusiveThoughts from '$lib/components/sections/IntrusiveThoughts.svelte';
	import FavoritotextSection from '$lib/components/sections/FavoritotextSection.svelte';
	import ZoomTransitionSection from '$lib/components/sections/ZoomTransitionSection.svelte';
</script>

<!-- SEO Best Practices: Titolo descrittivo e meta descrizione esclusivi per questo profilo -->
<svelte:head>
	<title>Il Favorito — UnderSkin Profilo Archetipico</title>
	<meta 
		name="description" 
		content="Analisi dell'archetipo del Favorito: quando vincere diventa l'unico risultato accettabile, la pressione psicologica cresce fino a trasformarsi in Fear of Failure e Choking Under Pressure." 
	/>
</svelte:head>

<main id="favorito-profile-page">
	<!-- 1. Sezione di benvenuto con lo sfondo azzurro e il grande blob wiggling -->
	<HeroSection />

	<!-- 2. Sezione interattiva per rimuovere i pensieri intrusivi (Intrusive Thoughts) -->
	<IntrusiveThoughts />

	<!-- 3. Sezione narrativa di superamento con termini evidenziati e tooltip associati -->
	<FavoritotextSection />

	<!-- 4. Sezione di transizione zoom verso i casi reali di Milano Cortina 2026 -->
	<ZoomTransitionSection />
</main>

<style>
	/* Contenitore principale che ospita gli elementi della pagina dell'archetipo */
	#favorito-profile-page {
		position: relative;
		width: 100%;
		min-height: 100vh;
		background-color: var(--background-primary);
	}
</style>
