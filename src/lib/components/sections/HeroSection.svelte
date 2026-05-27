<script>
	// 1. Importa le azioni necessarie
	import { trackSection } from '$lib/actions/trackSection.js';
</script>

<!-- 2. Applica trackSection al wrapper principale per aggiornare lo store globale -->
<section id="hero" class="hero-section" use:trackSection>
	<div class="content">
		<!-- Hero left intentionally empty; headline resides in OutroSection -->
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
		padding: var(--spacing-4);
		box-sizing: border-box;
	}

	.content {
		text-align: center;
	}

	/* Hero has no direct headline; headline is rendered inside OutroSection */
</style>
