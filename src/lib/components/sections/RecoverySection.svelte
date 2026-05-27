<script>
	/**
	 * Assunzioni per questa sezione:
	 * 1. La sezione presenta il testo narrativo senza sfumature di sfondo aggiuntive per il momento.
	 * 2. Le uniche parole evidenziate sono "kinesiophobia" e "reset mentale:".
	 * 3. L'evidenziazione di queste due parole si limita al colore del brand dell'Infortunato (--arancione-500) senza sottolineature.
	 * 4. Utilizza l'azione 'scrollReveal' per rivelare il testo con una transizione fluida all'ingresso della schermata.
	 */

	// Importazione delle azioni Svelte per tracciamento dello scroll ed animazione d'ingresso
	import { trackSection } from "$lib/actions/trackSection.js";
	import { scrollReveal } from "$lib/actions/scrollReveal.js";
</script>

<section
	id="recovery"
	class="recovery-section"
	use:trackSection={{ id: "recovery" }}
>
	<!-- Contenitore centrale del testo narrativo animato allo scroll -->
	<div class="content-container" use:scrollReveal>
		<p class="narrative-text">
			Dopo il recupero, molti atleti convivono<br />
			con la <span class="highlighted-keyword gradient-text animate-gradient-text infortunato-color">kinesiophobia</span> e perdita di fiducia.
			<br /><br />
			Tornare davvero in campo significa affrontare<br />
			un processo di <span class="highlighted-keyword gradient-text animate-gradient-text infortunato-color">reset mentale:</span> smettendo di <br />
			competere con il ricordo del dolore.
		</p>
	</div>
</section>

<style>
	/* Sezione a scorrimento a schermo intero posizionata in background neutro */
	.recovery-section {
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

		text-decoration: dotted underline;
		text-decoration-thickness: 6px;
		text-underline-offset: 12px;
		text-decoration-color: currentColor;
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
</style>
