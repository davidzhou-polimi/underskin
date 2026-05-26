<script>
	import { drawBorder } from '$lib/actions/drawBorder.js';
	import { scroll } from '$lib/stores/scroll.svelte.js';
	import { onMount } from 'svelte';

	let quizState = $state('choosing'); // 'choosing' | 'selected' | 'expanded'
	let selectedSide = $state('');     // 'mentale' | 'fisico'

	let bottoneHover = $state(false);
	let bottoneText = $state('vedere oltre');

	let showBottone = $derived(quizState === 'selected');

	// Controllo di stato: se mostrare la citazione
	let hasScrolledDown = $state(false);
	let showQuote = $derived(quizState === 'expanded' && hasScrolledDown);

	// Stato animazione: le animazioni partono solo quando la sezione è visibile
	let animationsEnabled = $state(false);

	// Per dispositivi mobili: registra la coordinata Y iniziale del tocco
	let touchStartY = 0;

	// Animazione di transizione con effetto blur
	function blurFade(node, { duration = 600, delay = 0, maxBlur = 15 }) {
		return {
			delay,
			duration,
			css: (t) => {
				const opacity = t;
				const blur = (1 - t) * maxBlur;
				return `
					opacity: ${opacity};
					filter: blur(${blur}px);
				`;
			}
		};
	}

	// Logica principale: gestisce i gesti e selettivamente disabilita lo scroll del browser
	function handleVirtualScroll(deltaY, event) {
		if (quizState !== 'expanded') return;

		// 1. Quando deltaY > 0 significa che l'utente sta scrollando verso il basso (vuole vedere la citazione)
		if (deltaY > 10) {
			if (!hasScrolledDown) {
				// Blocco pagina: la citazione non è ancora visibile, cambiamo solo il testo e disabilitiamo lo scroll del browser
				if (event.cancelable) event.preventDefault();
				hasScrolledDown = true;
			} else {
				// Rilascio: la citazione è completamente visibile, l'utente continua a scrollare
				// Segnala che l'utente ha superato la citazione → mostra la PerformanceSection
				scroll.quotePassed = true;
			}
		}
		// 2. Quando deltaY < 0 significa che l'utente sta scrollando verso l'alto (vuole vedere il testo il fisico)
		else if (deltaY < -10) {
			if (hasScrolledDown) {
				// Blocco pagina: è visualizzata la citazione, l'utente torna indietro, disabilitiamo lo scroll
				if (event.cancelable) event.preventDefault();
				hasScrolledDown = false;
			} else {
				// Rilascio: siamo tornati al testo originale, l'utente continua a salire
				console.log("Tornati al testo originale, consento lo scroll della pagina");
			}
		}
	}

	// 1. Scroll del mouse su PC
	function handleWheel(event) {
		handleVirtualScroll(event.deltaY, event);
	}

	// 2. Touch su mobile
	function handleTouchStart(event) {
		if (quizState !== 'expanded') return;
		touchStartY = event.touches[0].clientY;
	}

	function handleTouchMove(event) {
		if (quizState !== 'expanded') return;
		const touchCurrentY = event.touches[0].clientY;
		const diffY = touchStartY - touchCurrentY; // Numero positivo = dito verso l'alto (scroll giù)

		handleVirtualScroll(diffY, event);
	}

	onMount(() => {
		// Nota: passive deve essere false per consentire preventDefault()
		window.addEventListener('wheel', handleWheel, { passive: false });
		window.addEventListener('touchstart', handleTouchStart, { passive: true });
		window.addEventListener('touchmove', handleTouchMove, { passive: false });

		// Osservatore per avviare le animazioni quando la sezione entra nel viewport
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					animationsEnabled = entry.isIntersecting;
				});
			},
			{ threshold: 0.3 }
		);

		const wrapper = document.querySelector('.quiz-wrapper');
		if (wrapper) observer.observe(wrapper);

		return () => {
			window.removeEventListener('wheel', handleWheel);
			window.removeEventListener('touchstart', handleTouchStart);
			window.removeEventListener('touchmove', handleTouchMove);
			observer.disconnect();
		};
	});

	$effect(() => {
		if (quizState !== 'expanded') {
			hasScrolledDown = false;
		}
	});

	// click circle → selected
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
		bottoneText = 'vedere oltre';
	}

	function confirmSelection() {
		quizState = 'expanded';
	}
