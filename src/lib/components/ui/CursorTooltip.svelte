<script>
	// Utilizziamo le nuove Runes di Svelte 5 per gestire lo stato del tooltip condiviso
	// In alternativa, lo esportiamo in modo da poter essere pilotato dall'esterno
	let { 
		visible = false, 
		text = '', 
		type = 'semplice', // 'semplice' o 'paragrafo'
		x = 0, 
		y = 0 
	} = $props();

	// Offset geometrico basato sull'immagine "distanza.png"
	// Sposta il riquadro in modo che l'angolo alto-sinistra tocchi l'angolo basso-destra del cursore standard
	const OFFSET_X = 12; 
	const OFFSET_Y = 18;
</script>

{#if visible && text}
	<div 
		class="cursor-tooltip" 
		class:mod-paragrafo={type === 'paragrafo'}
		class:mod-semplice={type === 'semplice'}
		style:left="{x + OFFSET_X}px"
		style:top="{y + OFFSET_Y}px"
	>
		{text}
	</div>
{/if}

<style>
	.cursor-tooltip {
		position: fixed;
		pointer-events: none; /* Evita che il tooltip interferisca con i click e l'hover dell'utente */
		z-index: 9999;
		
		/* Stili base condivisi richiesti */
		font-size: var(--text-caption-size);
		font-weight: var(--text-caption-weight);
		color: var(--content-primary);
		background-color: var(--neutral-200);
		
		/* Padding richiesti */
		padding: var(--spacing-2) var(--spacing-3);
		
		/* Reset e fluidità di posizionamento */
		white-space: pre-line; /* Permette l'andata a capo automatica nel testo lungo */
		will-change: left, top;
		box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08); /* Un leggero' ombra per staccarlo dallo sfondo */
	}

	/* Modalità Semplice */
	.mod-semplice {
		border-radius: var(--radius-l);
		max-width: 250px;
	}

	/* Modalità Paragrafo */
	.mod-paragrafo {
		border-radius: var(--radius-s);
		max-width: 320px; /* Un po' più largo per i paragrafi esplicativi */
		line-height: 1.4;
	}
</style>