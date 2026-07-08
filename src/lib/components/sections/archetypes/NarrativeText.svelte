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
	 * @property {Segment[][]} [mobileParagraphs] - Elenco strutturato di paragrafi alternativi per mobile
	 */

	/** @type {Props} */
	let {
		sectionId,
		theme,
		paragraphs = [],
		mobileParagraphs = undefined
	} = $props();

	let isMobile = $state(false);

	$effect(() => {
		/* Commento solo il PERCHÉ: monitora la larghezza dello schermo per stabilire se visualizzare i testi
		   in configurazione mobile (line-break e formulazione ottimizzata) o desktop. */
		const updateMedia = () => {
			isMobile = window.innerWidth <= 768;
		};
		updateMedia();
		window.addEventListener('resize', updateMedia);
		return () => window.removeEventListener('resize', updateMedia);
	});

	// Commento solo il PERCHÉ: calcola reattivamente il set di paragrafi da visualizzare in base all'orientamento/larghezza schermo
	const activeParagraphs = $derived(
		(isMobile && mobileParagraphs) ? mobileParagraphs : paragraphs
	);
</script>

<section
	id={sectionId}
	class="narrative-section"
	use:narrativeReveal
>
	<!-- Contenitore centrale del testo narrativo animato allo scroll -->
	<div class="content-container">
		<div class="narrative-wrapper">
			{#each activeParagraphs as paragraph}
				<p class="narrative-text">
					{#each paragraph as segment}
						{#if segment.type === 'keyword'}
							<span
								class="highlighted-keyword gradient-text animate-gradient-text {theme}-color"
								role="tooltip"
								tabindex="-1"
								onmouseenter={() => {
									/* Commento solo il PERCHÉ: disabilita la visualizzazione dei tooltip su mobile 
									   poiché l'evento hover non è naturale ed intralcerebbe lo scorrimento touch. */
									if (typeof window !== 'undefined' && window.innerWidth <= 768) return;
									tooltip.show(segment.tooltip ?? '', 'paragrafo');
								}}
								onmouseleave={() => {
									/* Commento solo il PERCHÉ: disabilita la pulizia dei tooltip su mobile in linea con onmouseenter */
									if (typeof window !== 'undefined' && window.innerWidth <= 768) return;
									tooltip.hide();
								}}
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

	@media (max-width: 768px) {
		.narrative-text {
			/* Commento solo il PERCHÉ: imposta l'allineamento a epigrafe (centrato) per i paragrafi su mobile
			   in conformità con lo stile editoriale e intimo dei testi narrativi. */
			text-align: center;
		}
	}
</style>
