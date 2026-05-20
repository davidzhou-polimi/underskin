<script>
	import { trackSection } from '$lib/actions/trackSection.js';
	import AthleteCarousel from '$lib/components/ui/AthleteCarousel.svelte';

	// Reactive state to hold the user's selected archetype
	/** @type {'favorito' | 'infortunato' | 'insoddisfatto'} */
	let activeArchetype = $state('favorito');

	// Metadati degli archetipi con colori semantici mappati sui token globali
	const ARCHETYPES = [
		{ id: /** @type {const} */ ('favorito'), label: 'I Favoriti', color: 'var(--archetipi-favorito)' },
		{ id: /** @type {const} */ ('infortunato'), label: 'Gli Infortunati', color: 'var(--archetipi-infortunato)' },
		{ id: /** @type {const} */ ('insoddisfatto'), label: 'Gli Insoddisfatti', color: 'var(--archetipi-insoddisfatto)' }
	];
</script>

<!-- Sezione principale che fa parte dello scrollytelling ed aggiorna lo store globale -->
<section id="athletes" class="athletes-section" use:trackSection>
	<div class="container">
		<header class="section-header">
			<h2 class="section-title">I NOSTRI ATLETI</h2>
			<p class="section-subtitle">Scopri i percorsi psicologici e agonistici dei nostri talenti.</p>
		</header>

		<!-- Selettore per passare da un archetipo di carosello all'altro -->
		<div class="tabs-container">
			{#each ARCHETYPES as archetype}
				<button 
					class="tab-btn" 
					class:active={activeArchetype === archetype.id}
					style="--active-color: {archetype.color};"
					onclick={() => activeArchetype = archetype.id}
				>
					{archetype.label}
				</button>
			{/each}
		</div>

		<!-- Il wrapper distrugge e ricrea il componente carosello al cambio dell'archetipo -->
		<div class="carousel-wrapper">
			{#key activeArchetype}
				<AthleteCarousel type={activeArchetype} />
			{/key}
		</div>
	</div>
</section>

<style>
	.athletes-section {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: radial-gradient(circle at center, var(--neutral-800) 0%, var(--neutral-900) 100%);
		color: var(--background-primary);
		padding: var(--spacing-6) var(--spacing-3);
		overflow: hidden;
		position: relative;
	}

	.container {
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-4);
	}

	.section-header {
		text-align: center;
		margin-bottom: var(--spacing-2);
	}

	.section-title {
		font-family: var(--font-family-base);
		font-size: var(--text-l);
		font-weight: var(--text-title-weight);
		letter-spacing: 0.08em;
		color: var(--background-primary);
		margin: 0;
		text-transform: uppercase;
	}

	.section-subtitle {
		font-family: var(--font-family-base);
		font-size: var(--text-xs);
		color: var(--neutral-300);
		margin-top: var(--spacing-1);
	}

	.tabs-container {
		display: flex;
		gap: var(--spacing-2);
		background: rgba(255, 255, 255, 0.03);
		padding: var(--spacing-1);
		border-radius: var(--radius-m);
		border: 1px solid rgba(255, 255, 255, 0.07);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		margin-bottom: var(--spacing-3);
		z-index: 10;
	}

	.tab-btn {
		background: transparent;
		border: none;
		padding: var(--spacing-1) var(--spacing-3);
		border-radius: var(--radius-s);
		color: var(--neutral-300);
		font-size: var(--text-service-size);
		font-weight: var(--text-service-weight);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
		position: relative;
	}

	.tab-btn:hover {
		color: var(--background-primary);
	}

	.tab-btn.active {
		color: var(--background-primary);
		background: rgba(255, 255, 255, 0.08);
	}

	.tab-btn.active::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 15%;
		right: 15%;
		height: 3px;
		background: var(--active-color);
		border-radius: var(--radius-s);
		box-shadow: 0 0 12px var(--active-color);
	}

	.carousel-wrapper {
		width: 100%;
		overflow: visible;
	}
</style>
