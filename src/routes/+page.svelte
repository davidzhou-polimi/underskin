<script>
	import CursorTooltip from '$lib/components/ui/CursorTooltip.svelte';

	// Stato reattivo di Svelte 5 per tracciare il comportamento del cursore
	let tooltip = $state({
		visible: false,
		text: '',
		type: 'semplice',
		x: 0,
		y: 0
	});

	// Stato per il tipo di cursore sull'area di testo o sulle parole chiave
	let currentCursor = $state('default');

	// Funzione per aggiornare le coordinate del mouse in tempo reale
	function handleMouseMove(event) {
		tooltip.x = event.clientX;
		tooltip.y = event.clientY;
	}

	// Funzioni Helper per attivare e disattivare il tooltip al volo
	function showTooltip(text, type, cursorType = 'pointer') {
		tooltip.text = text;
		tooltip.type = type;
		tooltip.visible = true;
		currentCursor = cursorType;
	}

	function hideTooltip() {
		tooltip.visible = false;
		currentCursor = 'default';
	}
</script>

<main onmousemove={handleMouseMove} style:cursor={currentCursor}>
	
	<section class="text-container-section">
		<p class="main-paragraph">
			La pressione cresce fino a trasformarsi in 
			
			<span 
				class="highlight-word"
				onmouseenter={() => showTooltip("Ansia della prestazione legata al timore di non riuscire a raggiungere un determinato obiettivo", "paragrafo", "pointer")}
				onmouseleave={hideTooltip}
			>
				Fear of Failure
			</span>, 
			
			mentre il bisogno di essere perfetti porta spesso al 
			
			<span 
				class="highlight-word"
				onmouseenter={() => showTooltip("PROVA", "semplice", "pointer")}
				onmouseleave={hideTooltip}
			>
				Choking Under Pressure
			</span>: 
			
			momento in cui la mente interferisce con ciò che anni di allenamento avevano reso naturale.
		</p>
	</section>

	<CursorTooltip {...tooltip} />

</main>

<style>
	/* Contenitore per centrare la sezione e impostare la larghezza richiesta */
	.text-container-section {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 50vh; /* Centrato verticalmente nella viewport */
		padding: var(--spacing-5);
	}

	/* La casella di testo larga esattamente 910px (convertita in rem assumendo 16px di base, 910/16 = 56.875rem) */
	.main-paragraph {
		width: 56.875rem; 
		max-width: 100%;
		text-align: center; /* Centra il testo all'interno della casella */
		
		/* Design Tokens richiesti per il testo principale */
		font-size: var(--text-body-size);
		font-weight: var(--text-body-weight);
		color: var(--content-primary);
		line-height: 1.6;
	}

	/* Stile per le parole interattive */
	.highlight-word {
		color: var(--archetipi-infortunato);
		font-weight: inherit; /* Mantiene il peso del paragrafo o puoi accentuarlo se vuoi */
		display: inline-block;
		text-decoration: underline; /* Opzionale: un leggero feedback visivo per l'utente */
		text-underline-offset: 4px;
		transition: opacity 0.2s ease;
	}

	.highlight-word:hover {
		opacity: 0.85; /* Leggero feedback all'hover */
	}
</style>