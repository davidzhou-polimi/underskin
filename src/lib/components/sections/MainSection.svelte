<script>
	// Commento solo il PERCHÉ: Importa l'azione trackSection per notificare allo store
	// globale dello scroll quando questa sezione diventa visibile a schermo.
	import { trackSection } from '$lib/actions/trackSection.js';
	import { narrative } from '$lib/stores/narrative.svelte.js';
</script>

<section id="hero" class="hero-section" use:trackSection>
	<div class="content">
		<!-- Commento solo il PERCHÉ: Fornisce all'utente l'azione diretta per accedere alla sezione Favorito (inserito temporaneamente per scopi di test) -->
		<button 
			type="button" 
			class="action-btn" 
			onclick={() => narrative.activeSection = 'favorito'}
		>
			Scopri il Favorito (Test)
		</button>
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

	/* Commento solo il PERCHÉ: Definisce uno stile interattivo premium e responsivo per l'azione principale di navigazione */
	.action-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid var(--content-light-primary);
		color: var(--content-light-primary);
		padding: var(--spacing-2) var(--spacing-4);
		font-size: var(--text-s);
		font-weight: var(--text-nav-active-weight);
		border-radius: var(--radius-m);
		cursor: pointer;
		transition: background var(--transition-duration-fast) var(--easing-standard), 
		            color var(--transition-duration-fast) var(--easing-standard),
		            transform var(--transition-duration-fast) var(--easing-standard);
	}

	.action-btn:hover {
		background: var(--content-light-primary);
		color: var(--background-primary);
		transform: scale(1.05);
	}

	.action-btn:active {
		transform: scale(0.98);
	}
</style>
