<script>
	import { hoverLift } from '$lib/actions/hoverLift.js';

	/**
	 * @type {{
	 *   name?: string,
	 *   videoSrc?: string,
	 *   type?: 'favorito' | 'infortunato' | 'insoddisfatto',
	 *   isPlaying?: boolean
	 * }}
	 */
	let { 
		name = "nome e cognome", 
		videoSrc = "",
		type = 'favorito',
		isPlaying = false
	} = $props();

	/** @type {HTMLVideoElement | null} */
	let videoElement = $state(null);

	// Controlliamo reattivamente il video per riprodurlo solo quando la card è attiva,
	// riducendo il carico di risorse della pagina (GPU/CPU) per i video non in primo piano.
	$effect(() => {
		if (!videoElement) return;
		if (isPlaying) {
			videoElement.play().catch(() => {
				// Il browser potrebbe bloccare play() prima di un'interazione utente: ignoriamo l'eccezione
			});
		} else {
			videoElement.pause();
		}
	});

	// Mappiamo i colori specifici per l'overlay dell'archetipo, usando i toni -700 per il brand
	// e i rispettivi toni coordinati del tema per i testi.
	const ARCHETYPE_COLORS = {
		favorito: {
			brand: 'var(--azzurro-700)',
			textPrimary: 'var(--background-primary)'
        },
		infortunato: {
			brand: 'var(--arancione-700)',
			textPrimary: 'var(--background-primary)'
		},
		insoddisfatto: {
			brand: 'var(--viola-700)',
			textPrimary: 'var(--background-primary)'
		}
	};

	let colors = $derived(ARCHETYPE_COLORS[type] ?? ARCHETYPE_COLORS.favorito);
	let colorBrand = $derived(colors.brand);
	let colorTextPrimary = $derived(colors.textPrimary);
</script>

<div class="archetype-card-container" use:hoverLift>
	<div class="card-inner" style="--text-primary: {colorTextPrimary};">
		<!-- Sfondo glassato ad effetto ghiaccio -->
		<div class="background-glass"></div>
		
		<!-- Contenitore video/media dell'archetipo -->
		<div class="media-container">
			{#if videoSrc}
				<video bind:this={videoElement} src={videoSrc} muted loop playsinline class="athlete-video"></video>
			{/if}
		</div>
		
		<!-- Overlay di colore con mix-blend-mode per applicare il colore dell'archetipo -->
		<div class="overlay-brand" style="background-color: {colorBrand};"></div>
		


		<!-- Nome dell'atleta in sovrapposizione frontale -->
		<div class="name-front">
			<p>{name}</p>
		</div>
	</div>
</div>

<style>
	.archetype-card-container {
		width: 357px;
		height: 461px;
		position: relative;
		cursor: pointer;
		will-change: transform;
		-webkit-font-smoothing: subpixel-antialiased;
	}

	.card-inner {
		width: 100%;
		height: 100%;
		position: relative;
		box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.23);
		border-radius: var(--radius-m);
		transition: box-shadow 0.3s ease-out;
		will-change: transform;
		overflow: hidden;
	}

	.background-glass {
		position: absolute;
		inset: 0;
		background-color: rgb(from var(--neutral-100) r g b / 0.5);
		border: 1px solid rgb(from var(--neutral-50) r g b / 0.3);
		opacity: 0.5;
		backdrop-filter: blur(px);
		transition: background 0.3s ease;
	}

	.archetype-card-container:hover .background-glass {
		background: rgba(241, 250, 253, 0.65);
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

	.athlete-video {
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
</style>
