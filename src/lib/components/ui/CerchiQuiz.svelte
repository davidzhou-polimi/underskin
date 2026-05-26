<script>
	import { drawBorder } from '$lib/actions/drawBorder.js';
	import { fade } from 'svelte/transition';

	let quizState = $state('choosing'); // 'choosing' | 'selected' | 'expanding' | 'expanded'
	let selectedSide = $state('');     // 'mentale' | 'fisico'
	let bottoneHover = $state(false);

	// 📜 Stati per la gestione dello scroll virtuale
	let hasScrolledDown = $state(false); 
	let accumulatedScrollPastQuote = 0;   
	let quotePassed = $state(false);     

	let showBottone = $derived(quizState === 'selected');

	function selectMentale() {
		if (quizState === 'expanded' || quizState === 'expanding') return;
		selectedSide = 'mentale';
		quizState = 'selected';
	}

	function selectFisico() {
		if (quizState === 'expanded' || quizState === 'expanding') return;
		selectedSide = 'fisico';
		quizState = 'selected';
	}

	function confirmSelection() {
		if (quizState !== 'selected') return;
		quizState = 'expanding';
		
		setTimeout(() => {
			quizState = 'expanded';
		}, 800);
	}

	function handleVirtualScroll(e) {
		if (quizState !== 'expanded') return;
		const deltaY = e.deltaY;

		if (deltaY > 10) {
			if (!hasScrolledDown) {
				if (e.cancelable) e.preventDefault();
				hasScrolledDown = true;
				return; 
			}
			if (hasScrolledDown && !quotePassed) {
				if (e.cancelable) e.preventDefault();
				accumulatedScrollPastQuote += deltaY;
				if (accumulatedScrollPastQuote >= 300) {
					quotePassed = true;
				}
			}
		} else if (deltaY < -10) {
			if (hasScrolledDown) {
				if (e.cancelable) e.preventDefault();
				hasScrolledDown = false;
				accumulatedScrollPastQuote = 0;
				quotePassed = false;
				return; 
			}
		}
	}
</script>

