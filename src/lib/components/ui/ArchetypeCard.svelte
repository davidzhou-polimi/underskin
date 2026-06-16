<script>
	import { hoverLift } from '$lib/actions/hoverLift.js';
	import { tooltip } from '$lib/stores/tooltipState.svelte.js';

	/**
	 * @type {{
	 *   name?: string,
	 *   videoSrc?: string,
	 *   imageSrc?: string,
	 *   type?: 'favorito' | 'infortunato' | 'insoddisfatto',
	 *   isPlaying?: boolean,
	 *   horizontal?: boolean,
	 *   clickable?: boolean
	 * }}
	 */
	let { 
		name = "nome e cognome", 
		videoSrc = "",
		imageSrc = "",
		type = 'favorito',
		isPlaying = false,
		horizontal = false,
		clickable = true
	} = $props();

	// Tracciamo lo stato hover locale per controllare la riproduzione video in modalità orizzontale
	let isHovered = $state(false);
	// Riproduciamo il video se la card è attiva (carousel) o se l'utente ci passa sopra con il mouse
	let shouldPlay = $derived(isPlaying || isHovered);

	/** @type {HTMLVideoElement | null} */
	let videoElement = $state(null);

	// Avviamo o stoppiamo la riproduzione in base allo stato attivo o all'hover dell'utente
	$effect(() => {
		if (!videoElement) return;
		if (shouldPlay) {
			videoElement.play().catch(() => {
				// Il browser potrebbe bloccare play() prima di un'interazione utente: ignoriamo l'eccezione
			});
		} else {
			videoElement.pause();
		}
	});

	// Commento solo il PERCHÉ: il testo in primo piano deve usare il token di contenuto scuro per garantire leggibilità e correttezza semantica, mentre var(--background-primary) è riservato esclusivamente a sfondi.
	const ARCHETYPE_COLORS = {
		favorito: {
			brand: 'var(--azzurro-700)',
			textPrimary: 'var(--content-dark-primary)'
        },
		infortunato: {
			brand: 'var(--arancione-700)',
			textPrimary: 'var(--content-dark-primary)'
		},
		insoddisfatto: {
			brand: 'var(--viola-700)',
			textPrimary: 'var(--content-dark-primary)'
		}
	};

	let colors = $derived(ARCHETYPE_COLORS[type] ?? ARCHETYPE_COLORS.favorito);
	let colorBrand = $derived(colors.brand);
	let colorTextPrimary = $derived(colors.textPrimary);
</script>

<!-- Trasformato in link semantico per delegare la navigazione a SvelteKit e supportare l'accessibilità -->
<a href="/{type}"
    class="archetype-card-container"
    class:is-horizontal={horizontal}
    use:hoverLift
    onmouseenter={() => { isHovered = true; tooltip.show('Esplora', 'semplice', 'pointer'); }}
    onmouseleave={() => { isHovered = false; tooltip.hide(); }}
>
    <div class="card-inner" style="--text-primary: {colorTextPrimary};">
        <!-- Sfondo glassato ad effetto ghiaccio -->
        <div class="glass-effect background-glass"></div>
        
        <!-- Contenitore video/media dell'archetipo -->
        <div class="media-container">
            {#if imageSrc}
                <img src={imageSrc} alt={name} class="athlete-image" loading="lazy" decoding="async" />
            {:else if videoSrc}
                <video bind:this={videoElement} src={videoSrc} muted loop playsinline class="athlete-video"></video>
            {/if}
        </div>
        
        <!-- Overlay di colore con mix-blend-mode per applicare il colore dell'archetipo -->
        <div class="overlay-brand" style="background-color: {colorBrand};"></div>
        
        <!-- Nome dell'atleta in sovrapposizione frontale -->
        <div class="name-front">
            <span>{name}</span>
        </div>
    </div>
</a>

<style>
	.archetype-card-container {
		width: 357px;
		height: 461px;
		position: relative;
		cursor: pointer;
		will-change: transform;
		-webkit-font-smoothing: subpixel-antialiased;
		/* display: block e text-decoration: none servono a preservare il corretto layout box-model della card ed evitare sottolineature ereditate dai link del browser */
		display: block;
		text-decoration: none;
	}

	.card-inner {
		width: 100%;
		height: 100%;
		position: relative;
		border-radius: var(--radius-m);
		will-change: transform;
		overflow: hidden;
	}

	.background-glass {
		position: absolute;
		inset: 0;
		opacity: 0.5;
		transition: background 0.3s ease;
	}

	.archetype-card-container:hover .background-glass {
		background-color: rgb(from var(--neutral-100) r g b / 0.7);
	}

	.media-container {
		position: absolute;
		top: 15px; 
		right: 14px; 
		bottom: 14px; 
		left: 14px;
		border-radius: var(--radius-s);
		overflow: hidden;
		background-color: var(--neutral-200);
	}

	.athlete-video,
	.athlete-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none;
	}

	.overlay-brand {
		position: absolute;
		top: 15px; 
		right: 14px; 
		bottom: 14px; 
		left: 14px;
		mix-blend-mode: color;
		border-radius: var(--radius-s);
		pointer-events: none;
	}


	.name-front {
		position: absolute;
		top: 15px;
		left: 14px;
		width: 329px;
		height: 91px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		text-align: center;
		color: var(--text-primary);
		font-weight: var(--text-card-front-weight);
		font-size: var(--text-card-front-size);
		word-break: break-word;
		line-height: normal;
		pointer-events: none;
	}

	/* ─── MODALITÀ ORIZZONTALE ────────────────────────────────────────────── */
	.archetype-card-container.is-horizontal {
		/* Dimensioni inverse rispetto a quella verticale (357x461 -> 461x357) */
		width: 461px;
		max-width: 100%;
		height: 357px;
	}

	.archetype-card-container.is-horizontal .name-front {
		/* Adattiamo la larghezza del testo al nuovo contenitore orizzontale */
		width: calc(100% - 28px);
	}
</style>
