<script>
	import { flipCard } from '$lib/actions/flipCard.js';
	import { hoverLift } from '$lib/actions/hoverLift.js';

	/**
	 * @type {{
	 *   name?: string,
	 *   number?: string,
	 *   context?: string,
	 *   quote?: string,
	 *   axis?: 'X' | 'Y',
	 *   imageSrc?: string,
	 *   type?: 'favorito' | 'infortunato' | 'insoddisfatto',
	 *   duration?: number
	 * }}
	 */
	let { 
		name = "nome e cognome", 
		number = "0N",
		context = "",
		quote = "testo citazione",
		axis = 'Y', 
		imageSrc = "",
		type = 'favorito',
		duration = 1.0
	} = $props();

	// Mapping interno dei colori degli archetipi basato sui CSS Token del progetto
	// Usiamo scale cromatiche specifiche per differenziare i toni del retro e dei testi
	const ARCHETYPE_COLORS = {
		favorito: {
			brand: 'var(--archetipi-favorito)',
			brandBack: 'var(--azzurro-300)',
			brandBackEnd: 'var(--azzurro-100)',
			textPrimary: 'var(--azzurro-900)',
			textSecondary: 'var(--azzurro-700)'
		},
		infortunato: {
			brand: 'var(--archetipi-infortunato)',
			brandBack: 'var(--arancione-300)',
			brandBackEnd: 'var(--arancione-100)',
			textPrimary: 'var(--arancione-900)',
			textSecondary: 'var(--arancione-700)'
		},
		insoddisfatto: {
			brand: 'var(--archetipi-insoddisfatto)',
			brandBack: 'var(--viola-300)',
			brandBackEnd: 'var(--viola-100)',
			textPrimary: 'var(--viola-900)',
			textSecondary: 'var(--viola-700)'
		}
	};

	let colors = $derived(ARCHETYPE_COLORS[type] ?? ARCHETYPE_COLORS.favorito);
	let colorBrand = $derived(colors.brand);
	let colorBrandBack = $derived(colors.brandBack);
	let colorBrandBackEnd = $derived(colors.brandBackEnd);
	let colorTextPrimary = $derived(colors.textPrimary);
	let colorTextSecondary = $derived(colors.textSecondary);

	let rotateClass = $derived(axis === 'X' ? 'rotate-x' : 'rotate-y');
</script>

