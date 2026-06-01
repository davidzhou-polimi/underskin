<script>
	/**
	 * Assunzioni per questa sezione:
	 * 1. La sezione presenta il testo narrativo del Favorito suddiviso in due paragrafi per migliorare la leggibilità.
	 * 2. Le parole chiave Fear of Failure e Choking Under Pressure integrano spiegazioni contestuali tramite tooltip.
	 * 3. L'animazione all'ingresso è delegata a scrollReveal e lo stato scrollytelling a trackSection.
	 */

	import { trackSection } from '$lib/actions/trackSection.js';
	import { scrollReveal } from '$lib/actions/scrollReveal.js';
	import { tooltip } from '$lib/stores/tooltipState.svelte.js';

	// Definizione dei testi descrittivi da mostrare nel riquadro vicino al mouse in modalità paragrafo
	const textFearOfFailure = "Ansia della prestazione legata al timore di non riuscire a raggiungere un determinato obiettivo.";
	const textChokingUnderPressure = "Improvviso calo delle prestazioni in situazioni ad alta pressione. L’ansia interferisce con l’esecuzione automatica di competenze consolidate.";
</script>

<section
	id="favorito-narrative"
	class="narrative-section"
	use:trackSection={{ id: 'favorito-narrative' }}
>
	<!-- Contenitore centrale del testo narrativo animato allo scroll -->
	<div class="content-container" use:scrollReveal>
		<p class="narrative-text">
			Quando l'aspettativa esterna si fa insostenibile,<br />
			la pressione cresce fino a diventare 
			<span 
				class="highlighted-keyword gradient-text animate-gradient-text favorito-color"
				role="tooltip"
				tabindex="-1"
				onmouseenter={() => tooltip.show(textFearOfFailure, "paragrafo")}
				onmouseleave={() => tooltip.hide()}
			>
				Fear of Failure
			</span>.
			<br /><br />
			Il bisogno ossessivo di essere perfetti porta spesso<br />
			al 
			<span 
				class="highlighted-keyword gradient-text animate-gradient-text favorito-color"
				role="tooltip"
				tabindex="-1"
				onmouseenter={() => tooltip.show(textChokingUnderPressure, "paragrafo")}
				onmouseleave={() => tooltip.hide()}
			>
				Choking Under Pressure
			</span>: un blocco in cui la mente<br />
			ostacola ciò che l'allenamento aveva reso naturale.
		</p>
	</div>
</section>

<style>
	/* Sezione a scorrimento a schermo intero posizionata in background neutro */
	.narrative-section {
		position: relative;
		min-height: 100vh;
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
</style>