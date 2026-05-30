<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { fade } from 'svelte/transition';
	import { drawBorder } from '$lib/actions/drawBorder.js';
	import { trackSection } from '$lib/actions/trackSection.js';
	import { trailCanvas } from '$lib/actions/trailCanvas.js';
	import { layers } from '$lib/stores/layers.svelte.js';

	// Props per il controllo dello scroll dal genitore
	let { lockScroll = () => {}, unlockScroll = () => {} } = $props();

	// Opacità del layer per determinare se la sezione è visibile
	let opacity = $derived(layers.getLayerOpacity(1));
	let isVisible = $derived(opacity > 0.5);

	let animationTriggered = $state(false);
	let quizWrapper;

	// Gestione canvas trail
	let canvasAction = null;

	function bindCanvas(node) {
		canvasAction = trailCanvas(node);
		return {
			destroy() {
				if (canvasAction) {
					canvasAction.destroy();
					canvasAction = null;
				}
			}
		};
	}

	onMount(() => {
		// Stato iniziale: completamente nascosto sotto il viewport
		gsap.set(quizWrapper, { y: '100%' });
		gsap.set('.title-line-1', { opacity: 0, scale: 0.85, y: 15, transformOrigin: 'center center' });
		gsap.set('.title-line-2', { opacity: 0, scale: 0.85, y: 15, transformOrigin: 'center center' });
		gsap.set('.circle .text', { opacity: 0, scale: 0.85, y: 30, transformOrigin: 'center center' });
	});

	// Animazione di entrata/uscita basata sulla visibilità del layer
	$effect(() => {
		if (isVisible && !animationTriggered) {
			animationTriggered = true;

			// Slide-in fluido nella viewport
			gsap.to(quizWrapper, {
				y: '0%',
				duration: 1.2,
				ease: 'power3.out'
			});

			// Animazione ritardata per titolo e cerchi
			setTimeout(() => {
				gsap.to('.title-line-1', {
					opacity: 1, scale: 1, y: 0, duration: 1.0, ease: 'power2.out'
				});
				gsap.to('.title-line-2', {
					opacity: 1, scale: 1, y: 0, duration: 1.0, ease: 'power2.out'
				});
				gsap.to('.circle .text', {
					opacity: 1, scale: 1, y: 0, duration: 1.0, ease: 'power2.out'
				});
			}, 200);

		} else if (!isVisible && animationTriggered) {
			animationTriggered = false;
			
			// Slide-out fluido verso il basso
			gsap.to(quizWrapper, { 
				y: '100%', 
				duration: 1.0, 
				ease: 'power3.inOut',
				onComplete: () => {
					resetQuiz();
					gsap.set('.title-line-1, .title-line-2, .circle .text', { opacity: 0, scale: 0.85, y: 15 });
				}
			});
		}
	});
	
	// --- Stato del quiz ---
	let quizState = $state('choosing'); // 'choosing' | 'expanding' | 'expanded'
	let selectedSide = $state('');
	let fisicoExpanding = $state(false);
	let mentaleShowing = $state(false);
	let fisicoFading = $state(false);
	let hasScrolledDown = $state(false);

	// Reset completo dello stato
	function resetQuiz() {
		unlockScroll();
		quizState = 'choosing';
		selectedSide = '';
		fisicoExpanding = false;
		mentaleShowing = false;
		fisicoFading = false;
		hasScrolledDown = false;
	}

	// Selezione mentale: cerchio 70% appare, fisico scompare
	function selectMentale() {
		if (quizState === 'expanded' || quizState === 'expanding') return;
		lockScroll();
		
		selectedSide = 'mentale';
		quizState = 'expanding';
		mentaleShowing = true;
		setTimeout(() => { fisicoFading = true; }, 300);
		setTimeout(() => { quizState = 'expanded'; }, 600);
	}

	// Selezione fisico: cerchio si espande, scompare e 70% mentale appare
	function selectFisico() {
		if (quizState === 'expanded' || quizState === 'expanding') return;
		lockScroll();
		
		selectedSide = 'fisico';
		quizState = 'expanding';
		fisicoExpanding = true;
		setTimeout(() => {
			fisicoExpanding = false;
			fisicoFading = true;
			mentaleShowing = true;
		}, 300);
		setTimeout(() => { quizState = 'expanded'; }, 600);
	}

	// Gestione scroll virtuale dopo la selezione
	function handleVirtualScroll(e) {
		if (quizState !== 'expanded') return;

		const deltaY = e.deltaY;

		if (deltaY > 10) {
			// Scroll verso il basso
			if (!hasScrolledDown) {
				hasScrolledDown = true;
			}
		} else if (deltaY < -10) {
			// Scroll verso l'alto
			if (hasScrolledDown) {
				hasScrolledDown = false;
			} else {
				// Reset completo con animazione
				gsap.to(quizWrapper, {
					y: '100%',
					duration: 0.8,
					ease: 'power3.out',
					onComplete: () => {
						resetQuiz();
					}
				});
			}
		}
	}
