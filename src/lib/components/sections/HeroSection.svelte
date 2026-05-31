<script>
	// 1. Importa le azioni necessarie
	import { trackSection } from '$lib/actions/trackSection.js';
</script>

<section id="hero" class="hero-section" use:trackSection>
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
