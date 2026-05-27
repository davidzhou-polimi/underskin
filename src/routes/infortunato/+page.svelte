<script>
	/**
	 * Assunzioni per questa pagina rotta:
	 * 1. Questa pagina funge da orchestratore principale per il profilo "L'infortunato", caricando il relativo componente dedicato.
	 * 2. Utilizziamo <svelte:head> per definire metadati SEO verticalizzati sul profilo archetipico.
	 */

	// Importa il componente di sezione specifico per l'infortunato
	import InfortunatoHero from '$lib/components/sections/InfortunatoHero.svelte';
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
	<!-- Renderizziamo la HeroSection specifica d'ingresso -->
	<InfortunatoHero />
</main>

<style>
	/* Stili strutturali puliti per la pagina del profilo */
	#infortunato-profile-page {
		width: 100%;
		min-height: 100vh;
		background-color: var(--arancione-900);
	}
</style>