<div class="athlete-card-container" use:flipCard={{ axis, duration }} use:hoverLift>
	<div class="card-inner">
		
		<!-- FRONT -->
		<div class="card-face card-front" style="--text-primary: {colorTextPrimary};">
			<!-- Glass background (ghiaccio) -->
			<div class="background-glass"></div>
			
			<!-- Video/Image container -->
			<div class="media-container">
				{#if imageSrc}
					<img src={imageSrc} alt={name} class="athlete-image" loading="lazy" decoding="async" />
				{/if}
			</div>
			
			<!-- Color overlay (mix-blend-mode) -->
			<div class="overlay-brand" style="background-color: {colorBrand};"></div>
			
			<!-- Upper gradient (Sfumatura superiore) -->
			<div class="decal-top" style="--gradient-start: {colorBrandBack};"></div>

			<!-- Name -->
			<div class="name-front">
				<p>{name}</p>
			</div>
		</div>

		<!-- BACK -->
		<div class={`card-face card-back ${rotateClass}`} style="--text-primary: {colorTextPrimary}; --text-secondary: {colorTextSecondary};">
			<!-- Glass background (ghiaccio) -->
			<div class="background-glass"></div>

			<!-- Dynamic Brand Gradient Background Inset -->
			<div class="background-inset-back" style="background: linear-gradient(to bottom, {colorBrandBack} 0%, {colorBrandBackEnd} 50%, {colorBrandBackEnd} 100%);"></div>

			<!-- Back content container -->
			<div class="back-content">
				<div class="back-text name-back">
					<p>{name}</p>
				</div>
				<div class="info-retro">
					{#if context}
						<p class="back-text context-text">
							{context}
						</p>
					{/if}
					{#if quote}
						<div class="back-text quote-container">
							<svg class="quote-icon" width="18" height="13" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M4.032 4.896V5.184C4.992 5.28 5.832 5.664 6.552 6.336C7.272 6.96 7.632 7.752 7.632 8.712C7.632 9.624 7.29599 10.44 6.62399 11.16C5.95199 11.88 5.04 12.24 3.888 12.24C2.784 12.24 1.848 11.736 1.08 10.728C0.360002 9.72 0 8.472 0 6.984C0 5.496 0.648 3.96 1.944 2.376C3.288 0.792002 4.632 0 5.976 0C6.408 0 6.62399 0.0720005 6.62399 0.216002C6.62399 0.360003 6.528 0.432003 6.336 0.432003C6.144 0.432003 5.784 0.792004 5.256 1.512C4.44 2.568 4.032 3.696 4.032 4.896ZM14.328 4.896V5.184C15.288 5.28 16.128 5.664 16.848 6.336C17.568 6.96 17.928 7.752 17.928 8.712C17.928 9.624 17.592 10.44 16.92 11.16C16.296 11.88 15.408 12.24 14.256 12.24C13.152 12.24 12.216 11.736 11.448 10.728C10.68 9.72 10.296 8.472 10.296 6.984C10.296 5.496 10.968 3.96 12.312 2.376C13.656 0.792002 15 0 16.344 0C16.728 0 16.92 0.0720005 16.92 0.216002C16.92 0.360003 16.872 0.432003 16.776 0.432003C16.488 0.432003 16.08 0.792004 15.552 1.512C14.736 2.616 14.328 3.744 14.328 4.896Z" fill="currentColor"/>
							</svg>
							<p class="quote-text">
								{quote}
							</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.athlete-card-container {
		width: 357px;
		height: 461px;
		position: relative;
		cursor: pointer;
		perspective: 1200px;
		will-change: transform;
		-webkit-font-smoothing: subpixel-antialiased;
		backface-visibility: hidden;
	}

	.card-inner {
		width: 100%;
		height: 100%;
		position: relative;
		transform-style: preserve-3d;
		box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.23);
		border-radius: var(--radius-m);
		transition: box-shadow 0.3s ease-out;
		will-change: transform;
	}

	/* .athlete-card-container:hover .card-inner {
		box-shadow: 0px 16px 32px 0px rgba(0, 0, 0, 0.28);
	} */

	.card-face {
		position: absolute;
		inset: 0;
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
		border-radius: var(--radius-m);
		overflow: hidden;
		-webkit-font-smoothing: subpixel-antialiased;
	}

	.card-front {
		user-select: none;
		-webkit-user-select: none;
	}

	.card-back.rotate-y {
		transform: rotateY(180deg);
	}

	.card-back.rotate-x {
		transform: rotateX(180deg);
	}

	.background-glass {
		position: absolute;
		inset: 0;
		background-color: rgb(from var(--neutral-100) r g b / 0.5);
		border: 1px solid rgb(from var(--neutral-50) r g b / 0.3);
		opacity: 0.5;
		backdrop-filter: blur(13px);
		transition: background 0.3s ease;
	}

	.athlete-card-container:hover .background-glass {
		background-color: rgb(from var(--neutral-100) r g b / 0.7);
	}



	/* FRONT STYLES */
	.media-container {
		position: absolute;
		top: 15px; 
		right: 14px; 
		bottom: 14px; 
		left: 14px;
		border-radius: var(--radius-s);
		overflow: hidden;
		background-color: var(--neutral-200); /* Fallback style */
	}

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

	.decal-top {
		position: absolute;
		top: 15px;
		left: 14px;
		width: 329px;
		height: 111px;
		pointer-events: none;
		background: linear-gradient(to bottom, var(--gradient-start) 0%, transparent 100%);
		border-radius: var(--radius-s) var(--radius-s) 0 0;
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

	/* BACK STYLES */
	.background-inset-back {
		position: absolute;
		top: 15px; 
		right: 14px; 
		bottom: 14px; 
		left: 14px;
		border-radius: var(--radius-s);
	}

	.back-content {
		position: absolute;
		top: 15px;
		left: 14px;
		width: 329px;
		height: 432px;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0 var(--spacing-3);
		color: var(--text-primary);
		z-index: 1;
	}

	.name-back {
		font-weight: var(--text-card-front-weight);
		font-size: var(--text-card-front-size);
		text-align: center;
		line-height: normal;
		width: 100%;
		height: 91px;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.info-retro {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		flex: 1;
		padding-bottom: var(--spacing-4, 32px);
		box-sizing: border-box;
	}

	.context-text {
		font-size: var(--text-card-back-context-size);
		line-height: 20px;
		margin: 0;
		font-weight: var(--text-card-back-context-weight);
		text-align: center;
		white-space: pre-line;
	}

	.quote-container {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2, 16px);
		align-items: center;
		justify-content: flex-end;
		width: 100%;
		color: var(--text-secondary);
	}

	.quote-icon {
		flex-shrink: 0;
		color: var(--text-secondary);
	}

	.quote-text {
		font-size: 1.25rem; /* 20px from Figma spec */
		line-height: normal;
		font-style: italic;
		margin: 0;
		font-weight: var(--text-card-back-quote-weight);
		text-align: center;
		white-space: pre-line;
	}
</style>
