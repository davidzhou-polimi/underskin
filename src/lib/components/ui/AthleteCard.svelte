<script>
	import { flipCard } from '$lib/actions/flipCard.js';

	/**
	 * @type {{
	 *   name?: string,
	 *   number?: string,
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
		quote = "testo citazione",
		axis = 'Y', 
		imageSrc = "",
		type = 'favorito',
		duration = 0.8
	} = $props();

	// Mapping interno dei colori degli archetipi basato sui CSS Token del progetto
	const ARCHETYPE_COLORS = {
		favorito: {
			brand: 'var(--archetipi-favorito)',
			brandBack: 'var(--azzurro-300)'
		},
		infortunato: {
			brand: 'var(--archetipi-infortunato)',
			brandBack: 'var(--arancione-400)'
		},
		insoddisfatto: {
			brand: 'var(--archetipi-insoddisfatto)',
			brandBack: 'var(--viola-300)'
		}
	};

	let colors = $derived(ARCHETYPE_COLORS[type] ?? ARCHETYPE_COLORS.favorito);
	let colorBrand = $derived(colors.brand);
	let colorBrandBack = $derived(colors.brandBack);

	let rotateClass = $derived(axis === 'X' ? 'rotate-x' : 'rotate-y');

	// Genera ID unici per i gradienti SVG in modo da evitare collisioni nel DOM
	const instanceId = Math.random().toString(36).substring(2, 9);
	const paintTopId = `paintTop-${instanceId}`;
	const paintBottomId = `paintBottom-${instanceId}`;
</script>

<div class="athlete-card-container" use:flipCard={{ axis, duration }}>
	<div class="card-inner">
		
		<!-- FRONT -->
		<div class="card-face card-front">
			<!-- Glass background (ghiaccio) -->
			<div class="background-glass"></div>
			
			<!-- Video/Image container -->
			<div class="media-container">
				{#if imageSrc}
					<img src={imageSrc} alt={name} class="athlete-image" />
				{/if}
			</div>
			
			<!-- Color overlay (mix-blend-mode) -->
			<div class="overlay-brand" style="background-color: {colorBrand};"></div>
			
			<!-- Upper gradient (Sfumatura superiore) -->
			<svg class="decal-top" xmlns="http://www.w3.org/2000/svg" width="329" height="111" viewBox="0 0 329 111" fill="none">
				<path d="M0 16C0 7.16344 7.16344 0 16 0H313C321.837 0 329 7.16344 329 16V111H0V16Z" fill="url(#{paintTopId})"/>
				<defs>
					<linearGradient id={paintTopId} x1="166" y1="0" x2="166" y2="111" gradientUnits="userSpaceOnUse">
						<stop stop-color={colorBrandBack}/>
						<stop offset="1" stop-color={colorBrand} stop-opacity="0"/>
					</linearGradient>
				</defs>
			</svg>
			
			<!-- Lower gradient (Sfumatura inferiore) -->
			<svg class="decal-bottom" xmlns="http://www.w3.org/2000/svg" width="329" height="72" viewBox="0 0 329 72" fill="none">
				<path d="M329 56C329 64.8366 321.837 72 313 72L16 72C7.16345 72 6.26248e-07 64.8365 1.39876e-06 56L6.29444e-06 1.75548e-06L329 3.05176e-05L329 56Z" fill="url(#{paintBottomId})"/>
				<defs>
					<linearGradient id={paintBottomId} x1="163" y1="72" x2="163" y2="1.60054e-05" gradientUnits="userSpaceOnUse">
						<stop stop-color={colorBrandBack}/>
						<stop offset="1" stop-color={colorBrand} stop-opacity="0"/>
					</linearGradient>
				</defs>
			</svg>

			<!-- Name -->
			<div class="name-front">
				<p>{name}</p>
			</div>

			<!-- Number Badge (bottom right) -->
			<div class="number-badge">
				<svg class="badge-circle" xmlns="http://www.w3.org/2000/svg" width="39" height="39" viewBox="0 0 39 39" fill="none">
					<circle cx="19.5" cy="19.5" r="18.5" stroke="#071E45" stroke-width="2" stroke-linecap="round" stroke-dasharray="0.1 5"/>
				</svg>
				<p class="badge-number">{number}</p>
			</div>
		</div>

		<!-- BACK -->
		<div class={`card-face card-back ${rotateClass}`}>
			<!-- Glass background (ghiaccio) -->
			<div class="background-glass"></div>

			<!-- Solid Brand Background Inset -->
			<div class="background-inset-back" style="background-color: {colorBrandBack};"></div>
			
			<!-- Separator line (Stato hover SVG) -->
			<svg class="back-separator" xmlns="http://www.w3.org/2000/svg" width="290" height="2" viewBox="0 0 290 2" fill="none">
				<path d="M0 1H290" stroke="#071E45" stroke-width="2" stroke-dasharray="0.1 5"/>
			</svg>

			<!-- Back content container -->
			<div class="back-content">
				<div class="back-text name-back">
					<p>{name}</p>
				</div>
				<p class="back-text quote-text">
					{quote}
				</p>
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
	}

	.card-inner {
		width: 100%;
		height: 100%;
		position: relative;
		transform-style: preserve-3d;
	}

	.card-face {
		position: absolute;
		inset: 0;
		backface-visibility: hidden;
		border-radius: var(--radius-m);
		overflow: hidden;
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
		background-color: var(--background-primary);
		opacity: 0.5;
		box-shadow: 2px 2px 4px 0px rgba(0, 0, 0, 0.23);
		backdrop-filter: blur(13px);
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
	}

	.decal-bottom {
		position: absolute;
		bottom: 14px;
		left: 14px;
		width: 329px;
		height: 72px;
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
		color: var(--content-primary);
		font-weight: var(--text-card-front-weight);
		font-size: var(--text-card-front-size);
		word-break: break-word;
		line-height: normal;
		pointer-events: none;
	}

	.number-badge {
		position: absolute;
		bottom: 21px;
		right: 24px;
		width: 39px;
		height: 39px;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}

	.badge-circle {
		position: absolute;
		inset: 0;
	}

	.badge-number {
		position: relative;
		color: var(--content-primary);
		font-size: var(--text-service-size);
		font-weight: var(--text-service-weight);
		line-height: 20px;
		text-align: center;
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

	.back-separator {
		position: absolute;
		top: 95.5px;
		left: 33.5px;
		z-index: 2;
		pointer-events: none;
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
		padding: 0 var(--spacing-2);
		color: var(--content-primary);
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

	.quote-text {
		font-size: var(--text-service-size);
		line-height: 20px;
		text-align: center;
		width: 100%;
		height: 338px;
		margin: 0;
		/* Easing premium / delay handled by GSAP action */
	}
</style>
