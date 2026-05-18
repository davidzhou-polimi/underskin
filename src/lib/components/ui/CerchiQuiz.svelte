<script>
	// Azione GSAP per animazione bordo puntinato
	import { drawBorder } from '$lib/actions/drawBorder.js';
	import { goto } from '$app/navigation';

	function scrollToRisultati() {
		document.getElementById('cerchi-risultati')?.scrollIntoView({ behavior: 'smooth' });
	}

	let leftState = $state('default');
	let rightState = $state('default');
	let bottoneState = $state('default');

	// Visibilità del pulsante di conferma inferiore
	let showBottone = $derived(leftState === 'click' || rightState === 'click');
</script>

<div class="cerchi-quiz" class:expanded={showBottone}>
	<!-- Pulsante sinistro (Area Mentale) -->
	<button
		class="circle left"
		class:clicked={leftState === 'click'}
		onmouseenter={() => { if (leftState === 'default') leftState = 'hover' }}
		onmouseleave={() => { if (leftState === 'hover') leftState = 'default' }}
		onclick={() => { 
			leftState = 'click'; 
			rightState = 'default'; // Reset stato cerchio destro
		}}
		use:drawBorder 
	>
		<!-- Bordo puntinato SVG -->
		<svg class="border-svg" viewBox="0 0 407 407">
			<defs>
				<!-- Maschera di ritaglio per animazione -->
				<mask id="mask-left">
					<circle 
						class="mask-circle" 
						cx="203.5" 
						cy="203.5" 
						r="201.5" 
						fill="none" 
						stroke="white" 
						stroke-width="10" 
						stroke-dasharray="1266" 
						stroke-dashoffset="1266" 
					/>
				</mask>
			</defs>
			<circle 
				cx="203.5" 
				cy="203.5" 
				r="201.5" 
				fill="none" 
				stroke="var(--Color-Content-Primary, #071E45)" 
				stroke-width="4" 
				stroke-dasharray="0 16" 
				stroke-linecap="round" 
				mask="url(#mask-left)"
			/>
		</svg>

		<!-- Testo del pulsante -->
		<span class="text" class:gradient={leftState !== 'default'}>mentale</span>

		{#if leftState === 'click'}
			<!-- Sfondo fluido animato -->
			<div class="sfumatura-bg">
				<svg class="fluid-svg" viewBox="0 0 429 395" fill="none">
					<g opacity="0.6" filter="url(#filter-fluid-left)">
						<path class="fluid-path" d="M85.7444 262.525C109.493 381.643 195.551 260.968 233.296 257.621C271.042 254.273 290.53 318.678 346.535 267.575C363.24 252.333 271.838 243.131 267.715 206.589C263.911 172.873 349.38 111.847 317.989 94.2074C252.577 57.4495 247.224 101.347 201.718 121.102C156.212 140.858 54.8945 107.791 85.7444 262.525Z" fill="url(#paint-fluid-left)"/>
					</g>
					<defs>
						<!-- Filtro liquido con distorsione -->
						<filter id="filter-fluid-left" x="0" y="0" width="428.572" height="394.946" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
							<feFlood flood-opacity="0" result="BackgroundImageFix"/>
							<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
							<feGaussianBlur stdDeviation="40" result="effect1_foregroundBlur"/>
							<feTurbulence type="fractalNoise" baseFrequency="0.33" numOctaves="3" seed="1910"/>
							<feDisplacementMap in="effect1_foregroundBlur" scale="40" xChannelSelector="R" yChannelSelector="G" result="displacedImage" width="100%" height="100%"/>
							<feMerge result="effect2_texture">
								<feMergeNode in="displacedImage"/>
							</feMerge>
						</filter>
						<!-- Gradiente di colore originale -->
						<linearGradient id="paint-fluid-left" x1="125.672" y1="178.687" x2="346.218" y2="304.117" gradientUnits="userSpaceOnUse">
							<stop stop-color="#6A96DF"/>
							<stop offset="0.508478" stop-color="#8035D2"/>
							<stop offset="0.706731" stop-color="#D86146"/>
						</linearGradient>
					</defs>
				</svg>
			</div>
		{/if}
	</button>

	<!-- Pulsante destro (Area Fisica) -->
	<button
		class="circle right"
		class:clicked={rightState === 'click'}
		onmouseenter={() => { if (rightState === 'default') rightState = 'hover' }}
		onmouseleave={() => { if (rightState === 'hover') rightState = 'default' }}
		onclick={() => { 
			rightState = 'click'; 
			leftState = 'default'; // Reset stato cerchio sinistro
		}}
		use:drawBorder
	>
		<!-- Bordo puntinato SVG -->
		<svg class="border-svg" viewBox="0 0 407 407">
			<defs>
				<!-- Maschera di ritaglio per animazione -->
				<mask id="mask-right">
					<circle 
						class="mask-circle" 
						cx="203.5" 
						cy="203.5" 
						r="201.5" 
						fill="none" 
						stroke="white" 
						stroke-width="10" 
						stroke-dasharray="1266" 
						stroke-dashoffset="1266" 
					/>
				</mask>
			</defs>
			<circle 
				cx="203.5" 
				cy="203.5" 
				r="201.5" 
				fill="none" 
				stroke="var(--Color-Content-Primary, #071E45)" 
				stroke-width="4" 
				stroke-dasharray="0 16" 
				stroke-linecap="round" 
				mask="url(#mask-right)"
			/>
		</svg>

		<!-- Testo del pulsante -->
		<span class="text" class:gradient={rightState !== 'default'}>fisico</span>

		{#if rightState === 'click'}
			<!-- Sfondo fluido animato -->
			<div class="sfumatura-bg">
				<svg class="fluid-svg" viewBox="0 0 429 395" fill="none">
					<g opacity="0.6" filter="url(#filter-fluid-right)">
						<path class="fluid-path" d="M85.7444 262.525C109.493 381.643 195.551 260.968 233.296 257.621C271.042 254.273 290.53 318.678 346.535 267.575C363.24 252.333 271.838 243.131 267.715 206.589C263.911 172.873 349.38 111.847 317.989 94.2074C252.577 57.4495 247.224 101.347 201.718 121.102C156.212 140.858 54.8945 107.791 85.7444 262.525Z" fill="url(#paint-fluid-right)"/>
					</g>
					<defs>
						<!-- Filtro liquido con distorsione -->
						<filter id="filter-fluid-right" x="0" y="0" width="428.572" height="394.946" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
							<feFlood flood-opacity="0" result="BackgroundImageFix"/>
							<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
							<feGaussianBlur stdDeviation="40" result="effect1_foregroundBlur"/>
							<feTurbulence type="fractalNoise" baseFrequency="0.33" numOctaves="3" seed="1910"/>
							<feDisplacementMap in="effect1_foregroundBlur" scale="40" xChannelSelector="R" yChannelSelector="G" result="displacedImage" width="100%" height="100%"/>
							<feMerge result="effect2_texture">
								<feMergeNode in="displacedImage"/>
							</feMerge>
						</filter>
						<!-- Gradiente di colore originale -->
						<linearGradient id="paint-fluid-right" x1="125.672" y1="178.687" x2="346.218" y2="304.117" gradientUnits="userSpaceOnUse">
							<stop stop-color="#6A96DF"/>
							<stop offset="0.508478" stop-color="#8035D2"/>
							<stop offset="0.706731" stop-color="#D86146"/>
						</linearGradient>
					</defs>
				</svg>
			</div>
		{/if}
	</button>

	<!-- Pulsante di conferma inferiore -->
	{#if showBottone}
		<!-- Cliccando il pulsante -->
		<button
			class="bottone"
			class:hover={bottoneState === 'hover'}
			class:clicked={bottoneState === 'click'}
			onmouseenter={() => { if (bottoneState === 'default') bottoneState = 'hover' }}
			onmouseleave={() => { if (bottoneState === 'hover') bottoneState = 'default' }}
			onclick={() => { scrollToRisultati() }}
		>
			<div class="bottone-bg"></div>
			{#if bottoneState === 'click'}
				<div class="bottone-inner"></div>
			{/if}
			<span class="bottone-text">testo</span>
		</button>
	{/if}
</div>

<style>
	.cerchi-quiz {
		display: flex;
		align-items: center;
		position: relative;
		width: 974px;
	}

	.cerchi-quiz.expanded {
		height: 473px;
	}

	.circle {
		width: 407px;
		height: 407px;
		border-radius: 203.5px;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		background: transparent;
		cursor: pointer;
		appearance: none;
		padding: 0;
	}

	.circle.left {
		z-index: 1;
	}

	.circle.right {
		margin-left: 160px;
		z-index: 0;
	}

	.border-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 3; /* Livello sopra lo sfondo liquido */
	}

	.text {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 800;
		font-size: 56px;
		color: var(--Color-Content-Primary, #071E45);
		white-space: nowrap;
		position: relative;
		z-index: 1; /* Livello sotto lo sfondo liquido */
	}

	.text.gradient {
		background: linear-gradient(
			107deg,
			var(--color-archetipo-favorito) 18.14%,
			var(--color-archetipo-insoddisfatto) 50%,
			var(--color-archetipo-infortunato) 92.63%
		);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	/* Contenitore dello sfondo mascherato */
	.sfumatura-bg {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		border-radius: 203.5px;
		z-index: 2; /* Livello sopra il testo */
		pointer-events: none;
	}

	/* Elemento SVG liquido originale */
	.fluid-svg {
		width: 120%; 
		height: 120%;
		object-fit: cover;
		animation: fluid-flow 12s ease-in-out infinite;
		transform-origin: center center;
		will-change: transform;
		transform: translateZ(0);
	}

	/* Tracciato vettoriale interno */
	.fluid-path {
		animation: path-morph 8s ease-in-out infinite alternate;
		transform-origin: center center;
	}

	.bottone {
		position: absolute;
		bottom: 0;
		left: 390px;
		width: 194px;
		height: 66px;
		border: none;
		background: transparent;
		cursor: pointer;
		appearance: none;
		padding: 0;
	}

	.bottone-bg {
		position: absolute;
		inset: 0;
		border-radius: var(--radius-m);
		box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.23);
		transition: background 0.2s ease;
		background: rgba(241, 250, 253, 0.65);
	}

	.bottone.hover .bottone-bg {
		background: rgba(223, 244, 250, 0.65);
	}

	.bottone.clicked .bottone-bg {
		pointer-events: none;
	}

	.bottone-inner {
		position: absolute;
		inset: 0;
		border-radius: var(--radius-m);
		background: rgba(241, 250, 253, 0.65);
		box-shadow: inset -2px -2px 4px rgba(0, 0, 0, 0.23);
	}

	.bottone-text {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 400;
		font-size: 16px;
		line-height: 20px;
		color: black;
		z-index: 1;
	}

	/* Animazione rotazione e scala dello sfondo */
	@keyframes fluid-flow {
		0% {
			transform: scale(1) rotate(0deg) translate(0px, 0px);
		}
		33% {
			transform: scale(1.15) rotate(120deg) translate(-10px, 15px);
		}
		66% {
			transform: scale(0.95) rotate(240deg) translate(15px, -10px);
		}
		100% {
			transform: scale(1) rotate(360deg) translate(0px, 0px);
		}
	}

	/* Animazione distorsione della forma */
	@keyframes path-morph {
		0% {
			transform: scale(1) skewX(0deg);
		}
		50% {
			transform: scale(1.08) skewX(5deg) skewY(3deg);
		}
		100% {
			transform: scale(0.95) skewX(-3deg) skewY(-2deg);
		}
	}
</style>