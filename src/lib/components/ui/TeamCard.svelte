<script>
	import { hoverLift } from '$lib/actions/hoverLift.js';

	/**
	 * @type {{
	 *   name?: string,
	 *   imageSrc?: string,
	 *   type?: 'favorito' | 'infortunato' | 'insoddisfatto',
	 *   horizontal?: boolean
	 * }}
	 */
	let {
		name = "nome e cognome",
		imageSrc = "",
		type = 'favorito',
		horizontal = false
	} = $props();

	// Tracciamo lo stato hover locale per controllare il glass effect
	let isHovered = $state(false);

	// Commento solo il PERCHÉ: il testo in primo piano deve usare il token di contenuto scuro per garantire leggibilità e correttezza semantica, mentre var(--background-primary) è riservato esclusivamente a sfondi.
	const TEAM_COLORS = {
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

	let colors = $derived(TEAM_COLORS[type] ?? TEAM_COLORS.favorito);
	let colorBrand = $derived(colors.brand);
	let colorTextPrimary = $derived(colors.textPrimary);
</script>

<div
    class="team-card-container non-clickable"
    class:is-horizontal={horizontal}
    use:hoverLift
    onmouseenter={() => { isHovered = true; }}
    onmouseleave={() => { isHovered = false; }}
    role="presentation"
>
    <div class="card-inner" style="--text-primary: {colorTextPrimary};">
        <div class="glass-effect background-glass"></div>

        <div class="media-container">
            {#if imageSrc}
                <img src={imageSrc} alt={name} class="team-member-image" loading="lazy" decoding="async" />
            {/if}
        </div>

        <div class="overlay-brand" style="background-color: {colorBrand};"></div>

        <div class="name-front">
            <span>{name}</span>
        </div>
    </div>
</div>

<style>
	.team-card-container {
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
		/* Commento solo il PERCHÉ: utilizziamo lo stesso padding dinamico del media-container per far coincidere perfettamente l'overlay colore */
		position: absolute;
		top: var(--card-glass-padding);
		right: var(--card-glass-padding);
		bottom: var(--card-glass-padding);
		left: var(--card-glass-padding);
		mix-blend-mode: color;
		/* Commento solo il PERCHÉ: applichiamo lo stesso radius concentrico calcolato per allinearsi al media-container */
		border-radius: calc(var(--radius-m) - var(--card-glass-padding));
		pointer-events: none;
	}

	.name-front {
		/* Commento solo il PERCHÉ: calcoliamo posizionamento e larghezza dinamici per allineare il testo del nome con i bordi del media-container */
		position: absolute;
		top: var(--card-glass-padding);
		left: var(--card-glass-padding);
		width: calc(100% - (2 * var(--card-glass-padding)));
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

	.team-card-container.is-horizontal .name-front {
		/* Commento solo il PERCHÉ: calcoliamo la larghezza in base al padding per allineare correttamente il nome anche in modalità orizzontale */
		width: calc(100% - (2 * var(--card-glass-padding)));
	}
</style>