</script>

<section
	id="cerchi-quiz"
	class="quiz-wrapper"
	bind:this={quizWrapper}
	style:pointer-events={opacity > 0.2 ? 'auto' : 'none'} 
	onwheel={handleVirtualScroll}
	use:trackSection
>
	<div class="canvas-layer">
		<canvas use:bindCanvas></canvas>
	</div>
	
	<div class="quiz-title-wrap" class:expanded={quizState === 'expanding' || quizState === 'expanded'}>
		<h1 class="quiz-title">
			<span class="title-line-1">Quando tutto si decide in pochi istanti,</span>
			<span class="title-line-2">cosa pesa davvero di più?</span>
		</h1>
	</div>

	<div class="quiz-body" class:expanded={quizState === 'expanding' || quizState === 'expanded'}>

		<!-- Cerchio Mentale -->
		<div class="quiz-column left-column">
			<div class="circle-wrap left-wrap">
				<button
					class="circle left"
					class:clicked={selectedSide === 'mentale'}
					class:mentale-show={mentaleShowing}
					onclick={selectMentale}
					use:drawBorder={{ clicked: selectedSide === 'mentale', enabled: animationTriggered }}
					disabled={quizState === 'expanding' || quizState === 'expanded'}
				>
					<svg class="border-svg" viewBox="0 0 407 407">
						<defs>
							<mask id="mask-left-exp">
								<circle class="mask-circle" cx="203.5" cy="203.5" r="201.5" fill="none" stroke="white" stroke-width="10" stroke-dasharray="1266" stroke-dashoffset="1266" />
							</mask>
						</defs>
						<circle cx="203.5" cy="203.5" r="201.5" fill="none" stroke="var(--content-primary)" stroke-width="4" stroke-dasharray="0 16" stroke-linecap="round" mask="url(#mask-left-exp)" />
					</svg>

					{#if selectedSide === 'mentale' || mentaleShowing}
						<div class="sfumatura-bg" in:fade={{ duration: 300 }} out:fade={{ duration: 250 }}>
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
						{#if mentaleShowing}
							<span class="expanded-text gradient" in:fade={{ duration: 250, delay: 100 }}>70% mentale</span>
						{:else}
							<span class="text" class:gradient={selectedSide === 'mentale'}>mentale</span>
							<span class="clicca-hint">clicca</span>
						{/if}
					</div>
				</button>
			</div>
		</div>

		<!-- Cerchio Fisico -->
		<div class="quiz-column right-column">
			<div class="circle-wrap right-wrap" class:fly-out={fisicoFading}>
				<button
					class="circle right"
					class:clicked={selectedSide === 'fisico'}
					class:fisico-expand={fisicoExpanding}
					onclick={selectFisico}
					use:drawBorder={{ clicked: selectedSide === 'fisico', enabled: animationTriggered }}
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
						<div class="sfumatura-bg" out:fade={{ duration: 200 }}>
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

					<div class="expanded-text-container">
						<span class="text" class:gradient={selectedSide === 'fisico'}>fisico</span>
						<span class="clicca-hint">clicca</span>
					</div>
				</button>
			</div>

			<!-- Pannello testo laterale -->
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
							"At this level, it's probably 70% mental and 30% physical. [...] I've had races where I was confident and performed incredibly well, and others where negativity took over and everything fell apart. Learning to control that is the real challenge."
						</p>
						<p class="quote-author">— Adrian Yung, sci alpino</p>
					</div>
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	/* Layout principale */
	.quiz-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		position: absolute;
		top: 0;
		left: 0;
		height: 100vh;
		width: 100%;
		overflow: hidden;
		box-sizing: border-box;
		padding: var(--spacing-4) 0 var(--spacing-3) 0;
		background-color: #f1fafd;
		z-index: 10;
		transition: transform 0.1s linear;
		will-change: transform;
	}

	/* Canvas background */
	.canvas-layer {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
	}
	.canvas-layer canvas {
		display: block;
		width: 100%;
		height: 100%;
		filter: blur(60px) saturate(1);
	}

	/* Titolo del quiz */
	.quiz-title-wrap {
		position: absolute;
		top: var(--spacing-4);
		left: 50%;
		transform: translateX(-50%);
		width: 100%;
		max-width: 1200px;
		height: 140px;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 5;
		box-sizing: border-box;
		padding: 0 var(--spacing-3);
	}
	.quiz-title {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 700;
		text-align: center;
		margin: 0;
		font-size: var(--text-title);
		line-height: var(--spacing-7);
		color: var(--color-content-primary, #071E45);
		transform-origin: center top;
		transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
		will-change: transform;
	}
	.quiz-title-wrap.expanded .quiz-title {
		transform: scale(0.714);
	}
	.title-line-1, .title-line-2 {
		display: block;
	}

	/* Corpo del quiz */
	.quiz-body {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-10);
		width: 100%;
		max-width: 1200px;
		position: relative;
		box-sizing: border-box;
		margin-top: var(--spacing-11);
		height: 574px;
		align-items: center;
		transition: gap 0.8s cubic-bezier(0.25, 1, 0.5, 1);
		z-index: 1;
	}

	/* Colonne */
	.quiz-column {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		height: 574px;
		min-height: 407px;
	}
	.left-column {
		justify-content: center;
	}
	.right-column {
		justify-content: center;
	}

	/* Wrapper cerchi */
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
		transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1);
		z-index: 4;
	}
	.right-wrap.fly-out {
		transform: translateX(350px);
		opacity: 0;
		pointer-events: none;
		transition: transform 0.45s ease-in, opacity 0.45s ease-in;
	}

	/* Cerchi */
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
		transition: width 0.6s cubic-bezier(0.25, 1, 0.5, 1), height 0.6s cubic-bezier(0.25, 1, 0.5, 1), border-radius 0.6s cubic-bezier(0.25, 1, 0.5, 1);
	}
	.circle.left {
		z-index: 2;
	}
	.circle.right {
		z-index: 1;
	}
	.circle:disabled {
		cursor: default;
	}

	/* Cerchio mentale 70% */
	.left.mentale-show {
		width: 574px;
		height: 574px;
		border-radius: 287px;
	}

	/* Cerchio fisico espanso */
	.right.fisico-expand {
		width: 480px;
		height: 480px;
		border-radius: 240px;
		transition: width 0.3s ease-out, height 0.3s ease-out, border-radius 0.3s ease-out;
	}

	/* SVG bordo */
	.border-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 3;
	}

	/* Testo */
	.text {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 800;
		font-size: var(--text-title);
		color: var(--color-content-primary, #071E45);
		white-space: nowrap;
		position: relative;
		z-index: 1;
	}
	.circle:hover .text, .circle.clicked .text {
		background: linear-gradient(120deg, var(--archetipi-favorito), var(--archetipi-insoddisfatto), var(--archetipi-infortunato));
		background-size: 300% 100%;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		animation: global-shift-gradient 6s linear infinite;
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
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
		z-index: 1;
		height: var(--spacing-7);
	}

	/* Hint clicca */
	.clicca-hint {
		display: none;
		font-size: var(--text-button);
		color: var(--color-content-secondary, #666);
		margin-top: var(--spacing-1);
		text-transform: lowercase;
		letter-spacing: 1px;
		position: absolute;
		bottom: calc(var(--spacing-2) * -1 - var(--spacing-1));
	}
	.circle:hover .clicca-hint {
		display: block;
	}

	/* Sfondo sfumato */
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

	/* Pannello testo laterale */
	.right-text-panel {
		width: 540px;
		height: 220px;
		position: absolute;
		left: 0;
		z-index: 5;
		transform: translateX(-100px);
		opacity: 0;
		filter: blur(10px);
		transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.6s ease, filter 0.6s ease;
	}
	.right-text-panel.visible {
		opacity: 1;
		transform: translateX(0);
		filter: blur(0px);
	}

	/* Blocchi di testo */
	.text-block {
		position: absolute;
		top: 50%;
		left: 0;
		transform: translateY(-50%);
		width: 100%;
		transition: filter 0.6s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1);
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
		line-height: var(--spacing-4);
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
		line-height: var(--spacing-4);
		color: var(--content-primary, #071E45);
		margin: 0 0 var(--spacing-1) 0;
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

	/* Animazioni */
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
