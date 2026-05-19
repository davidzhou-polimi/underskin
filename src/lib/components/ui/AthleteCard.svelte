<script>
	import { flipCard } from '$lib/actions/flipCard.js';

	let { 
		name = "nome e cognome", 
		number = "0N",
		quote = "testo citazione",
		axis = 'Y', 
		imageSrc = "",
		colorBrand = "var(--archetipi-favorito)",
		colorBrandBack = "var(--azzurro-300)"
	} = $props();

	let rotateClass = $derived(axis === 'X' ? 'rotate-x' : 'rotate-y');
</script>

<div class="athlete-card-container" use:flipCard={{ axis }}>
	<div class="card-inner">
		
		<!-- FRONT -->
		<div class="card-face card-front">
			<div class="background-glass"></div>
			
			<div class="media-container">
				{#if imageSrc}
					<img src={imageSrc} alt={name} class="athlete-image" />
				{/if}
			</div>
			
			<div class="overlay-brand" style="background-color: {colorBrand};"></div>
			
			<!-- SVG Decals placeholder -->
			<div class="decal-top">
				<!-- imgRectangle90 from Figma -->
			</div>
			<div class="decal-bottom">
				<!-- imgRectangle91 from Figma -->
			</div>

			<div class="name-front">
				<p>{name}</p>
			</div>

			<div class="number-badge">
				<div class="badge-bg">
					<!-- Ellipse SVG fallback -->
				</div>
				<p>{number}</p>
			</div>
		</div>

		<!-- BACK -->
		<div class={`card-face card-back ${rotateClass}`} style="background-color: {colorBrandBack};">
			<!-- Inset Background (similar to video container on front) -->
			<div class="background-inset-back"></div>
			
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
		box-shadow: 2px 2px 4px 0px rgba(0,0,0,0.23);
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
	}

	.decal-top {
		position: absolute;
		top: 15px;
		left: 14px;
		width: 329px;
		height: 111px;
	}

	.decal-bottom {
		position: absolute;
		bottom: 14px;
		left: 14px;
		width: 329px;
		height: 72px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.name-front {
		position: absolute;
		bottom: 23%; /* Approx from inset */
		left: 14px;
		right: 14px;
		text-align: center;
		color: var(--content-primary);
		font-weight: var(--text-card-front-weight);
		font-size: var(--text-card-front-size);
		word-break: break-word;
		line-height: normal;
	}

	.number-badge {
		position: absolute;
		bottom: 21px;
		right: 74px; /* Approx positioning from inset */
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.badge-bg {
		position: absolute;
		inset: -2.7%;
		border-radius: 50%;
		border: 1px solid var(--content-primary); /* Fallback per l'SVG */
	}

	.number-badge p {
		position: relative;
		color: var(--content-primary);
		font-size: var(--text-service-size);
		font-weight: var(--text-service-weight);
	}

	/* BACK STYLES */
	.background-inset-back {
		position: absolute;
		top: 15px; 
		right: 14px; 
		bottom: 14px; 
		left: 14px;
		border-radius: var(--radius-s);
		/* Il mockup del retro non ha l'immagine ma ha uno sfondo/decal */
	}

	.back-content {
		position: absolute;
		inset: 15px 14px 14px 14px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-2) 0;
		color: var(--content-primary);
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
	}
</style>
