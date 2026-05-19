/**
 * ShootingStarBackground - SVG gradient background with shooting star animation
 * Inspired by Figma design with blur and noise filters
 */
<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	let container;
	let shootingStar;

	onMount(() => {
		// Initial position: off-screen to the left and top
		gsap.set(shootingStar, {
			x: '-30%',
			y: '-20%',
			opacity: 0,
			scale: 0.3
		});

		// Animation timeline
		const tl = gsap.timeline({ repeat: -1, repeatDelay: 3 });

		// Phase 1: Fade in and start moving
		tl.to(shootingStar, {
			opacity: 1,
			scale: 1,
			duration: 0.8,
			ease: 'power2.in'
		});

		// Phase 2: Sweep across the screen
		tl.to(shootingStar, {
			x: '130%',
			y: '120%',
			duration: 2.5,
			ease: 'power2.out'
		});

		// Phase 3: Fade out quickly
		tl.to(shootingStar, {
			opacity: 0,
			scale: 0.5,
			duration: 0.4,
			ease: 'power2.in'
		});

		return () => {
			tl.kill();
		};
	});
</script>

<div class="shooting-star-bg" bind:this={container}>
	<!-- SVG Filters for blur and noise effects -->
	<svg class="filters" aria-hidden="true">
		<defs>
			<!-- Blur filter for the "sfumature" effect (radius 250) -->
			<filter id="blur-filter" x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur in="SourceGraphic" stdDeviation="40" />
			</filter>

			<!-- Noise/Grain filter (radius 20) -->
			<filter id="noise-filter" x="0%" y="0%" width="100%" height="100%">
				<feTurbulence
					type="fractalNoise"
					baseFrequency="0.65"
					numOctaves="3"
					stitchTiles="stitch"
				/>
				<feColorMatrix type="saturate" values="0" />
				<feBlend in="SourceGraphic" mode="overlay" result="blend" />
				<feComposite in="blend" in2="SourceGraphic" operator="in" />
			</filter>

			<!-- Combined filter -->
			<filter id="combined-filter" x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur" />
				<feTurbulence
					type="fractalNoise"
					baseFrequency="0.8"
					numOctaves="4"
					stitchTiles="stitch"
					result="noise"
				/>
				<feColorMatrix in="noise" type="saturate" values="0" />
				<feBlend in="blur" in2="noise" mode="overlay" />
			</filter>

			<!-- Linear gradient for the comet trail -->
			<linearGradient id="comet-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
				<stop offset="0%" stop-color="#ff6b9d" stop-opacity="0" />
				<stop offset="20%" stop-color="#c44cff" stop-opacity="0.8" />
				<stop offset="50%" stop-color="#6b5bff" stop-opacity="1" />
				<stop offset="80%" stop-color="#00d4ff" stop-opacity="1" />
				<stop offset="100%" stop-color="#00ffcc" stop-opacity="0.9" />
			</linearGradient>

			<!-- Secondary gradient for depth -->
			<linearGradient id="comet-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stop-color="#ff9a56" stop-opacity="0" />
				<stop offset="40%" stop-color="#ff6b9d" stop-opacity="0.7" />
				<stop offset="70%" stop-color="#c44cff" stop-opacity="0.9" />
				<stop offset="100%" stop-color="#6b5bff" stop-opacity="1" />
			</linearGradient>

			<!-- Radial gradient for the comet head -->
			<radialGradient id="comet-head" cx="50%" cy="50%" r="50%">
				<stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
				<stop offset="30%" stop-color="#ffffff" stop-opacity="0.8" />
				<stop offset="60%" stop-color="#00ffcc" stop-opacity="0.5" />
				<stop offset="100%" stop-color="#00d4ff" stop-opacity="0" />
			</radialGradient>
		</defs>
	</svg>

	<!-- Shooting Star Element -->
	<div class="shooting-star" bind:this={shootingStar}>
		<!-- Main comet body with gradient -->
		<div class="comet-trail"></div>

		<!-- Secondary trail layer -->
		<div class="comet-trail-secondary"></div>

		<!-- Bright head of the comet -->
		<div class="comet-head"></div>

		<!-- Glow effect -->
		<div class="comet-glow"></div>

		<!-- Particle sparks -->
		<div class="particles">
			<span class="particle"></span>
			<span class="particle"></span>
			<span class="particle"></span>
			<span class="particle"></span>
			<span class="particle"></span>
		</div>
	</div>
