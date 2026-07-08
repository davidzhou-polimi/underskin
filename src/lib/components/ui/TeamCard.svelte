<script>
	// Tracciamo lo stato hover locale per controllare il glass effect
	let isHovered = $state(false);

	/**
	 * @type {{
	 *   name?: string,
	 *   imageSrc?: string,
	 *   type?: 'favorito' | 'infortunato' | 'insoddisfatto',
	 *   horizontal?: boolean,
	 *   clickable?: boolean
	 * }}
	 */
	let {
		name = "nome e cognome",
		imageSrc = "",
		type = 'favorito',
		horizontal = false,
		clickable = true
	} = $props();

	// Commento solo il PERCHÉ: il testo in primo piano deve usare il token di contenuto scuro per garantire leggibilità e correttezza semantica, mentre var(--background-primary) è riservato esclusivamente a sfondi.
	const TEAM_COLORS = {
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

	let colors = $derived(TEAM_COLORS[type] ?? TEAM_COLORS.favorito);
	let colorBrand = $derived(colors.brand);
	let colorTextPrimary = $derived(colors.textPrimary);
	let colorGradientStart = $derived(colors.gradientStart);

	// Le varianti responsive sono generate da scripts/convert-webp.js (RESPONSIVE_DIRS):
	// la card riceve il path base e costruisce srcset, così il browser scarica solo
	// la risoluzione necessaria — già pronto per il futuro layout mobile full-bleed.
	const SRCSET_WIDTHS = [800, 1600, 1920];
	let imageSrcset = $derived(
		imageSrc
			? SRCSET_WIDTHS.map((w) => `${imageSrc.replace(/\.webp$/, `-${w}.webp`)} ${w}w`).join(', ')
			: ''
	);
	let imageFallbackSrc = $derived(imageSrc ? imageSrc.replace(/\.webp$/, '-800.webp') : '');
</script>

<div
    class="team-card-container"
    class:non-clickable={!clickable}
    class:is-horizontal={horizontal}
    onmouseenter={() => { isHovered = true; }}
    onmouseleave={() => { isHovered = false; }}
    role="presentation"
>
    <div class="card-inner" style="--text-primary: {colorTextPrimary};">
        <div class="glass-effect background-glass"></div>

        <div class="media-container">
            {#if imageSrc}
                <img
                    src={imageFallbackSrc}
                    srcset={imageSrcset}
                    sizes="(max-width: 768px) 100vw, 461px"
                    alt={name}
                    class="team-member-image"
                    decoding="async"
                />
            {/if}

            <!-- Overlay di colore con mix-blend-mode per applicare il colore dell'archetipo -->
            <div class="overlay-brand" style="background-color: {colorBrand};"></div>

            <!-- Upper gradient (Sfumatura superiore) -->
            <div class="decal-top" style="--gradient-start: {colorGradientStart};"></div>

            <div class="name-front">
                <span>{name}</span>
            </div>
        </div>
    </div>
</div>

<style>
	.team-card-container {
		width: 100%;
		height: 100%;
		position: relative;
		cursor: pointer;
		will-change: transform;
		-webkit-font-smoothing: subpixel-antialiased;
		/* display: block e text-decoration: none servono a preservare il corretto layout box-model della card ed evitare sottolineature ereditate dai link del browser */
		display: block;
		text-decoration: none;
	}

	.team-card-container.non-clickable {
		cursor: default;
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

	.team-card-container:hover .background-glass {
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

	.team-member-image {
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
	}

	/* ─── MODALITÀ ORIZZONTALE ────────────────────────────────────────────── */
	.team-card-container.is-horizontal {
		/* Dimensioni inverse rispetto a quella verticale (357x461 -> 461x357) */
		width: 461px;
		max-width: 100%;
		height: 357px;
	}
</style>
