<script>
	/**
	 * Assunzioni per questo componente unificato:
	 * 1. Sostituisce i componenti duplicati specifici gestendo dinamicamente testi e tooltip.
	 * 2. Riceve come props l'ID della sezione, il tema del profilo e l'elenco dei segmenti testuali/keyword.
	 * 3. Utilizza scrollReveal per l'ingresso graduale e trackSection per lo scrollytelling.
	 */

	import { trackSection } from '$lib/actions/trackSection.js';
	import { scrollReveal } from '$lib/actions/scrollReveal.js';
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
	 * @property {Segment[]} segments - Elenco strutturato di segmenti testuali
	 */

	/** @type {Props} */
	let {
		sectionId,
		theme,
		segments = []
	} = $props();
</script>

<section
	id={sectionId}
	class="narrative-section"
	use:trackSection={{ id: sectionId }}
>
	<!-- Contenitore centrale del testo narrativo animato allo scroll -->
	<div class="content-container" use:scrollReveal>
		<p class="narrative-text">
			{#each segments as segment}
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
					<!-- Utilizziamo @html per supportare tag di formattazione nativi come <br /> inseriti nel testo statico controllato -->
					{@html segment.content}
				{/if}
			{/each}
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

	.highlighted-keyword {
		position: relative;
		display: inline;
		font-weight: 700;
		padding-bottom: 6px;
	}

	/* Colori associati a ciascun tema per evidenziare le keyword con gradienti dedicati */
	.favorito-color {
		--gradient-c1: var(--azzurro-800);
		--gradient-c2: var(--azzurro-300);
		--gradient-c3: var(--azzurro-600);

		/* Permette di ritagliare lo sfondo seguendo precisamente il contorno delle lettere */
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;

		background-size: 300% 100%;
	}

	.infortunato-color {
		--gradient-c1: var(--arancione-800);
		--gradient-c2: var(--arancione-300);
		--gradient-c3: var(--arancione-600);

		/* Permette di ritagliare lo sfondo seguendo precisamente il contorno delle lettere */
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;

		background-size: 300% 100%;
	}

	.insoddisfatto-color {
		--gradient-c1: var(--viola-800);
		--gradient-c2: var(--viola-300);
		--gradient-c3: var(--viola-600);

		/* Permette di ritagliare lo sfondo seguendo precisamente il contorno delle lettere */
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;

		background-size: 300% 100%;
	}
</style>
