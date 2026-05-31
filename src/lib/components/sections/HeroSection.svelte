<script>
	// 1. Importa le azioni necessarie
	import { trackSection } from '$lib/actions/trackSection.js';
	import InteractiveGradient from '$lib/components/ui/InteractiveGradient.svelte';
</script>

<section id="hero" class="hero-section" use:trackSection>
	<!--
		Commento solo il PERCHÉ: Rimuoviamo absolute={true} per far sì che il gradiente rimanga 
		fixed sullo sfondo di tutta la pagina, coprendo anche gli spaziatore durante lo scroll.
	-->
	<InteractiveGradient config={{ grainIntensity: 0.1, coverage: 0.3, maskClamp: [0.0, 0.7] }} />
	<div class="content">
		<!-- Inserisci qui il contenuto della sezione -->
	</div>
</section>

<style>
	/* 3. Usa esclusivamente le variabili token per lo styling */
	.hero-section {
		position: relative;
		overflow: hidden;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.content {
		position: relative;
		z-index: 1;
	}
</style>