</script>

<div class="quiz-wrapper" class:animations-enabled={animationsEnabled}>

	<div class="quiz-title-wrap">
		<h1 class="quiz-title">
			Quando tutto si decide in pochi istanti,<br />
			cosa pesa davvero di più?
		</h1>
	</div>

	<div class="quiz-body">

	<div class="circle-wrap">
		{#if quizState !== 'expanded'}
			<button
				class="circle left"
				class:clicked={selectedSide === 'mentale'}
				onclick={selectMentale}
				use:drawBorder={{ clicked: selectedSide === 'mentale', enabled: animationsEnabled }}
			>
				<svg class="border-svg" viewBox="0 0 407 407">
					<defs>
						<mask id="mask-left">
							<circle class="mask-circle" cx="203.5" cy="203.5" r="201.5" fill="none" stroke="white" stroke-width="10" stroke-dasharray="1266" stroke-dashoffset="1266" />
						</mask>
					</defs>
					<circle cx="203.5" cy="203.5" r="201.5" fill="none" stroke="var(--content-primary)" stroke-width="4" stroke-dasharray="0 16" stroke-linecap="round" mask="url(#mask-left)" />
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
									<feMerge result="effect2_texture"><feMergeNode in="displacedImage"/></feMerge>
								</filter>
								<linearGradient id="paint-fluid-left" x1="125.672" y1="178.687" x2="346.218" y2="304.117" gradientUnits="userSpaceOnUse">
									<stop stop-color="#6A96DF"/><stop offset="0.508478" stop-color="#8035D2"/><stop offset="0.706731" stop-color="#D86146"/>
								</linearGradient>
							</defs>
						</svg>
					</div>
				{/if}
				<span class="text" class:gradient={selectedSide === 'mentale'}>mentale</span>
			</button>
		{:else}
			<div class="circle expanded-circle">
				<svg class="border-svg" viewBox="0 0 570 570">
					<defs>
						<mask id="mask-exp">
							<circle class="mask-circle" cx="285" cy="285" r="283" fill="none" stroke="white" stroke-width="10" stroke-dasharray="1778" stroke-dashoffset="0" />
						</mask>
					</defs>
					<circle cx="285" cy="285" r="283" fill="none" stroke="var(--content-primary)" stroke-width="4" stroke-dasharray="0 16" stroke-linecap="round" mask="url(#mask-exp)" />
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
								<feMerge result="effect2_texture"><feMergeNode in="displacedImage"/></feMerge>
							</filter>
							<linearGradient id="paint-fluid-exp" x1="125.672" y1="178.687" x2="346.218" y2="304.117" gradientUnits="userSpaceOnUse">
								<stop stop-color="#6A96DF"/><stop offset="0.508478" stop-color="#8035D2"/><stop offset="0.706731" stop-color="#D86146"/>
							</linearGradient>
						</defs>
					</svg>
				</div>
				<span class="expanded-text gradient">70% mentale</span>
			</div>
		{/if}
	</div>

	{#if quizState !== 'expanded'}
		<div class="circle-wrap">
			<button
				class="circle right"
				class:clicked={selectedSide === 'fisico'}
				onclick={selectFisico}
				use:drawBorder={{ clicked: selectedSide === 'fisico', enabled: animationsEnabled }}
			>
				<svg class="border-svg" viewBox="0 0 407 407">
					<defs>
						<mask id="mask-right">
							<circle class="mask-circle" cx="203.5" cy="203.5" r="201.5" fill="none" stroke="white" stroke-width="10" stroke-dasharray="1266" stroke-dashoffset="1266" />
						</mask>
					</defs>
					<circle cx="203.5" cy="203.5" r="201.5" fill="none" stroke="var(--content-primary)" stroke-width="4" stroke-dasharray="0 16" stroke-linecap="round" mask="url(#mask-right)" />
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
									<feMerge result="effect2_texture"><feMergeNode in="displacedImage"/></feMerge>
								</filter>
								<linearGradient id="paint-fluid-right" x1="125.672" y1="178.687" x2="346.218" y2="304.117" gradientUnits="userSpaceOnUse">
									<stop stop-color="#6A96DF"/><stop offset="0.508478" stop-color="#8035D2"/><stop offset="0.706731" stop-color="#D86146"/>
								</linearGradient>
							</defs>
						</svg>
					</div>
				{/if}
				<span class="text" class:gradient={selectedSide === 'fisico'}>fisico</span>
			</button>
		</div>
	{/if}

	{#if quizState === 'expanded'}
		<div class="right-text">
			{#if showQuote}
				<div 
					class="quote-wrapper" 
					in:blurFade={{ duration: 600, delay: 250, maxBlur: 15 }} 
					out:blurFade={{ duration: 400, maxBlur: 15 }}
				>
					<p class="quote-text">
						"At this level, it's probably 70% mental and 30% physical. I've had races where I was confident and performed incredibly well, and others where negativity took over and everything fell apart. Learning to control that is the real challenge."
					</p>
					<p class="quote-author">— Adrian Yung, sci alpino</p>
				</div>
			{:else}
				<div 
					class="default-text" 
					in:blurFade={{ duration: 600, delay: 250, maxBlur: 15 }} 
					out:blurFade={{ duration: 400, maxBlur: 15 }}
				>
					<p>
						Il fisico porta l'atleta al partenza.<br />
						La mente decide cosa succede dopo.
					</p>
				</div>
			{/if}
		</div>
	{/if}

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
</div>
</div>

<style>
	/* 保持原样，高保真全屏视图 */
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

	.quiz-title-wrap {
		margin-bottom: var(--space-8, 64px);
		flex-shrink: 0;
	}

	.quiz-title {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 700;
		font-size: 56px;
		line-height: 60px;
		color: var(--color-content-primary, #071E45);
		text-align: center;
		margin: 0;
	}

	.quiz-body {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 80px;
		position: relative;
		flex-shrink: 0;
	}

	.circle-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
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

	.circle.left { z-index: 1; }
	.circle.right { z-index: 0; }

	.expanded-circle {
		width: 570px;
		height: 570px;
		border-radius: 285px;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.border-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 3;
	}

	.text {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 800;
		font-size: 56px;
		color: var(--color-content-primary, #071E45);
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
	.expanded-text.gradient,
	.circle:hover .text {
		background: linear-gradient(107deg, var(--archetipi-favorito) 18.14%, var(--archetipi-insoddisfatto) 50%, var(--archetipi-infortunato) 92.63%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

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
		transform-origin: center center;
		will-change: transform;
		transform: translateZ(0);
	}

	/* Animazioni attive solo quando la sezione è visibile */
	.animations-enabled .fluid-svg {
		animation: fluid-flow 12s ease-in-out infinite;
	}

	.fluid-path {
		transform-origin: center center;
	}

	.animations-enabled .fluid-path {
		animation: path-morph 8s ease-in-out infinite alternate;
	}

	/* ======== RIGHT TEXT PANEL ======== */
	.right-text {
		width: 453px;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		align-items: center;
	}

	.quote-wrapper, .default-text {
		grid-area: 1 / 1 / 2 / 2;
		will-change: filter, opacity;
	}

	.right-text p {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 400;
		font-size: 24px;
		line-height: 30px;
		color: black;
		margin: 0;
	}

	.right-text .quote-text {
		font-style: italic;
		font-size: 18px;
		line-height: 28px;
		color: var(--content-secondary);
	}

	.right-text .quote-author {
		font-size: 14px;
		color: var(--content-secondary);
		margin-top: var(--space-4, 16px);
	}

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
		background: color-mix(in srgb, var(--neutral-100) 65%, transparent);
	}

	.bottone.hover .bottone-bg {
		background: color-mix(in srgb, var(--neutral-200) 65%, transparent);
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

	@keyframes fluid-flow {
		0% { transform: scale(1) rotate(0deg) translate(0px, 0px); }
		33% { transform: scale(1.15) rotate(120deg) translate(-10px, 15px); }
		66% { transform: scale(0.95) rotate(240deg) translate(15px, -10px); }
		100% { transform: scale(1) rotate(360deg) translate(0px, 0px); }
	}

	@keyframes path-morph {
		0% { transform: scale(1) skewX(0deg); }
		50% { transform: scale(1.08) skewX(5deg) skewY(3deg); }
		100% { transform: scale(0.95) skewX(-3deg) skewY(-2deg); }
	}
</style>