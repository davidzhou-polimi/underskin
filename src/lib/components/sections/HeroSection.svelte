<script>
	// 1. Importa le azioni necessarie
	import { trackSection } from '$lib/actions/trackSection.js';
</script>

<!-- 2. Applica trackSection al wrapper principale per aggiornare lo store globale -->
<section id="hero" class="hero-section" use:trackSection>
	<div class="content">
		<!-- Inserisci qui il contenuto della sezione -->
	</div>
</section>

<style>
	/* 3. Usa esclusivamente le variabili token per lo styling */
	.hero-section {
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-bg-primary, transparent);
	}

	.content {
		/* Esempio: max-width: var(--container-width); */
	}
</style>
