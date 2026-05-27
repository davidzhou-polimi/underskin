<!-- Componente di background condiviso per l'archetipo Infortunato.
     Usa un sistema a due strati: una base solida azzurro-ghiaccio (--background-primary)
     e uno strato superiore assoluto con il gradiente arancione che può essere dissolto via GSAP. -->
<div class="infortunato-fixed-bg" aria-hidden="true">
	<!-- Strato superiore con gradiente arancione, spotlight e grana che viene animato da GSAP -->
	<div class="gradient-layer">
		<!-- Overlay granuloso con distorsione frattale per la texture -->
		<div class="noise-overlay"></div>

		<!-- Spotlight luminoso radiale -->
		<div class="glow-spotlight"></div>
	</div>
</div>

<style>
	/* Contenitore di base fisso ancorato alla viewport */
	.infortunato-fixed-bg {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		/* z-index negativo controllato per posizionarsi sotto tutti i contenuti del DOM */
		z-index: -1;
		pointer-events: none;
		
		/* Il colore di base rivelato quando il gradiente arancione si dissolve */
		background-color: var(--background-primary);
	}

	/* Strato contenente il gradiente arancione caldo del profilo */
	.gradient-layer {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		
		background: radial-gradient(
			circle at 50% 15%, 
			var(--arancione-200) 0%, 
			var(--arancione-500) 45%, 
			var(--arancione-600) 75%, 
			var(--arancione-900) 100%
		);
		will-change: opacity;
	}

	/* Overlay di distorsione texture a grana fine */
	.noise-overlay {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0.08;
		mix-blend-mode: overlay;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
	}

	/* Bagliore centrale diffuso e morbido */
	.glow-spotlight {
		position: absolute;
		top: 10%;
		left: 15%;
		width: 70%;
		height: 70%;
		opacity: 0.75;
		background: radial-gradient(
			circle at 50% 40%,
			color-mix(in srgb, var(--neutral-50) 95%, transparent) 0%,
			color-mix(in srgb, var(--arancione-200) 30%, transparent) 60%,
			transparent 100%
		);
		filter: blur(100px);
	}
</style>
