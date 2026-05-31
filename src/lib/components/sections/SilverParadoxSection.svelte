<script>
	import { scrollReveal } from '$lib/actions/scrollReveal.js';
	import { trackSection } from '$lib/actions/trackSection.js';
	import { tooltip } from '$lib/stores/tooltipState.svelte.js';

	// Definizioni testuali scientifico-atletiche per descrivere le dinamiche psicologiche dell'Insoddisfatto
	const textPensieroControfattuale = "Tendenza a immaginare scenari alternativi che avrebbero potuto verificarsi, confrontando la realtà con ciò che sarebbe potuto accadere.";
	const textParadossoArgento = "Fenomeno psicologico per cui chi vince una medaglia d'argento è spesso meno felice di chi vince il bronzo, poiché si concentra sul mancato oro.";
</script>

<section 
	id="insoddisfatto-narrative" 
	class="narrative-section"
	use:trackSection={{ id: 'insoddisfatto-narrative' }}
>
	<!-- Contenitore centrale del testo narrativo animato allo scroll -->
	<div class="content-container" use:scrollReveal>
		<p class="narrative-text">
			A volte il podio non basta. Chi arriva più<br />
			vicino all’oro è spesso quello che fa più<br />
			fatica ad accettare il risultato,<br />
			intrappolato dal 
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
			</span>:
			<br />
			la mente continua a guardare ciò che è<br />
			mancato, cancellando quello che è stato<br />
			raggiunto.
		</p>
	</div>

	<!-- Mesh blob organica e sfumata in basso a destra per ricreare la composizione visiva del mockup -->
	<div class="bottom-right-blob" aria-hidden="true"></div>
</section>

<style>
	/* Sezione a schermo intero con sfondo chiaro coerente con l'identità visiva */
	.narrative-section {
		position: relative;
		min-height: 100vh;
		width: 100%;
		display: flex;
		flex-direction: column;
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
		margin-inline: auto;
	}

	/* Allineamento a sinistra (bandiera) ma blocco complessivo centrato orizzontalmente nello schermo */
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
		padding-bottom: 2px;
		
		/* Sottolineatura punteggiata di forte personalità visiva coerente con lo stile */
		text-decoration: dotted underline;
		text-decoration-thickness: 3px;
		text-underline-offset: 4px;
		text-decoration-color: currentColor;
	}

	.insoddisfatto-color {
		--gradient-c1: var(--viola-800);
		--gradient-c2: var(--viola-300);
		--gradient-c3: var(--viola-600);

		/* Consente di ritagliare lo sfondo seguendo precisamente il contorno delle lettere */
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;

		background-size: 300% 100%;
	}

	/* Sfumatura decorativa fluttuante e traslucida posizionata nell'angolo inferiore destro */
	.bottom-right-blob {
		position: absolute;
		bottom: -15%;
		right: -20%;
		width: 70vw;
		height: 70vw;
		max-width: 900px;
		max-height: 900px;
		background: radial-gradient(
			circle, 
			rgba(222, 175, 250, 0.45) 0%, 
			rgba(128, 53, 210, 0.25) 50%, 
			transparent 80%
		);
		filter: blur(70px);
		z-index: 1;
		pointer-events: none;
		will-change: transform;
	}
</style>
