<script>
	// Commento solo il PERCHÉ: Importa l'azione trackSection per notificare allo store
	// globale dello scroll quando questa sezione diventa visibile a schermo.
	import { trackSection } from '$lib/actions/trackSection.js';
</script>

<section id="hero" class="hero-section" use:trackSection>
	<div class="content">
		<!-- Inserisci qui il contenuto principale della sezione -->
	</div>
</section>

<style>
	/* Commento solo il PERCHÉ: Imposta l'altezza a schermo intero del viewport e c'entra
	   gli elementi di contenuto orizzontalmente e verticalmente. */
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
