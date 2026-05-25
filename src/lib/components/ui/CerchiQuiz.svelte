<script>
	import { drawBorder } from '$lib/actions/drawBorder.js';
	import { fly } from 'svelte/transition';

	let quizState = $state('choosing'); // 'choosing' | 'selected' | 'expanded'
	let selectedSide = $state('');     // 'mentale' | 'fisico'

	let bottoneHover = $state(false);
	let bottoneText = $state('vedere oltre');

	let showBottone = $derived(quizState === 'selected');

	// 点击圆圈 → selected，底部按钮出现
	function selectMentale() {
		if (quizState === 'expanded') return;
		selectedSide = 'mentale';
		quizState = 'selected';
		bottoneText = 'vedere oltre';
	}

	function selectFisico() {
		if (quizState === 'expanded') return;
		selectedSide = 'fisico';
		quizState = 'selected';
		bottoneText = 'passare oltre';
	}

	// 点击底部按钮 → expanded
	function confirmSelection() {
		quizState = 'expanded';
	}
</script>

<div class="quiz-wrapper">

	<!-- ======== TITOLO ======== -->
	<div class="quiz-title-wrap">
		<h1 class="quiz-title">
			Quando tutto si decide in pochi istanti,<br />
			cosa pesa davvero di più?
		</h1>
	</div>

	<!-- ======== CONTENITORE PRINCIPALE ======== -->
	<div class="quiz-body">

	<!-- ======== CERCHIO MENTALE ======== -->
	<div
		class="circle-wrap"
		class:is-expanded={quizState === 'expanded'}
	>
		{#if quizState !== 'expanded'}
			<button
				class="circle left"
				class:clicked={selectedSide === 'mentale'}
				onclick={selectMentale}
				use:drawBorder={{ clicked: selectedSide === 'mentale' }}
			>
				<svg class="border-svg" viewBox="0 0 407 407">
					<defs>
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
						stroke="var(--content-primary, #071E45)"
						stroke-width="4"
						stroke-dasharray="0 16"
						stroke-linecap="round"
						mask="url(#mask-left)"
					/>
				</svg>

				{#if selectedSide === 'mentale'}
					<div class="sfumatura-bg">
						<svg class="fluid-svg" viewBox="0 0 429 395" fill="none">
							<g opacity="0.6" filter="url(#filter-fluid-left)">
								<path class="fluid-path" d="M85.7444 262.525C109.493 381.643 195.551 260.968 233.296 257.621C271.042 254.273 290.53 318.678 346.535 267.575C363.24 252.333 271.838 243.131 267.715 206.589C263.911 172.873 349.38 111.847 317.989 94.2074C252.577 57.4495 247.224 101.347 201.718 121.102C156.212 140.858 54.8945 107.791 85.7444 262.525Z" fill="url(#paint-fluid-left)"/>
							</g>
							<defs>
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
								<linearGradient id="paint-fluid-left" x1="125.672" y1="178.687" x2="346.218" y2="304.117" gradientUnits="userSpaceOnUse">
									<stop stop-color="#6A96DF"/>
									<stop offset="0.508478" stop-color="#8035D2"/>
									<stop offset="0.706731" stop-color="#D86146"/>
								</linearGradient>
							</defs>
						</svg>
					</div>
				{/if}

				<span class="text" class:gradient={selectedSide === 'mentale'}>mentale</span>
			</button>
		{:else}
			<!-- Expanded: div non cliccabile -->
			<div class="circle expanded-circle">
				<svg class="border-svg" viewBox="0 0 570 570">
					<defs>
						<mask id="mask-exp">
							<circle
								class="mask-circle"
								cx="285"
								cy="285"
								r="283"
								fill="none"
								stroke="white"
								stroke-width="10"
								stroke-dasharray="1778"
								stroke-dashoffset="0"
							/>
						</mask>
					</defs>
					<circle
						cx="285"
						cy="285"
						r="283"
						fill="none"
						stroke="var(--content-primary, #071E45)"
						stroke-width="4"
						stroke-dasharray="0 16"
						stroke-linecap="round"
						mask="url(#mask-exp)"
					/>
				</svg>

				<div class="sfumatura-bg">
					<svg class="fluid-svg" viewBox="0 0 429 395" fill="none">
						<g opacity="0.6" filter="url(#filter-fluid-exp)">
							<path class="fluid-path" d="M85.7444 262.525C109.493 381.643 195.551 260.968 233.296 257.621C271.042 254.273 290.53 318.678 346.535 267.575C363.24 252.333 271.838 243.131 267.715 206.589C263.911 172.873 349.38 111.847 317.989 94.2074C252.577 57.4495 247.224 101.347 201.718 121.102C156.212 140.858 54.8945 107.791 85.7444 262.525Z" fill="url(#paint-fluid-exp)"/>
						</g>
						<defs>
							<filter id="filter-fluid-exp" x="0" y="0" width="428.572" height="394.946" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
								<feFlood flood-opacity="0" result="BackgroundImageFix"/>
								<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
								<feGaussianBlur stdDeviation="40" result="effect1_foregroundBlur"/>
								<feTurbulence type="fractalNoise" baseFrequency="0.33" numOctaves="3" seed="1910"/>
								<feDisplacementMap in="effect1_foregroundBlur" scale="40" xChannelSelector="R" yChannelSelector="G" result="displacedImage" width="100%" height="100%"/>
								<feMerge result="effect2_texture">
									<feMergeNode in="displacedImage"/>
								</feMerge>
							</filter>
							<linearGradient id="paint-fluid-exp" x1="125.672" y1="178.687" x2="346.218" y2="304.117" gradientUnits="userSpaceOnUse">
								<stop stop-color="#6A96DF"/>
								<stop offset="0.508478" stop-color="#8035D2"/>
								<stop offset="0.706731" stop-color="#D86146"/>
							</linearGradient>
						</defs>
					</svg>
				</div>

				<span class="expanded-text gradient">70%<br />mentale</span>
			</div>
		{/if}
	</div>

	<!-- ======== CERCHIO FISICO ======== -->
	{#if quizState !== 'expanded'}
		<div class="circle-wrap">
			<button
				class="circle right"
				class:clicked={selectedSide === 'fisico'}
				onclick={selectFisico}
				use:drawBorder={{ clicked: selectedSide === 'fisico' }}
			>
				<svg class="border-svg" viewBox="0 0 407 407">
					<defs>
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
						stroke="var(--content-primary, #071E45)"
						stroke-width="4"
						stroke-dasharray="0 16"
						stroke-linecap="round"
						mask="url(#mask-right)"
					/>
				</svg>

				{#if selectedSide === 'fisico'}
					<div class="sfumatura-bg">
						<svg class="fluid-svg" viewBox="0 0 429 395" fill="none">
							<g opacity="0.6" filter="url(#filter-fluid-right)">
								<path class="fluid-path" d="M85.7444 262.525C109.493 381.643 195.551 260.968 233.296 257.621C271.042 254.273 290.53 318.678 346.535 267.575C363.24 252.333 271.838 243.131 267.715 206.589C263.911 172.873 349.38 111.847 317.989 94.2074C252.577 57.4495 247.224 101.347 201.718 121.102C156.212 140.858 54.8945 107.791 85.7444 262.525Z" fill="url(#paint-fluid-right)"/>
							</g>
							<defs>
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
								<linearGradient id="paint-fluid-right" x1="125.672" y1="178.687" x2="346.218" y2="304.117" gradientUnits="userSpaceOnUse">
									<stop stop-color="#6A96DF"/>
									<stop offset="0.508478" stop-color="#8035D2"/>
									<stop offset="0.706731" stop-color="#D86146"/>
								</linearGradient>
							</defs>
						</svg>
					</div>
				{/if}

				<span class="text" class:gradient={selectedSide === 'fisico'}>fisico</span>
			</button>
		</div>
	{/if}

	<!-- ======== TESTO A DESTRA (EXPANDED) ======== -->
	{#if quizState === 'expanded'}
		<div class="right-text" in:fly={{ x: 20, duration: 600, delay: 300 }}>
			<p>
				Il fisico porta l'atleta al partenza.<br />
				La mente decide cosa succede dopo.
			</p>
		</div>
	{/if}

	<!-- ======== PULSANTE INFERIORE (choosing/selected) ======== -->
	{#if showBottone}
		<button
			class="bottone"
			class:hover={bottoneHover}
			onmouseenter={() => { bottoneHover = true; }}
			onmouseleave={() => { bottoneHover = false; }}
			onclick={confirmSelection}
		>
			<div class="bottone-bg"></div>
			<span class="bottone-text">{bottoneText}</span>
		</button>
	{/if}
</div><!-- /.quiz-body -->
</div><!-- /.quiz-wrapper -->

<style>
	/* ======== WRAPPER ======== */
	.quiz-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
		height: 100vh;
		width: 100%;
		overflow: hidden;
		box-sizing: border-box;
	}

	/* ======== TITOLO ======== */
	.quiz-title-wrap {
		margin-bottom: var(--space-8, 64px);
		flex-shrink: 0;
	}

	.quiz-title {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 700;
		font-size: 56px;
		line-height: 60px;
		color: var(--content-primary, #071E45);
		text-align: center;
		margin: 0;
	}

	/* ======== CONTENITORE PRINCIPALE ======== */
	.quiz-body {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 80px;
		position: relative;
		flex-shrink: 0;
	}

	/* ======== WRAPPER CIRCLE ======== */
	.circle-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	/* ======== BASE CIRCLE (button) ======== */
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
		z-index: 0;
	}

	/* ======== EXPANDED CIRCLE (div non cliccabile) ======== */
	.expanded-circle {
		width: 570px;
		height: 570px;
		border-radius: 285px;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* ======== SVG BORDER ======== */
	.border-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 3;
	}

	/* ======== TEXT ======== */
	.text {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 800;
		font-size: 56px;
		color: var(--content-primary, #071E45);
		white-space: nowrap;
		position: relative;
		z-index: 1;
		text-align: center;
		line-height: 1.1;
	}

	.expanded-text {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 800;
		font-size: 64px;
		white-space: nowrap;
		position: relative;
		z-index: 1;
		text-align: center;
		line-height: 1.1;
	}

	.text.gradient,
	.expanded-text.gradient {
		background: linear-gradient(
			107deg,
			var(--archetipi-favorito) 18.14%,
			var(--archetipi-insoddisfatto) 50%,
			var(--archetipi-infortunato) 92.63%
		);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	/* ======== SFUMATURA BACKGROUND ======== */
	.sfumatura-bg {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		border-radius: inherit;
		z-index: 2;
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

	/* ======== RIGHT TEXT PANEL ======== */
	.right-text {
		width: 453px;
	}

	.right-text p {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 400;
		font-size: 24px;
		line-height: 30px;
		color: black;
		margin: 0;
	}

	/* ======== BOTTONE ======== */
	.bottone {
		position: absolute;
		bottom: -60px;
		left: 50%;
		transform: translateX(-50%);
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

	/* ======== ANIMATIONS ======== */
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
