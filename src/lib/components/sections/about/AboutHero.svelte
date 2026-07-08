<script>
	import { heroParallax } from '$lib/actions/archetypes/heroParallax.js';

	// Commento solo il PERCHÉ: memorizziamo il riferimento al container della sezione per passarlo come trigger dell'effetto ScrollTrigger di GSAP
	/** @type {HTMLElement | null} */
	let sectionRef = $state(null);
</script>

<section class="about-hero" bind:this={sectionRef}>
	<div class="sticky-viewport">
		<div class="text-container">
			{#if sectionRef}
				<!-- Layout Desktop: titolo statico centrato -->
				<h1 use:heroParallax={{ trigger: sectionRef }} class="title desktop-only">
					IL PROGETTO
				</h1>

				<!-- Layout Mobile: marquee a scorrimento continuo -->
				<div use:heroParallax={{ trigger: sectionRef }} class="marquee-container mobile-only">
					<div class="marquee-track">
						<span class="marquee-item">IL PROGETTO</span>
						<span class="marquee-item glass-text">IL PROGETTO</span>
						<span class="marquee-item">IL PROGETTO</span>
						<span class="marquee-item glass-text">IL PROGETTO</span>
						<span class="marquee-item" aria-hidden="true">IL PROGETTO</span>
						<span class="marquee-item glass-text" aria-hidden="true">IL PROGETTO</span>
						<span class="marquee-item" aria-hidden="true">IL PROGETTO</span>
						<span class="marquee-item glass-text" aria-hidden="true">IL PROGETTO</span>
					</div>
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.about-hero {
		position: relative;
		width: 100%;
		height: 100dvh;
		background-color: transparent;
	}

	.sticky-viewport {
		position: sticky;
		top: 0;
		left: 0;
		width: 100%;
		height: 100dvh;
		overflow: hidden;
	}

	.text-container {
		position: absolute;
		inset: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 10;
		padding: 0 var(--spacing-4);
		pointer-events: none;
	}

	.title {
		text-align: center;
		margin: 0;
		white-space: nowrap;
		word-wrap: normal;
		max-width: 100%;
		line-height: 1.05;
		color: var(--neutral-50);
		font-size: var(--text-title-size);
	}

	.desktop-only {
		display: block;
	}
	.mobile-only {
		display: none;
	}

	@media (max-width: 768px) {
		.desktop-only {
			display: none;
		}
		.mobile-only {
			display: block;
		}
		.text-container {
			padding: 0;
		}
		.marquee-container {
			display: flex;
			overflow: hidden;
			width: 100vw;
			pointer-events: none;
			align-items: center;
			justify-content: flex-start;
		}
		.marquee-track {
			display: flex;
			flex-shrink: 0;
			white-space: nowrap;
			/* Commento solo il PERCHÉ: disattivata l'animazione di default per evitare che il marquee inizi a scorrere durante il delay di fade-in/blur-in iniziale */
			animation: none;
		}
		:global(.entry-complete) .marquee-track {
			/* Commento solo il PERCHÉ: allungato a 24s per rallentare leggermente il movimento del marquee rendendolo più premium e leggibile. L'animazione si attiva solo dopo il completamento del fade-in */
			animation: marquee 24s linear infinite;
		}
		.marquee-item {
			font-family: var(--font-family-base);
			font-size: var(--text-3xl);
			font-weight: var(--text-title-weight);
			line-height: 1;
			color: var(--neutral-50);
			padding: 0;
			margin-right: 0.25em; /* Commento solo il PERCHÉ: riduce lo spazio a singola battuta di spacebar, proporzionale alla dimensione del font */
			flex-shrink: 0;
		}
		.glass-text {
			/* Commento solo il PERCHÉ: mutua i medesimi valori di colore e trasparenza del token globale .glass-effect (neutral-100 al 60% per il riempimento, neutral-50 al 40% per il bordo) applicandoli direttamente ai caratteri del testo tramite background-clip */
			background-color: rgb(from var(--neutral-100) r g b / 0.6);
			background-clip: text;
			-webkit-background-clip: text;
			color: transparent;
			-webkit-text-stroke: 1px rgb(from var(--neutral-50) r g b / 0.4);
		}
	}

	@keyframes marquee {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-50%);
		}
	}
</style>

