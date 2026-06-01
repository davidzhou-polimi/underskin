<script>
	/**
	 * Assunzioni per questa sezione:
	 * 1. La sezione presenta il testo narrativo in un layout pulito centrandolo orizzontalmente.
	 * 2. Le parole chiave pensiero controfattuale e paradosso dell'argento integrano spiegazioni contestuali tramite tooltip.
	 * 3. L'animazione all'ingresso è delegata a scrollReveal.
	 */

	import { trackSection } from '$lib/actions/trackSection.js';
	import { scrollReveal } from '$lib/actions/scrollReveal.js';
	import { tooltip } from '$lib/stores/tooltipState.svelte.js';

	// Definizioni testuali scientifico-atletiche per descrivere le dinamiche psicologiche dell'Insoddisfatto
	const textPensieroControfattuale = "Tendenza a ricostruire mentalmente eventi passati immaginando esiti alternativi, valutando come scelte o circostanze diverse avrebbero potuto cambiare il risultato.";
	const textParadossoArgento = "Gli atleti con l’argento spesso sono meno soddisfatti di quelli con il bronzo, perché pensano alla vittoria mancata. La soddisfazione dipende quindi più dal confronto mentale che dal risultato reale.";
</script>

<section 
	id="insoddisfatto-narrative" 
	class="narrative-section"
	use:trackSection={{ id: 'insoddisfatto-narrative' }}
>
	<!-- Contenitore centrale del testo narrativo animato allo scroll -->
	<div class="content-container" use:scrollReveal>
		<p class="narrative-text">
			A volte il podio non basta. Chi arriva più vicino all’oro<br />
			è spesso quello che fa più fatica ad accettare<br />
			il risultato, intrappolato dal 
			<span 
				class="highlighted-keyword gradient-text animate-gradient-text insoddisfatto-color"
				role="tooltip"
				tabindex="-1"
				onmouseenter={() => tooltip.show(textPensieroControfattuale, 'paragrafo')}
				onmouseleave={() => tooltip.hide()}
			>
				pensiero controfattuale
			</span>.
			<br /><br />
			Viene definito il 
			<span 
				class="highlighted-keyword gradient-text animate-gradient-text insoddisfatto-color"
				role="tooltip"
				tabindex="-1"
				onmouseenter={() => tooltip.show(textParadossoArgento, 'paragrafo')}
				onmouseleave={() => tooltip.hide()}
			>
				paradosso dell’argento
			</span>: la mente<br />
			continua a guardare ciò che è mancato, cancellando<br />
			quello che è stato raggiunto.
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
