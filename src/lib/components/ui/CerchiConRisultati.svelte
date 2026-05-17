<script>
	import { drawBorder } from '$lib/actions/drawBorder.js';
</script>

<div class="cerchi-risultati">
	<!-- Cerchio con risultato -->
	<div class="cerchio" use:drawBorder>
		<svg class="border-svg" viewBox="0 0 570 570">
			<defs>
				<mask id="mask-risultati">
					<circle 
						class="mask-circle" 
						cx="285" 
						cy="285" 
						r="283" 
						fill="none" 
						stroke="white" 
						stroke-width="10" 
						stroke-dasharray="1778" 
						stroke-dashoffset="1778" 
					/>
				</mask>
			</defs>
			<circle 
				cx="285" 
				cy="285" 
				r="283" 
				fill="none" 
				stroke="var(--Color-Content-Primary, #071E45)" 
				stroke-width="4" 
				stroke-dasharray="0 16" 
				stroke-linecap="round" 
				mask="url(#mask-risultati)"
			/>
		</svg>

		<!-- Sfondo fluido animato -->
		<div class="sfumatura-bg">
			<svg class="fluid-svg" viewBox="0 0 429 395" fill="none">
				<g opacity="0.6" filter="url(#filter-fluid)">
					<path class="fluid-path" d="M85.7444 262.525C109.493 381.643 195.551 260.968 233.296 257.621C271.042 254.273 290.53 318.678 346.535 267.575C363.24 252.333 271.838 243.131 267.715 206.589C263.911 172.873 349.38 111.847 317.989 94.2074C252.577 57.4495 247.224 101.347 201.718 121.102C156.212 140.858 54.8945 107.791 85.7444 262.525Z" fill="url(#paint-fluid)"/>
				</g>
				<defs>
					<filter id="filter-fluid" x="0" y="0" width="428.572" height="394.946" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
						<feFlood flood-opacity="0" result="BackgroundImageFix"/>
						<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
						<feGaussianBlur stdDeviation="40" result="effect1_foregroundBlur"/>
						<feTurbulence type="fractalNoise" baseFrequency="0.33" numOctaves="3" seed="1910"/>
						<feDisplacementMap in="effect1_foregroundBlur" scale="40" xChannelSelector="R" yChannelSelector="G" result="displacedImage" width="100%" height="100%"/>
						<feMerge result="effect2_texture">
							<feMergeNode in="displacedImage"/>
						</feMerge>
					</filter>
					<linearGradient id="paint-fluid" x1="125.672" y1="178.687" x2="346.218" y2="304.117" gradientUnits="userSpaceOnUse">
						<stop stop-color="#6A96DF"/>
						<stop offset="0.508478" stop-color="#8035D2"/>
						<stop offset="0.706731" stop-color="#D86146"/>
					</linearGradient>
				</defs>
			</svg>
		</div>

		<span class="text">70% mentale</span>
	</div>

	<!-- Testo descrittivo -->
	<div class="testo">
		<p>
			Il fisico porta l'atleta al partenza.<br />
			La mente decide cosa succede dopo.
		</p>
	</div>
</div>

<style>
	.cerchi-risultati {
		display: flex;
		align-items: center;
		gap: 80px;
		padding: 0 80px;
		width: 1280px;
	}

	.cerchio {
		width: 570px;
		height: 570px;
		border-radius: 285px;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.border-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 2;
	}

	.sfumatura-bg {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		border-radius: 285px;
		z-index: 1;
		pointer-events: none;
	}

	.fluid-svg {
		width: 120%; 
		height: 120%;
		object-fit: cover;
		animation: fluid-flow 12s ease-in-out infinite;
		transform-origin: center center;
		will-change: transform;
		transform: translateZ(0);
	}

	.fluid-path {
		animation: path-morph 8s ease-in-out infinite alternate;
		transform-origin: center center;
	}

	.text {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 800;
		font-size: 64px;
		color: var(--Color-Content-Primary, #071E45);
		white-space: nowrap;
		position: relative;
		z-index: 3;
	}

	.testo {
		width: 453px;
	}

	.testo p {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 400;
		font-size: 24px;
		line-height: 30px;
		color: black;
	}

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
