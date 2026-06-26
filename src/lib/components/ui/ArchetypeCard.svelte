<script>
	import { hoverLift } from '$lib/actions/hoverLift.js';
	import { hoverHorizontalCard } from '$lib/actions/archetypes/hoverHorizontalCard.js';
	import { tooltip } from '$lib/stores/tooltipState.svelte.js';
	import { goto } from '$app/navigation';

	/**
	 * @type {{
	 *   name?: string,
	 *   videoSrc?: string,
	 *   imageSrc?: string,
	 *   type?: 'favorito' | 'infortunato' | 'insoddisfatto',
	 *   isPlaying?: boolean,
	 *   horizontal?: boolean,
	 *   clickable?: boolean,
	 *   showTooltip?: boolean
	 * }}
	 */
	let { 
		name = "nome e cognome", 
		videoSrc = "",
		imageSrc = "",
		type = 'favorito',
		isPlaying = false,
		horizontal = false,
		clickable = true,
		showTooltip = true
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
			videoElement.currentTime = 0;
		}
	});

	// Commento solo il PERCHÉ: il testo in primo piano deve usare il token di contenuto scuro per garantire leggibilità e correttezza semantica, mentre var(--background-primary) è riservato esclusivamente a sfondi.
	const ARCHETYPE_COLORS = {
		favorito: {
			brand: 'var(--azzurro-700)',
			textPrimary: 'var(--content-dark-primary)',
			gradientStart: 'var(--azzurro-800)'
		},
		infortunato: {
			brand: 'var(--arancione-700)',
			textPrimary: 'var(--content-dark-primary)',
			gradientStart: 'var(--arancione-800)'
		},
		insoddisfatto: {
			brand: 'var(--viola-700)',
			textPrimary: 'var(--content-dark-primary)',
			gradientStart: 'var(--viola-800)'
		}
	};

	let colors = $derived(ARCHETYPE_COLORS[type] ?? ARCHETYPE_COLORS.favorito);
	let colorBrand = $derived(colors.brand);
	let colorTextPrimary = $derived(colors.textPrimary);
	let colorGradientStart = $derived(colors.gradientStart);

	/**
	 * Gestisce il click per navigare programmaticamente verso il profilo dell'archetipo
	 */
	const handleCardClick = async () => {
		// Commento solo il PERCHÉ: eseguiamo la navigazione programmatica solo se la card è configurata come cliccabile
		if (clickable) {
			await goto(`/${type}`);
		}
	};
</script>

<!-- Sostituito tag <a> con <button> per evitare l'anteprima dell'URL nativa nel browser -->
<button
    class="archetype-card-container"
    class:is-horizontal={horizontal}
    use:hoverLift
    use:hoverHorizontalCard={{ enabled: horizontal }}
    onclick={handleCardClick}
    onmouseenter={() => { isHovered = true; if (showTooltip) tooltip.show('Esplora', 'semplice', 'pointer'); }}
    onmouseleave={() => { isHovered = false; if (showTooltip) tooltip.hide(); }}
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

            <!-- Overlay di colore con mix-blend-mode per applicare il colore dell'archetipo -->
            <div class="overlay-brand" style="background-color: {colorBrand};"></div>
            
            <!-- Upper gradient (Sfumatura superiore) -->
            <div class="decal-top" style="--gradient-start: {colorGradientStart};"></div>

            <!-- Nome dell'atleta in sovrapposizione frontale -->
            <div class="name-front">
                <span>{name}</span>
            </div>
        </div>
    </div>
</button>

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
		/* Commento solo il PERCHÉ: applica il reset visivo per bottoni in modo che la card mantenga l'aspetto e l'allineamento del design originale */
		background: transparent;
		border: none;
		padding: 0;
		text-align: inherit;
		font-family: inherit;
		color: inherit;
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
		background-color: rgb(from var(--neutral-100) r g b / 0.8);
	}

	.media-container {
		/* Commento solo il PERCHÉ: utilizziamo il token di padding per permettere la regolazione dello spessore del bordo glass tramite design system */
		position: absolute;
		top: var(--card-glass-padding); 
		right: var(--card-glass-padding); 
		bottom: var(--card-glass-padding); 
		left: var(--card-glass-padding);
		/* Commento solo il PERCHÉ: calcoliamo il radius per essere concentrico al bordo esterno in base al padding corrente */
		border-radius: calc(var(--radius-m) - var(--card-glass-padding));
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
		/* Commento solo il PERCHÉ: occupiamo l'intera area del contenitore media per applicare uniformemente l'overlay di colore */
		position: absolute;
		inset: 0;
		mix-blend-mode: color;
		pointer-events: none;
	}

	.decal-top {
		/* Commento solo il PERCHÉ: posizioniamo il gradiente ancorato al bordo superiore del media container */
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 111px;
		pointer-events: none;
		background: linear-gradient(to bottom, var(--gradient-start) 0%, transparent 100%);
		/* Commento solo il PERCHÉ: ottimizziamo le performance di rendering hardware per le traslazioni GSAP */
		will-change: transform, opacity;
	}


	.name-front {
		/* Commento solo il PERCHÉ: posizioniamo il testo del nome ancorato al bordo superiore del media container */
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
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
		/* Commento solo il PERCHÉ: ottimizziamo le performance di rendering hardware per le traslazioni GSAP */
		will-change: transform, opacity;
	}

	/* ─── MODALITÀ ORIZZONTALE ────────────────────────────────────────────── */
	.archetype-card-container.is-horizontal {
		/* Dimensioni inverse rispetto a quella verticale (357x461 -> 461x357) */
		width: 461px;
		max-width: 100%;
		height: 357px;
	}

	.archetype-card-container.is-horizontal .athlete-video,
	.archetype-card-container.is-horizontal .athlete-image {
		transform: scale(1.2);
	}
</style>
