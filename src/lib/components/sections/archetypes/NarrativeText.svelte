<script>
	/**
	 * Assunzioni per questo componente unificato:
	 * 1. Sostituisce i componenti duplicati specifici gestendo dinamicamente testi e tooltip.
	 * 2. Riceve come props l'ID della sezione, il tema del profilo e l'elenco dei segmenti testuali/keyword.
	 * 3. Utilizza scrollReveal per l'ingresso graduale degli elementi.
	 */

		import { narrativeReveal } from '$lib/actions/archetypes/narrativeReveal.js';
	import { tooltip } from '$lib/stores/tooltipState.svelte.js';

	/**
	 * @typedef {Object} Segment
	 * @property {'text' | 'keyword'} type - Tipo di segmento
	 * @property {string} content - Contenuto testuale o parola chiave
	 * @property {string} [tooltip] - Testo del tooltip (solo per tipo 'keyword')
	 */

	/**
	 * @typedef {Object} Props
	 * @property {string} sectionId - L'ID univoco per lo scrollytelling
	 * @property {'favorito' | 'infortunato' | 'insoddisfatto'} theme - Tema grafico del profilo
	 * @property {Segment[][]} paragraphs - Elenco strutturato di paragrafi contenenti segmenti
	 */

	/** @type {Props} */
	let {
		sectionId,
		theme,
		paragraphs = []
	} = $props();
</script>

<section
	id={sectionId}
	class="narrative-section"
	use:narrativeReveal
>
	<!-- Contenitore centrale del testo narrativo animato allo scroll -->
	<div class="content-container">
		<div class="narrative-wrapper">
			{#each paragraphs as paragraph}
				<p class="narrative-text">
					{#each paragraph as segment}
						{#if segment.type === 'keyword'}
							<span
								class="highlighted-keyword gradient-text animate-gradient-text {theme}-color"
								role="tooltip"
								tabindex="-1"
								onmouseenter={() => tooltip.show(segment.tooltip ?? '', 'paragrafo')}
								onmouseleave={() => tooltip.hide()}
							>
								{segment.content}
							</span>
						{:else}
							{segment.content}
						{/if}
					{/each}
				</p>
			{/each}
		</div>
	</div>
</section>

<style>
	/* Occupa l'intero viewport di default per allinearsi allo standard delle altre sezioni */
	.narrative-section {
		position: relative;
		min-height: 100vh;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: transparent;
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

	/* Contenitore per allineare a sinistra tutti i paragrafi ma centrare l'intero blocco */
	.narrative-wrapper {
		width: fit-content;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-4);
	}

	/* Allineamento a sinistra (bandiera) per i singoli paragrafi */
	.narrative-text {
		font-family: var(--font-family-base);
		font-size: var(--text-m);
		font-weight: var(--text-body-weight);
		line-height: 1.5;
		color: var(--content-primary);
		text-align: left;
		margin: 0;
		white-space: pre-line;
	}

	/* Su mobile la colonna è stretta e la bandiera lascia righe molto frastagliate:
	   il centrato bilancia i paragrafi (richiesta QA). Desktop resta bandiera.
	   I \n nei paragrafi sono a-capo calibrati sulla misura desktop: qui collassano a spazio
	   (white-space normale) e il bilanciamento delle righe è delegato a text-wrap: balance. */
	@media (max-width: 768px) {
		.narrative-text {
			text-align: center;
			white-space: normal;
			text-wrap: balance;
		}
	}

	.highlighted-keyword {
		position: relative;
		display: inline;
		/* Commento solo il PERCHÉ: allinea l'evidenziazione delle parole chiave con il peso bold globale */
		font-weight: var(--text-bold);
		padding-bottom: 6px;
	}

	/* Colori associati a ciascun tema per evidenziare le keyword con gradienti dedicati */
	.favorito-color {
		--gradient-c1: var(--azzurro-800);
		--gradient-c2: var(--azzurro-300);
		--gradient-c3: var(--azzurro-600);

		/* Permette di ritagliare lo sfondo seguendo precisamente il contorno delle lettere */
		background-clip: text;
		color: var(--azzurro-600);
		-webkit-text-fill-color: transparent;

		background-size: 300% 100%;
	}

	.infortunato-color {
		--gradient-c1: var(--arancione-800);
		--gradient-c2: var(--arancione-300);
		--gradient-c3: var(--arancione-600);

		/* Permette di ritagliare lo sfondo seguendo precisamente il contorno delle lettere */
		background-clip: text;
		color: var(--arancione-600);
		-webkit-text-fill-color: transparent;

		background-size: 300% 100%;
	}

	.insoddisfatto-color {
		--gradient-c1: var(--viola-800);
		--gradient-c2: var(--viola-300);
		--gradient-c3: var(--viola-600);

		/* Permette di ritagliare lo sfondo seguendo precisamente il contorno delle lettere */
		background-clip: text;
		color: var(--viola-600);
		-webkit-text-fill-color: transparent;

		background-size: 300% 100%;
	}
</style>
