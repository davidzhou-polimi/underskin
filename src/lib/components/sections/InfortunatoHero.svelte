<script>
	/**
	 * Assunzioni per questa sezione dedicata:
	 * 1. Questo componente è specifico ed esclusivo per la HeroSection del profilo "L'infortunato".
	 * 2. Il titolo e la palette di colori (arancione) sono fissati in base all'archetipo descritto.
	 * 3. Applica l'azione Svelte 'heroEntrance' per l'animazione d'ingresso dello sfondo e della grana.
	 */

	// Importazione delle azioni per la tracciabilità dello scroll e l'animazione d'ingresso del profilo
	import { trackSection } from '$lib/actions/trackSection.js';
	import { heroEntrance } from '$lib/actions/heroEntrance.js';
</script>

<section id="infortunato-hero" class="infortunato-hero-section" use:trackSection={{ id: 'infortunato-hero' }} use:heroEntrance>
	<!-- Overlay granuloso con distorsione frattale per simulare la porosità e texture premium della carta/pelle -->
	<div class="noise-overlay" aria-hidden="true"></div>

	<!-- Spotlight luminoso radiale animato da GSAP per un ingresso morbido dell'illuminazione centrale -->
	<div class="glow-spotlight" aria-hidden="true"></div>

	<!-- Contenitore centrale del titolo della pagina del profilo (visualizzato in blocco statico, senza split) -->
	<div class="content-wrapper">
		<h1 class="hero-title">
			L'INFORTUNATO
		</h1>
	</div>
</section>

<style>
	/* Sezione principale a schermo intero con setup 3D */
	.infortunato-hero-section {
		position: relative;
		height: 100vh;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		
		/* Gradiente radiale ultra-fluido: spostato più in alto e con intervalli ampi per eliminare stacchi netti */
		background: radial-gradient(
			circle at 50% 15%, 
			var(--arancione-200) 0%, 
			var(--arancione-500) 45%, 
			var(--arancione-600) 75%, 
			var(--arancione-900) 100%
		);
	}

	/* Overlay granuloso animato ad altissima performance via SVG in-line */
	.noise-overlay {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 1;
		opacity: 0.08;
		mix-blend-mode: overlay;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
	}

	/* Spotlight di luce naturale sfocata per rendere lo sfondo ancora più tridimensionale e morbido */
	.glow-spotlight {
		position: absolute;
		top: 10%;
		left: 15%;
		width: 70%;
		height: 70%;
		pointer-events: none;
		z-index: 2;
		opacity: 0.75;
		background: radial-gradient(
			circle at 50% 40%,
			color-mix(in srgb, var(--neutral-50) 95%, transparent) 0%,
			color-mix(in srgb, var(--arancione-200) 30%, transparent) 60%,
			transparent 100%
		);
		filter: blur(100px);
	}

	/* Contenitore di layout per isolare i contenuti di testo */
	.content-wrapper {
		position: relative;
		z-index: 10;
		width: 100%;
		max-width: var(--spacing-17);
		padding: 0 var(--spacing-4);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	/* Titolo massivo statico con stili premium ed effetto tridimensionale */
	.hero-title {
		font-family: var(--font-family-base);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--background-primary);
		margin: 0;
		text-transform: uppercase;
		text-align: center;
		user-select: none;
		
		/* Ombra tridimensionale morbida per simulare lo spessore e la separazione fisica dallo sfondo */
		filter: drop-shadow(0 20px 40px rgba(103, 13, 23, 0.45));
		will-change: transform, opacity;
	}
</style>
