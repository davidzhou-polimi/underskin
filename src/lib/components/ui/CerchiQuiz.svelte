<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { fade } from 'svelte/transition';
	import { drawBorder } from '$lib/actions/drawBorder.js';
	import { trackSection } from '$lib/actions/trackSection.js';
	import { trailCanvas } from '$lib/actions/trailCanvas.js';
	import { layers } from '$lib/stores/layers.svelte.js';

	// 追踪 layer 的 opacity
	let opacity = $derived(layers.getLayerOpacity(1));

	// 只有当 opacity 真正 > 0.5 时才触发动画（确保完全可见）
	let isVisible = $derived(opacity > 0.5);

	// 用一个状态来追踪是否已经播放过动画
	let animationTriggered = $state(false);

	// 引用 quiz wrapper 用于 GSAP 动画
	let quizWrapper;

	onMount(() => {
		// 初始状态：藏在底部
		gsap.set(quizWrapper, { y: '100%' });
		// 文字初始状态：先隐藏
		gsap.set('.title-line-1', { opacity: 0, scale: 0.85, y: 15, transformOrigin: 'center center' });
		gsap.set('.title-line-2', { opacity: 0, scale: 0.85, y: 15, transformOrigin: 'center center' });
		gsap.set('.circle .text', { opacity: 0, scale: 0.85, y: 30, transformOrigin: 'center center' });
	});

	// 当 isVisible 变为 true 且动画还没触发过时，触发 slide up + 出场动画
	$effect(() => {
		if (isVisible && !animationTriggered) {
			animationTriggered = true;

			// slide up 同时开始文字出场动画
			gsap.to(quizWrapper, {
				y: '0%',
				duration: 1.2,
				ease: 'power3.out'
			});

			// 文字出场动画延迟一点再开始
			setTimeout(() => {
				gsap.to('.title-line-1', {
					opacity: 1, scale: 1, y: 0, duration: 1.0, ease: 'power2.out'
				});
				gsap.to('.title-line-2', {
					opacity: 1, scale: 1, y: 0, duration: 1.0, stagger: 0.2, ease: 'power2.out'
				});
				gsap.to('.circle .text', {
					opacity: 1, scale: 1, y: 0, duration: 1.0, stagger: 0.2, ease: 'power2.out'
				});
			}, 200);
		}
	});
	
	let canvasAction = null;

	// Bind canvas to get the action instance
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

	let quizState = $state('choosing');
	let selectedSide = $state('');
	let fisicoExpanding = $state(false);
	let mentaleShowing = $state(false);
	let fisicoFading = $state(false);
	let bottoneHover = $state(false);

	let hasScrolledDown = $state(false);
	let accumulatedScrollPastQuote = 0;
	let quotePassed = $state(false);

	let showBottone = $derived(quizState === 'selected');

	function selectMentale() {
		if (quizState === 'expanded' || quizState === 'expanding') return;
		selectedSide = 'mentale';
		quizState = 'expanding';
		
		// 1. mentale 70% 圆圈先出现
		mentaleShowing = true;
		// 2. 停留一段时间后 fisico 开始消失
		setTimeout(() => {
			fisicoFading = true;
		}, 300);
		// 3. 完成
		setTimeout(() => {
			quizState = 'expanded';
		}, 600);
	}

	function selectFisico() {
		if (quizState === 'expanded' || quizState === 'expanding') return;
		selectedSide = 'fisico';
		quizState = 'expanding';
		// 1. 先稍微展开（比 mentale 小）
		fisicoExpanding = true;
		// 2. fisico 开始滑出消失，mentale 70% 出现
		setTimeout(() => {
			fisicoExpanding = false;
			fisicoFading = true;
			mentaleShowing = true;
		}, 300);
		// 3. 完成
		setTimeout(() => {
			quizState = 'expanded';
		}, 600);
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
						{#if mentaleShowing}
							<span class="expanded-text gradient">70% mentale</span>
						{:else}
							<span class="text" class:gradient={selectedSide === 'mentale'}>mentale</span>
							<span class="clicca-hint">clicca</span>
						{/if}
					</div>
				</button>
			</div>
		</div>

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

					<div class="expanded-text-container">
						<span class="text" class:gradient={selectedSide === 'fisico'}>fisico</span>
						<span class="clicca-hint">clicca</span>
					</div>
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
	/* Contenitore principale del quiz */
	.quiz-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start; 
		position: fixed; 
		inset: 0;
		height: 100vh;
		width: 100%;
		overflow: hidden;
		box-sizing: border-box;
		padding: var(--spacing-4) 0 var(--spacing-3) 0; 
		background-color: #f1fafd;
		z-index: 10; 
	}

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

	/* Contenitore del titolo */
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

	/* Titolo principale */
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

	/* Titolo ridotto nella pagina dei risultati */
	.quiz-title-wrap.expanded .quiz-title {
		transform: scale(0.714);
	}

	.title-line-1,
	.title-line-2 {
		display: block;
	}

	/* Corpo del quiz con le colonne */
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

	/* Colonna singola */
	.quiz-column {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		height: 574px;
		min-height: 407px;
	}

	/* Colonna sinistra */
	.left-column {
		justify-content: center;
	}

	/* Colonna destra */
	.right-column {
		justify-content: center;
	}

	/* Contenitore del cerchio */
	.circle-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	/* Contenitore sinistro */
	.left-wrap {
		transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
	}

	/* Contenitore destro */
	.right-wrap {
		position: absolute;
		left: 0;
		transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 1s ease;
		z-index: 4;
	}

	.right-wrap.fly-out {
		transform: translateX(350px);
		opacity: 0;
		transition: transform 0.4s ease-in, opacity 0.4s ease-in;
	}

	/* Cerchio del quiz */
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

	/* Cerchio espanso nella pagina dei risultati */
	.circle.is-expanding,
	.circle.is-expanded {
		width: 574px;
		height: 574px;
		border-radius: 287px;
	}

	/* Mentale: 70% 圆圈出现 */
	.left.mentale-show {
		width: 574px;
		height: 574px;
		border-radius: 287px;
	}

	/* Fisico: 稍微展开 */
	.right.fisico-expand {
		width: 480px;
		height: 480px;
		border-radius: 240px;
		transition: width 0.3s ease-out, height 0.3s ease-out, border-radius 0.3s ease-out;
	}

	/* Bordo SVG del cerchio */
	.border-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 3;
	}

	/* Testo all'interno del cerchio */
	.text {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 800;
		font-size: var(--text-title);
		color: var(--color-content-primary, #071E45);
		white-space: nowrap;
		position: relative;
		z-index: 1;
	}

	/* Effetto gradiente al hover */
	.circle:hover .text,
	.circle.clicked .text {
		background: linear-gradient(120deg, var(--archetipi-favorito), var(--archetipi-insoddisfatto), var(--archetipi-infortunato));
		background-size: 300% 100%;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		animation: global-shift-gradient 6s linear infinite;
	}

	/* Testo espanso nella pagina dei risultati */
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

	/* Contenitore del testo espanso */
	.expanded-text-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
		z-index: 1;
		height: var(--spacing-7);
	}

	/* Hint "clicca" */
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

	.right-text-panel {
		width: 540px;
		height: 220px;
		position: absolute;
		left: 0;
		z-index: 5;
		transform: translateX(-100px);
		opacity: 0;
		transition: transform 0.6s ease, opacity 0.6s ease;
	}

	.right-text-panel.visible {
		opacity: 1;
		transform: translateX(0);
		transition: transform 0.4s ease, opacity 0.4s ease;
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

	/* Frase breve */
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