<div class="quiz-wrapper" onwheel={handleVirtualScroll}>

	<div class="quiz-title-wrap" class:expanded={quizState === 'expanding' || quizState === 'expanded'}>
		<h1 class="quiz-title">
			Quando tutto si decide in pochi istanti,<br />
			cosa pesa davvero di più?
		</h1>
	</div>

	<div class="quiz-body" class:expanded={quizState === 'expanding' || quizState === 'expanded'}>

		<div class="quiz-column left-column">
			<div
				class="circle-wrap left-wrap"
				class:is-expanding={quizState === 'expanding'}
				class:is-expanded={quizState === 'expanded'}
			>
				<button
					class="circle left"
					class:clicked={selectedSide === 'mentale' || quizState === 'expanding' || quizState === 'expanded'}
					class:is-expanding={quizState === 'expanding'}
					class:is-expanded={quizState === 'expanded'}
					onclick={selectMentale}
					use:drawBorder={{ clicked: selectedSide === 'mentale' || quizState === 'expanded' }}
					disabled={quizState === 'expanding' || quizState === 'expanded'}
				>
					<svg class="border-svg" viewBox="0 0 407 407">
						<defs>
							<mask id="mask-left-exp">
								<circle class="mask-circle" cx="203.5" cy="203.5" r="201.5" fill="none" stroke="white" stroke-width="10" stroke-dasharray="1266" stroke-dashoffset="0" />
							</mask>
						</defs>
						<circle cx="203.5" cy="203.5" r="201.5" fill="none" stroke="var(--content-primary)" stroke-width="4" stroke-dasharray="0 16" stroke-linecap="round" mask="url(#mask-left-exp)" />
					</svg>

					{#if selectedSide === 'mentale' || quizState === 'expanding' || quizState === 'expanded'}
						<div class="sfumatura-bg" in:fade={{ duration: 300 }}>
							<svg class="fluid-svg" viewBox="0 0 429 395" fill="none">
								<g opacity="0.6" filter="url(#filter-fluid-left)">
									<path class="fluid-path" d="M85.7444 262.525C109.493 381.643 195.551 260.968 233.296 257.621C271.042 254.273 290.53 318.678 346.535 267.575C363.24 252.333 271.838 243.131 267.715 206.589C263.911 172.873 349.38 111.847 317.989 94.2074C252.577 57.4495 247.224 101.347 201.718 121.102C156.212 140.858 54.8945 107.791 85.7444 262.525Z" fill="url(#paint-fluid-left)"/>
								</g>
								<defs>
									<filter id="filter-fluid-left" x="0" y="0" width="428.572" height="394.946" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
										<feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="40" result="effect1_foregroundBlur"/><feTurbulence type="fractalNoise" baseFrequency="0.33" numOctaves="3" seed="1910"/><feDisplacementMap in="effect1_foregroundBlur" scale="40" xChannelSelector="R" yChannelSelector="G" result="displacedImage" width="100%" height="100%"/><feMerge result="effect2_texture"><feMergeNode in="displacedImage"/></feMerge>
									</filter>
									<linearGradient id="paint-fluid-left" x1="125.672" y1="178.687" x2="346.218" y2="304.117" gradientUnits="userSpaceOnUse">
										<stop stop-color="#6A96DF"/><stop offset="0.508478" stop-color="#8035D2"/><stop offset="0.706731" stop-color="#D86146"/>
									</linearGradient>
								</defs>
							</svg>
						</div>
					{/if}

					<div class="expanded-text-container">
						{#if quizState === 'expanding' || quizState === 'expanded'}
							<span class="expanded-text gradient" in:fade={{ duration: 300, delay: 200 }}>70% mentale</span>
						{:else}
							<span class="text" class:gradient={selectedSide === 'mentale'}>mentale</span>
						{/if}
					</div>
				</button>
			</div>
		</div>

		<div class="quiz-column right-column">
			
			<div class="circle-wrap right-wrap" class:fly-out={quizState === 'expanding' || quizState === 'expanded'}>
				<button
					class="circle right"
					class:clicked={selectedSide === 'fisico'}
					onclick={selectFisico}
					use:drawBorder={{ clicked: selectedSide === 'fisico' }}
					disabled={quizState === 'expanding' || quizState === 'expanded'}
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
										<feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="40" result="effect1_foregroundBlur"/><feTurbulence type="fractalNoise" baseFrequency="0.33" numOctaves="3" seed="1910"/><feDisplacementMap in="effect1_foregroundBlur" scale="40" xChannelSelector="R" yChannelSelector="G" result="displacedImage" width="100%" height="100%"/><feMerge result="effect2_texture"><feMergeNode in="displacedImage"/></feMerge>
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

			{#if quizState === 'expanding' || quizState === 'expanded'}
				<div class="right-text-panel" class:visible={quizState === 'expanded'}>
					<div class="text-block short-phrase" class:blur-out={hasScrolledDown}>
						<p>
							Il fisico porta l'atleta alla partenza.<br />
							La mente decide cosa succede dopo.
						</p>
					</div>

					<div class="text-block long-quote" class:blur-in={hasScrolledDown}>
						<p class="quote-content">
							“At this level, it’s probably 70% mental and 30% physical. [...] I’ve had races where I was confident and performed incredibly well, and others where negativity took over and everything fell apart. Learning to control that is the real challenge.”
						</p>
						<p class="quote-author">— Adrian Yung, sci alpino</p>
					</div>
				</div>
			{/if}
		</div>

		{#if showBottone}
			<button
				class="bottone"
				class:hover={bottoneHover}
				onmouseenter={() => { bottoneHover = true; }}
				onmouseleave={() => { bottoneHover = false; }}
				onclick={confirmSelection}
			>
				<div class="bottone-bg"></div>
				<span class="bottone-text">Scopri</span>
			</button>
		{/if}
	</div>
</div>

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
		padding: 20px 0;
	}

	/* ======== TITOLO ======== */
	.quiz-title-wrap {
		flex-shrink: 0;
		margin-bottom: var(--space-8, 48px);
		transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
	}

	.quiz-title-wrap.expanded {
		transform: translateY(-10px);
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

	/* ======== CONTENITORE PRINCIPALE (GRID A DISTANZA RIGIDA) ======== */
	.quiz-body {
		display: grid;
		grid-template-columns: 1fr 1fr; 
		gap: 80px; /* Distanza iniziale tra i due cerchi */
		width: 100%;
		max-width: 1200px; 
		position: relative;
		box-sizing: border-box;
		height: auto;
		align-items: center;
		transition: gap 0.8s cubic-bezier(0.25, 1, 0.5, 1);
	}

	/* CORREZIONE: Impostato esattamente a 82px durante lo stato finale per distanziare cerchio e testo */
	.quiz-body.expanded {
		gap: 82px; 
	}

	/* COLONNE DELLA GRIGLIA */
	.quiz-column {
		display: flex;
		align-items: center;
		position: relative;
		height: 100%;
		min-height: 407px;
	}

	.left-column {
		justify-content: flex-end;
	}

	.right-column {
		justify-content: flex-start;
	}

	/* ======== WRAPPER CIRCLE ======== */
	.circle-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.left-wrap {
		transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
	}

	.right-wrap {
		position: absolute;
		left: 0;
		transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.6s ease;
		z-index: 4;
	}

	.right-wrap.fly-out {
		transform: translateX(350px) scale(0.5);
		opacity: 0;
		pointer-events: none;
	}

	/* ======== BASE CIRCLE ======== */
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
		will-change: width, height;
		transition: 
			width 0.8s cubic-bezier(0.25, 1, 0.5, 1),
			height 0.8s cubic-bezier(0.25, 1, 0.5, 1);
	}

	.circle.left { z-index: 2; }
	.circle.right { z-index: 1; }
	.circle:disabled { cursor: default; }

	.circle.is-expanding,
	.circle.is-expanded {
		width: 574px;
		height: 574px;
		border-radius: 287px;
	}

	/* ======== SVG BORDER & TEXT ======== */
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
		font-size: var(--text-title);
		color: var(--color-content-primary, #071E45);
		white-space: nowrap;
		position: relative;
		z-index: 1;
	}

	.circle:hover .text,
	.circle.clicked .text {
		background: linear-gradient(107deg, var(--archetipi-favorito) 18.14%, var(--archetipi-insoddisfatto) 50%, var(--archetipi-infortunato) 92.63%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	.expanded-text {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 800;
		font-size: var(--text-hero);
		background: linear-gradient(107deg, var(--archetipi-favorito) 18.14%, var(--archetipi-insoddisfatto) 50%, var(--archetipi-infortunato) 92.63%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		white-space: nowrap;
	}

	.expanded-text-container {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		z-index: 1;
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

	/* ======== PANNELLO TESTO DESTRO ======== */
	.right-text-panel {
		width: 540px; 
		height: 220px; 
		position: absolute;
		left: 0; /* Allineato perfettamente all'inizio della colonna destra */
		z-index: 5;
		transition: opacity 0.6s ease;
		opacity: 0;
	}

	.right-text-panel.visible {
		opacity: 1;
	}

	.text-block {
		position: absolute;
		top: 50%;
		left: 0;
		transform: translateY(-50%);
		width: 100%;
		transition: filter 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1);
		will-change: filter, opacity;
	}

	.short-phrase {
		opacity: 1;
		filter: blur(0px);
	}
	.short-phrase p {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 400;
		font-size: var(--text-body);
		line-height: 34px;
		color: var(--content-primary, #071E45);
		margin: 0;
		white-space: nowrap;
	}
	.short-phrase.blur-out {
		opacity: 0;
		filter: blur(20px);
		pointer-events: none;
	}

	.long-quote {
		opacity: 0;
		filter: blur(20px);
		pointer-events: none;
	}
	.long-quote .quote-content {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 400;
		font-size: var(--text-body);
		line-height: 30px;
		color: var(--content-primary, #071E45);
		margin: 0 0 12px 0;
		white-space: normal; 
	}
	.long-quote .quote-author {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 600;
		font-size: 15px;
		color: color-mix(in srgb, var(--content-primary, #071E45) 70%, transparent);
		margin: 0;
	}
	.long-quote.blur-in {
		opacity: 1;
		filter: blur(0px);
		pointer-events: auto;
	}

	/* ======== BOTTONE ======== */
	.bottone {
		position: absolute;
		bottom: -85px; 
		left: 50%;
		transform: translateX(-50%);
		width: 194px;
		height: 66px;
		border: none;
		background: transparent;
		cursor: pointer;
		appearance: none;
		padding: 0;
		z-index: 10;
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

	/* ======== ANIMATIONS ======== */
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