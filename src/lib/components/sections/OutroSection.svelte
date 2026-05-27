<script>
	import { onMount } from 'svelte';

	// Testo strutturato per riga
	const stats = [
		"34% soffre di ansia o depressione",
		"26% sviluppa problemi mentali gravi dopo il ritiro",
		"45% manifesta disturbi alimentari",
		"53% soffre di solitudine",
		"36% soffre di disturbi del sonno"
	];

	const allWords = stats.flatMap((line, lineIndex) => {
		const words = line.split(' ');
		return words.map((word, wordIndex) => ({
			text: word,
			isLastOfLine: wordIndex === words.length - 1 && lineIndex < stats.length - 1
		}));
	});

	// Offsets per riga per mappare l'indice globale dei word
	const lineOffsets = (() => {
		const out = [];
		let acc = 0;
		for (const line of stats) {
			out.push(acc);
			acc += line.split(' ').length;
		}
		return out;
	})();

	/** @type {HTMLElement | null} */
	let container = null;
	let scrollY = 0;
	let progress = 0;

	// Gestione dello scroll nativo e immediato tramite IntersectionObserver
	onMount(() => {
		const handleScroll = () => {
			if (!container) return;
			
			const rect = container.getBoundingClientRect();
			const viewHeight = window.innerHeight;
			
			// Calcoliamo il progresso dal momento esatto in cui l'outro appare sullo schermo
			const totalScrollableDistance = rect.height - viewHeight;
			const scrolledDistance = -rect.top;
			
			progress = Math.min(Math.max(scrolledDistance / totalScrollableDistance, 0), 1);
		};

		window.addEventListener('scroll', handleScroll);
		window.addEventListener('resize', handleScroll);
		
		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleScroll);
		};
	});
</script>

<!-- Container principale dell'effetto -->
<div bind:this={container} class="outro-scroll-container">
	
	<!-- Wrapper Sticky bloccato sullo schermo -->
	    <div class="viewport-sticky">
			<!-- Titolo principale: rimane qui ma deve essere visibile subito -->
			<div class="top-header">
				<h2 class="podium-title">Questo è ciò che non si vede sul podio.</h2>
			</div>

			<!-- Spacing esatto di 80px sotto al titolo -->
			<div class="section-spacer"></div>

			<!-- Blocco statistiche con reveal progressivo -->
				<div class="stats-content">
					{#each stats as line, lineIndex}
						{@const words = line.split(' ')}
						{@const offset = lineOffsets[lineIndex]}
						<div class="line">
							{#each words as w, wi}
								{@const globalIndex = offset + wi}
								{@const wordProgress = globalIndex / allWords.length}
								<span class="word" class:visible={progress > wordProgress}>{w}{' '}</span>
							{/each}
						</div>
					{/each}
				</div>

	</div>
</div>

<style>
	/* Forziamo la sezione ad attaccarsi perfettamente senza spazi morti */
	.outro-scroll-container {
			position: relative;
			/* pull the outro up so its sticky area is visible immediately (overlaps hero) */
			margin-top: calc(-100vh + var(--spacing-1));
			height: 180vh;
			background-color: var(--background-primary);
			margin-left: 0;
			margin-right: 0;
			padding: 0;
		}

	.viewport-sticky {
		position: sticky;
		top: 0;
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center; /* center the title in the viewport */
		padding: var(--spacing-4);
		box-sizing: border-box;
	}

	.stats-content {
		width: 100%;
		max-width: 800px;
		text-align: center;
		padding-left: 0;
	}



	.top-header {
		text-align: center;
		width: 100%;
	}

	.podium-title {
		font-family: var(--font-family-base);
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--content-primary);
		margin: 0;
	}

	.section-spacer {
		height: var(--spacing-13); /* 272px */
		width: 100%;
	}

	.line {
		font-family: var(--font-family-base);
		font-size: var(--text-l);
		font-weight: 700;
		line-height: 1.8;
		margin: 0;
		display: block;
		white-space: nowrap; /* keep whole line on one row */
		/* spacing between lines: reduced to ~16px */
		margin-bottom: var(--spacing-2);
	}

	.word {
		color: var(--neutral-400); 
		transition: color 0.1s ease-out;
		display: inline-block;
		white-space: pre;
	}

	.word.visible {
		color: var(--content-primary);
	}
</style>