<script>
	/**
	 * Assunzioni per questo componente unificato:
	 * 1. Sostituisce FavoritoTextSection, RecoverySection e SilverParadoxSection.
	 * 2. Il contenuto del paragrafo (testo, tooltip, keyword) è iniettato dall'orchestratore via snippet children di Svelte 5.
	 * 3. I colori del gradiente vengono impostati come custom properties CSS sull'elemento <section>
	 *    in base al tema, in modo che la classe .keyword-color nei children le erediti automaticamente.
	 */

	import { trackSection } from '$lib/actions/trackSection.js';
	import { scrollReveal } from '$lib/actions/scrollReveal.js';

	/**
	 * @typedef {Object} Props
	 * @property {'favorito' | 'infortunato' | 'insoddisfatto'} [theme] - Tema del profilo archetipico
	 * @property {string} [sectionId] - ID univoco per il tracking dello scrollytelling
	 * @property {import('svelte').Snippet} [children] - Markup del paragrafo narrativo fornito dall'orchestratore
	 */

	/** @type {Props} */
	let {
		theme = 'favorito',
		sectionId = 'narrative',
		children
	} = $props();

	// Mappa i token di colore del gradiente per ciascun tema
	/** @type {Record<string, { c1: string, c2: string, c3: string }>} */
	const gradients = {
		favorito:     { c1: 'var(--azzurro-800)',   c2: 'var(--azzurro-300)',   c3: 'var(--azzurro-600)' },
		infortunato:  { c1: 'var(--arancione-800)', c2: 'var(--arancione-300)', c3: 'var(--arancione-600)' },
		insoddisfatto:{ c1: 'var(--viola-800)',      c2: 'var(--viola-300)',     c3: 'var(--viola-600)' }
	};

	let gradient = $derived(gradients[theme] || gradients.favorito);
</script>

<section
	id={sectionId}
	class="narrative-section"
	style:--gradient-c1={gradient.c1}
	style:--gradient-c2={gradient.c2}
	style:--gradient-c3={gradient.c3}
	use:trackSection={{ id: sectionId }}
>
	<!-- Contenitore centrale del testo narrativo animato allo scroll -->
	<div class="content-container" use:scrollReveal>
		<p class="narrative-text">
			{#if children}
				{@render children()}
			{/if}
		</p>
	</div>
</section>

<style>
	/* Sezione a scorrimento posizionata in background neutro, ridotta l'altezza minima per ottimizzare lo scroll */
	.narrative-section {
		position: relative;
		min-height: 80vh;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--background-primary);
		overflow: hidden;
		padding: var(--spacing-6) var(--spacing-4);
	}

	/* Contenitore interno con larghezza controllata per ottimizzare la lettura dei paragrafi */
	.content-container {
		position: relative;
		z-index: 10;
		width: 100%;
		max-width: var(--spacing-17);
		margin: 0 auto;
	}

	/* Allineamento a sinistra (bandiera) ma blocco centrato orizzontalmente nello schermo */
	.narrative-text {
		font-family: var(--font-family-base);
		font-size: var(--text-m);
		font-weight: var(--text-body-weight);
		line-height: 1.5;
		color: var(--content-primary);
		margin: 0 auto;
		width: fit-content;
		text-align: left;
	}

	/* Stili base della parola evidenziata — applicati globalmente perché le keyword
	   sono definite nello snippet del componente padre */
	:global(.highlighted-keyword) {
		position: relative;
		display: inline;
		font-weight: 700;
		padding-bottom: 6px;
	}

	/* Il colore del gradiente per le keyword viene ereditato dalle custom properties
	   --gradient-c1/c2/c3 impostate sul nodo <section> in base al tema */
	:global(.keyword-color) {
		--gradient-c1: inherit;
		--gradient-c2: inherit;
		--gradient-c3: inherit;

		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		background-size: 300% 100%;
	}
</style>
