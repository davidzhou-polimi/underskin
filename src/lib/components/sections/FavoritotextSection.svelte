<script>
	import { tooltip } from '$lib/stores/tooltipState.svelte.js';

	// Definizione dei testi descrittivi da mostrare nel riquadro vicino al mouse in modalità paragrafo
	const textFearOfFailure = "Ansia della prestazione legata al timore di non riuscire a raggiungere un determinato obiettivo.";
	const textChokingUnderPressure = "Improvviso calo delle prestazioni in situazioni ad alta pressione. L’ansia interferisce con l’esecuzione automatica di competenze consolidate.";
</script>

<section class="pressure-text-section">
	<div class="text-box">
		<p class="main-paragraph">
			La pressione cresce fino a trasformarsi in 
			
			<span 
				class="highlighted-keyword gradient-text animate-gradient-text favorito-color"
				role="tooltip"
				tabindex="-1"
				onmouseenter={() => tooltip.show(textFearOfFailure, "paragrafo")}
				onmouseleave={() => tooltip.hide()}
			>
				Fear of Failure
			</span>, 
			
			mentre il bisogno di essere perfetti porta spesso al 
			
			<span 
				class="highlighted-keyword gradient-text animate-gradient-text favorito-color"
				role="tooltip"
				tabindex="-1"
				onmouseenter={() => tooltip.show(textChokingUnderPressure, "paragrafo")}
				onmouseleave={() => tooltip.hide()}
			>
				Choking Under Pressure
			</span>: 
			un momento in cui la mente interferisce con ciò che anni di allenamento avevano reso naturale.
		</p>
	</div>
</section>

<style>
	.pressure-text-section {
		width: 100%;
		min-height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 6rem 2rem;
	}

	.text-box {
		width: 1000px;
		max-width: 100%;
	}

	.main-paragraph {
		text-align: left; /* Bandiera a sinistra */
		margin: 0;
		line-height: 1.5;
		color: var(--content-primary, #ffffff);
		
		/* Applicazione rigorosa dei token tipografici d'ambiente richiesti */
		font-family: var(--font-family-base);
		font-size: var(--text-m);
		font-weight: var(--text-body-weight);
	}

	.highlighted-keyword {
        position: relative;
		display: inline;
		font-weight: 700; /* Spessore marcato per evidenziare i termini */
        padding-bottom: 6px;
	}

	.favorito-color {
		--gradient-c1: var(--azzurro-800);
		--gradient-c2: var(--azzurro-300);
		--gradient-c3: var(--azzurro-600);
	}
</style>