</div>

<style>
	.shooting-star-bg {
		position: fixed;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
		z-index: 0;
	}

	.filters {
		position: absolute;
		width: 0;
		height: 0;
		overflow: hidden;
	}

	.shooting-star {
		position: absolute;
		width: 400px;
		height: 80px;
		transform-origin: center center;
		filter: url(#combined-filter);
	}

	.comet-trail {
		position: absolute;
		top: 50%;
		left: 0;
		width: 350px;
		height: 60px;
		transform: translateY(-50%);
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 107, 157, 0.1) 10%,
			rgba(196, 76, 255, 0.4) 30%,
			rgba(107, 91, 255, 0.7) 50%,
			rgba(0, 212, 255, 0.9) 75%,
			rgba(0, 255, 204, 1) 100%
		);
		border-radius: 50% 10px 10px 50%;
		filter: blur(8px);
	}

	.comet-trail-secondary {
		position: absolute;
		top: 50%;
		left: 20px;
		width: 280px;
		height: 40px;
		transform: translateY(-50%);
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 154, 86, 0.2) 15%,
			rgba(255, 107, 157, 0.5) 35%,
			rgba(196, 76, 255, 0.7) 60%,
			rgba(107, 91, 255, 0.9) 85%
		);
		border-radius: 40px 8px 8px 40px;
		filter: blur(4px);
	}

	.comet-head {
		position: absolute;
		top: 50%;
		right: 0;
		width: 80px;
		height: 80px;
		transform: translateY(-50%);
		background: radial-gradient(
			circle at 30% 50%,
			rgba(255, 255, 255, 1) 0%,
			rgba(0, 255, 204, 0.8) 30%,
			rgba(0, 212, 255, 0.5) 50%,
			transparent 70%
		);
		border-radius: 50%;
		filter: blur(6px);
	}

	.comet-glow {
		position: absolute;
		top: 50%;
		right: -20px;
		width: 120px;
		height: 120px;
		transform: translateY(-50%);
		background: radial-gradient(
			circle,
			rgba(0, 255, 204, 0.4) 0%,
			rgba(0, 212, 255, 0.2) 40%,
			transparent 70%
		);
		filter: blur(20px);
	}

	.particles {
		position: absolute;
		top: 50%;
		right: 0;
		width: 200px;
		height: 60px;
		transform: translateY(-50%);
	}

	.particle {
		position: absolute;
		width: 6px;
		height: 6px;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 50%;
		filter: blur(1px);
	}

	.particle:nth-child(1) {
		top: 20%;
		right: 15%;
		animation: particle-fade 0.3s ease-out infinite;
	}

	.particle:nth-child(2) {
		top: 60%;
		right: 25%;
		width: 4px;
		height: 4px;
		animation: particle-fade 0.25s ease-out infinite 0.1s;
	}

	.particle:nth-child(3) {
		top: 35%;
		right: 35%;
		width: 5px;
		height: 5px;
		animation: particle-fade 0.35s ease-out infinite 0.15s;
	}

	.particle:nth-child(4) {
		top: 70%;
		right: 20%;
		width: 3px;
		height: 3px;
		animation: particle-fade 0.28s ease-out infinite 0.2s;
	}

	.particle:nth-child(5) {
		top: 15%;
		right: 40%;
		width: 4px;
		height: 4px;
		animation: particle-fade 0.32s ease-out infinite 0.25s;
	}

	@keyframes particle-fade {
		0% {
			opacity: 1;
			transform: translateX(0) scale(1);
		}
		100% {
			opacity: 0;
			transform: translateX(-30px) scale(0.5);
		}
	}
</style>
