<script>
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import { drawBorder } from '$lib/actions/drawBorder.js';
	import { trackSection } from '$lib/actions/trackSection.js';
	import { trailCanvas } from '$lib/actions/trailCanvas.js';
	import { miniTrailCanvas } from '$lib/actions/miniTrailCanvas.js';
	import { layers } from '$lib/stores/layers.svelte.js';
	import CursorTooltip from '$lib/components/ui/CursorTooltip.svelte';

	// Props per il controllo dello scroll
	let {
		lockScroll = () => {},
		unlockScroll = () => {},
		onExpand = () => {},
		onCollapse = () => {}
	} = $props();

	// Stato del quiz
	let quizState = $state('choosing');
	let selectedSide = $state('');
	let fisicoExpanding = $state(false);
	let mentaleShowing = $state(false);
	let fisicoFading = $state(false);
	let hasScrolledDown = $state(false);
	let animationTriggered = $state(false);
	let isExiting = $state(false);
	let layerVisible = $state(false);

	/** @type {HTMLElement} */
	let quizWrapper;
	/** @type {any} */
	let canvasAction = null;
	/** @type {any} */
	let quizPinST = null;

	// URL della maschera dinamica esportata dal canvas
	let canvasMaskUrl = $state('');

	// Tracciamento coordinate e stato hover per il tooltip
	let mouseX = $state(0);
	let mouseY = $state(0);
	let isHovering = $state(false);

	/** @type {ReturnType<typeof setTimeout>[]} */
	const pendingTimeouts = [];

	/**
	 * Traccia le coordinate relative del mouse nella viewport per posizionare il tooltip custom
	 * @param {MouseEvent} event
	 */
	function handleMouseMove(event) {
		mouseX = event.clientX;
		mouseY = event.clientY;
	}

	/**
	 * Associa il canvas per le scie di particelle
	 * @param {HTMLCanvasElement} node
	 */
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

	/**
	 * Action per il canvas slot machine con masking dinamico
	 * @param {HTMLCanvasElement} canvas
	 */
	function slotMachineCanvas(canvas) {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		/** @type {number} */
		let animationFrameId;

		const computed = getComputedStyle(document.documentElement);
		const heroFontSizeStr = getComputedStyle(canvas).fontSize || computed.getPropertyValue('--text-hero') || '80px';
		
		let fontSize = parseFloat(heroFontSizeStr);
		if (heroFontSizeStr.includes('rem')) {
			fontSize = fontSize * parseFloat(getComputedStyle(document.documentElement).fontSize);
		}
		if (isNaN(fontSize) || fontSize <= 0) fontSize = 80;

		const dpr = window.devicePixelRatio || 1;
		const rowHeight = fontSize * 1.2;
		const charWidth = fontSize * 0.65;
		
		const logicalWidth = charWidth * 3.5 + fontSize * 3.5; 
		const logicalHeight = rowHeight;

		canvas.width = logicalWidth * dpr;
		canvas.height = logicalHeight * dpr;
		canvas.style.width = `${logicalWidth}px`;
		canvas.style.height = `${logicalHeight}px`;
		ctx.scale(dpr, dpr);

		const animData = { 
			tensY: -fontSize * 0.4,
			onesY: -fontSize * 0.5,
			textX: -40,
			textOpacity: 0
		};

		const tl = gsap.timeline({ delay: 0.05 });

		tl.to(animData, {
			tensY: 0,
			duration: 0.55,
			ease: 'back.out(3.5)'
		}, 0);

		tl.to(animData, {
			onesY: 0,
			duration: 0.65,
			ease: 'back.out(4)'
		}, 0.05);

		tl.to(animData, {
			textX: 0,
			textOpacity: 1,
			duration: 0.6,
			ease: 'power2.out'
		}, 0.12);

		function draw() {
			if (!ctx) return;
			ctx.clearRect(0, 0, logicalWidth, logicalHeight);

			ctx.fillStyle = '#000000';
			ctx.textBaseline = 'top';

			const yOffset = (logicalHeight - fontSize) / 2;

			ctx.font = `800 ${fontSize}px 'Rethink Sans', sans-serif`;
			ctx.fillText('7', 0, yOffset + animData.tensY);

			const onesX = charWidth * 0.9;
			ctx.fillText('0', onesX, yOffset + animData.onesY);

			const percentX = onesX + charWidth * 0.9;
			ctx.fillText('%', percentX, yOffset);

			ctx.save();
			const baseTextX = percentX + charWidth * 1.0 + 24; 
			
			ctx.globalAlpha = animData.textOpacity;
			ctx.font = `800 ${fontSize}px 'Rethink Sans', sans-serif`;
			
			ctx.fillText('mentale', baseTextX + animData.textX, yOffset);
			ctx.restore();

			canvasMaskUrl = `url(${canvas.toDataURL('image/png')})`;

			animationFrameId = requestAnimationFrame(draw);
		}

		draw();

		return {
			destroy() {
				cancelAnimationFrame(animationFrameId);
				tl.kill();
			}
		};
	}

	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		// Controlla quando la sezione entra nel viewport per attivare la comparsa dei testi
		const viewTrigger = ScrollTrigger.create({
			trigger: quizWrapper,
			start: 'top 80%',
			end: 'bottom 20%',
			onUpdate: (self) => {
				layerVisible = self.isActive;
			}
		});

		// Ripristina lo stato del quiz quando si scorre all'indietro oltre la sezione
		const backTrigger = ScrollTrigger.create({
			trigger: quizWrapper,
			start: 'top 95%',
			onLeaveBack: () => {
				resetQuiz();
			}
		});

		return () => {
			viewTrigger.kill();
			backTrigger.kill();
			if (quizPinST) quizPinST.kill();
		};
	});

	// Animazione di comparsa del titolo e dei cerchi all'ingresso
	$effect(() => {
		if (layerVisible && !animationTriggered) {
			animationTriggered = true;
			gsap.fromTo('.quiz-title-wrap', { opacity: 0 }, { opacity: 1, duration: 0.4 });
			gsap.to('.title-line-1, .title-line-2, .circle .text', {
				opacity: 1,
				scale: 1,
				y: 0,
				duration: 1.0,
				ease: 'power2.out',
				delay: 0.2
			});
		} else if (!layerVisible && animationTriggered) {
			animationTriggered = false;
			gsap.to('.quiz-title-wrap', { opacity: 0, duration: 0.2 });
			gsap.set('.quiz-title-wrap .title-line-1', { opacity: 0, scale: 0.85, y: 15 });
			gsap.set('.quiz-title-wrap .title-line-2', { opacity: 0, scale: 0.85, y: 15 });
			gsap.set('.circle .text', { opacity: 0, scale: 0.85, y: 30 });
		}
	});

	// Gestisce reattivamente la creazione e la rimozione del Pinning locale
	$effect(() => {
		if (layers.quizCompleted && quizPinST) {
			quizPinST.kill();
			quizPinST = null;
		} else if (!layers.quizCompleted && !quizPinST && quizWrapper) {
			quizPinST = ScrollTrigger.create({
				trigger: quizWrapper,
				start: 'top top',
				pin: true,
				pinSpacing: true
			});
		}
	});

	// Comunica lo stato di espansione al genitore per inibire lo scorrimento
	$effect(() => {
		if (quizState === 'expanded' || quizState === 'expanding') {
			onExpand();
		} else {
			onCollapse();
		}
	});

	// Animazione di uscita sfumata e sblocco verso la PerformanceSection
	function animateQuizExit() {
		isExiting = true;
		gsap.to(quizWrapper, {
			opacity: 0,
			y: -80, // Leggero slide verso l'alto per rendere fluida la scomparsa
			duration: 0.8,
			ease: 'power2.in',
			onComplete: () => {
				isExiting = false;
				layers.quizCompleted = true; // Questo effetto eliminerà il pinning locale
				unlockScroll();

				// Eseguiamo uno scrolling smooth verso la sezione successiva
				setTimeout(() => {
					const nextSec = document.getElementById('performance');
					if (nextSec) {
						nextSec.scrollIntoView({ behavior: 'smooth' });
					}
				}, 50);
			}
		});
	}

	function resetQuiz() {
		unlockScroll();
		quizState = 'choosing';
		selectedSide = '';
		fisicoExpanding = false;
		mentaleShowing = false;
		fisicoFading = false;
		hasScrolledDown = false;
		isExiting = false;
		layers.quizCompleted = false;
		if (quizWrapper) {
			gsap.set(quizWrapper, { opacity: 1, y: 0 });
		}
	}

	/**
	 * Seleziona il ramo mentale
	 * @param {boolean} skipLock
	 */
	function selectMentale(skipLock = false) {
		if (quizState === 'expanded' || quizState === 'expanding') return;
		if (!skipLock) lockScroll();

		selectedSide = 'mentale';
		quizState = 'expanding';
		mentaleShowing = true;

		gsap.to('.quiz-title-wrap', { x: 80, opacity: 0, duration: 0.4, ease: 'power2.in' });

		pendingTimeouts.push(
			setTimeout(() => { fisicoFading = true; }, 300),
			setTimeout(() => {
				quizState = 'expanded';
				gsap.fromTo('.expanded-title-area',
					{ x: -60, opacity: 0 },
					{ x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
				);
			}, 600)
		);
	}

	/**
	 * Seleziona il ramo fisico (con deviazione sul mentale)
	 * @param {boolean} skipLock
	 */
	function selectFisico(skipLock = false) {
		if (quizState === 'expanded' || quizState === 'expanding') return;
		if (!skipLock) lockScroll();

		selectedSide = 'fisico';
		quizState = 'expanding';
		fisicoExpanding = true;

		gsap.to('.quiz-title-wrap', { x: 80, opacity: 0, duration: 0.4, ease: 'power2.in' });

		pendingTimeouts.push(
			setTimeout(() => {
				fisicoExpanding = false;
				fisicoFading = true;
				mentaleShowing = true;
			}, 300),
			setTimeout(() => {
				quizState = 'expanded';
				gsap.fromTo('.expanded-title-area',
					{ x: -60, opacity: 0 },
					{ x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
				);
			}, 600)
		);
	}

	/**
	 * Gestisce lo scroll virtuale interno alla schermata di risultato del quiz
	 * @param {WheelEvent} e
	 */
	function handleVirtualScroll(e) {
		if (quizState !== 'expanded' || layers.quizCompleted) return;

		const deltaY = e.deltaY;
		e.preventDefault();
		e.stopPropagation();

		if (deltaY > 10) {
			if (!hasScrolledDown) {
				hasScrolledDown = true;
			} else {
				animateQuizExit();
			}
		} else if (deltaY < -10) {
			if (hasScrolledDown) {
				hasScrolledDown = false;
			}
		}
	}

	onDestroy(() => {
		for (const id of pendingTimeouts) {
			clearTimeout(id);
		}
	});
</script>

<section
	id="cerchi-quiz"
	class="quiz-wrapper"
	bind:this={quizWrapper}
	aria-label="Scelta tra mentale e fisico"
	onwheel={handleVirtualScroll}
	use:trackSection
	onmousemove={handleMouseMove}
	onmouseenter={() => isHovering = true}
	onmouseleave={() => isHovering = false}
>
	<div class="canvas-layer">
		<canvas use:bindCanvas></canvas>
	</div>

	<div class="quiz-title-wrap" class:hidden={quizState === 'expanded' || !layerVisible}>
		<h1 class="quiz-title">
			<span class="title-line-1">Quando tutto si decide in pochi istanti,</span>
			<span class="title-line-2">cosa pesa davvero di più?</span>
		</h1>
	</div>

	<div class="quiz-body" class:expanded={quizState === 'expanding' || quizState === 'expanded'}>
		<div class="quiz-column left-column">
			<div class="circle-wrap left-wrap" class:expanded={quizState === 'expanded'}>
				<button
					class="circle left"
					class:clicked={selectedSide === 'mentale'}
					class:mentale-show={mentaleShowing}
					onclick={() => selectMentale(false)}
					use:drawBorder={{ clicked: selectedSide === 'mentale', enabled: animationTriggered }}
					disabled={quizState === 'expanding' || quizState === 'expanded'}
				>
					<svg class="border-svg" viewBox="0 0 320 320">
						<defs>
							<mask id="mask-left-exp">
								<circle
									class="mask-circle"
									cx="160"
									cy="160"
									r="157.89"
									fill="none"
									stroke="white"
									stroke-width="10"
									stroke-dasharray="992"
									stroke-dashoffset="992"
								/>
							</mask>
						</defs>
						<circle
							cx="160"
							cy="160"
							r="157.89"
							fill="none"
							stroke="var(--content-primary)"
							stroke-width="4"
							stroke-dasharray="0 12.4"
							stroke-linecap="round"
							mask="url(#mask-left-exp)"
						/>
					</svg>

					<div class="expanded-text-container">
						{#if mentaleShowing}
							<canvas class="mini-trail-canvas" use:miniTrailCanvas={{ size: 400 }}></canvas>
							<div class="expanded-text" style:--canvas-mask={canvasMaskUrl}>
								<canvas class="slot-machine-canvas" use:slotMachineCanvas></canvas>
							</div>
						{:else}
							<span class="text" class:gradient={selectedSide === 'mentale'}>mentale</span>
						{/if}
					</div>
				</button>
			</div>
		</div>

		<div class="quiz-column right-column">
			<div class="circle-wrap right-wrap" class:fly-out={fisicoFading}>
				<button
					class="circle right"
					onclick={() => selectFisico(false)}
					use:drawBorder={{ clicked: selectedSide === 'fisico', enabled: animationTriggered }}
					disabled={quizState === 'expanding' || quizState === 'expanded'}
				>
					<svg class="border-svg" viewBox="0 0 320 320">
						<defs>
							<mask id="mask-right">
								<circle
									class="mask-circle"
									cx="160"
									cy="160"
									r="157.89"
									fill="none"
									stroke="white"
									stroke-width="10"
									stroke-dasharray="992"
									stroke-dashoffset="992"
								/>
							</mask>
						</defs>
						<circle
							cx="160"
							cy="160"
							r="157.89"
							fill="none"
							stroke="var(--content-primary)"
							stroke-width="4"
							stroke-dasharray="0 12.4"
							stroke-linecap="round"
							mask="url(#mask-right)"
						/>
					</svg>
					<div class="expanded-text-container">
						<span class="text">fisico</span>
					</div>
				</button>
			</div>

			{#if quizState === 'expanded'}
				<div class="right-text-panel visible">
					<div class="text-block short-phrase" class:blur-out={hasScrolledDown}>
						<p>
							Il fisico porta l'atleta alla partenza.<br />
							La mente decide cosa succede dopo.
						</p>
					</div>

					<div class="text-block long-quote" class:blur-in={hasScrolledDown}>
						<p class="quote-content">
							"At this level, it's probably 70% mental and 30% physical. [...] I've had races
							where I was confident and performed incredibly well, and others where negativity took
							over and everything fell apart. Learning to control that is the real challenge."
							<br />
							— Adrian Yung, sci alpino
						</p>
					</div>
				</div>
			{/if}
		</div>
	</div>

	{#if isHovering && quizState === 'choosing' && layerVisible}
		<CursorTooltip
			visible={true}
			text="Scegli"
			type="semplice"
			x={mouseX}
			y={mouseY}
		/>
	{/if}
</section>

<style>
	/* Layout principale */
	.quiz-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
		min-height: 100vh;
		width: 100%;
		overflow: hidden;
		box-sizing: border-box;
		background-color: #f1fafd;
		will-change: opacity, transform;
	}

	/* Canvas di sfondo */
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

	/* Area del titolo */
	.quiz-title-wrap {
		width: 100%;
		max-width: 1200px;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 5;
		box-sizing: border-box;
		padding: 0 var(--spacing-3);
		will-change: opacity;
		margin-bottom: var(--spacing-8);
	}

	/* Container del cerchio sinistro */
	.left-wrap {
		position: relative;
		transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
	}

	.left-wrap.expanded {
		min-width: 540px;
	}

	/* Titolo del quiz */
	.quiz-title {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 700;
		text-align: center;
		margin: 0;
		font-size: var(--text-title);
		line-height: 1.25;
		color: var(--content-primary);
		transform-origin: center top;
		transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
		will-change: transform;
	}

	.quiz-title-wrap.hidden {
		display: none !important;
	}

	.title-line-1,
	.title-line-2 {
		display: block;
	}

	/* Titolo espanso: posizionato a destra del cerchio 70% */
	.expanded-title-area {
		position: absolute;
		left: calc(100% + 100px);
		top: 25%;
		width: 600px;
		min-width: 600px;
		display: flex;
		align-items: center;
		z-index: 10;
		box-sizing: border-box;
		will-change: transform, opacity;
	}

	.expanded-title-area h1 {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 700;
		text-align: left;
		margin: 0;
		font-size: 32px;
		line-height: 1.4;
		color: var(--color-content-primary, #071e45);
	}

	.expanded-title-area .title-line-1,
	.expanded-title-area .title-line-2 {
		display: block;
	}

	/* Body e colonne del quiz */
	.quiz-body {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--spacing-10);
		width: 100%;
		max-width: 1200px;
		position: relative;
		box-sizing: border-box;
		height: 320px;
		transition: height 0.8s cubic-bezier(0.25, 1, 0.5, 1), gap 0.8s cubic-bezier(0.25, 1, 0.5, 1);
		z-index: 1;
	}

	/* Stato espanso */
	.quiz-body.expanded {
		position: relative;
		width: 100%;
		max-width: 1200px;
		height: 100vh;
		min-height: 100vh;
		justify-content: center;
		align-items: center;
		gap: 100px;
		margin-top: 0;
		z-index: 10;
	}

	.quiz-column {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		height: 100%;
	}

	.left-column {
		justify-content: center;
	}

	.right-column {
		justify-content: center;
	}

	/* Cerchi interattivi */
	.circle-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.right-wrap {
		position: relative;
		transition:
			transform 0.6s cubic-bezier(0.25, 1, 0.5, 1),
			opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1);
		z-index: 4;
	}

	.right-wrap.fly-out {
		transform: translateX(350px);
		opacity: 0;
		pointer-events: none;
		transition:
			transform 0.45s ease-in,
			opacity 0.45s ease-in;
	}

	.circle {
		width: 320px;
		height: 320px;
		border-radius: 160px;
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
			width 0.6s cubic-bezier(0.25, 1, 0.5, 1),
			height 0.6s cubic-bezier(0.25, 1, 0.5, 1),
			border-radius 0.6s cubic-bezier(0.25, 1, 0.5, 1);
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

	.text {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 700;
		font-size: var(--text-l);
		color: var(--content-primary);
		white-space: nowrap;
		position: relative;
		z-index: 1;
	}

	.circle:hover .text,
	.circle.clicked .text {
		background: linear-gradient(
			120deg,
			var(--archetipi-favorito),
			var(--archetipi-insoddisfatto),
			var(--archetipi-infortunato)
		);
		background-size: 300% 100%;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		animation: global-shift-gradient 6s linear infinite;
	}

	/* Testo animato con la maschera canvas */
	.expanded-text {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		white-space: nowrap;
		position: relative;
		z-index: 1;

		background: linear-gradient(
			120deg,
			var(--archetipi-favorito),
			var(--archetipi-insoddisfatto),
			var(--archetipi-infortunato)
		);
		background-size: 300% 100%;
		animation: global-shift-gradient 6s linear infinite;

		-webkit-mask-image: var(--canvas-mask);
		mask-image: var(--canvas-mask);
		-webkit-mask-size: 100% 100%;
		mask-size: 100% 100%;
		-webkit-mask-repeat: no-repeat;
		mask-repeat: no-repeat;
	}

	.slot-machine-canvas {
		display: block;
		font-size: var(--text-title); 
		opacity: 0;
		pointer-events: none;
	}

	/* Ingrandimento cerchio mentale */
	.left.mentale-show {
		width: 420px;
		height: 420px;
		border-radius: 210px;
		background-color: var(--background-primary);
		transition:
			width 0.6s cubic-bezier(0.25, 1, 0.5, 1),
			height 0.6s cubic-bezier(0.25, 1, 0.5, 1),
			border-radius 0.6s cubic-bezier(0.25, 1, 0.5, 1);
	}

	/* Svg dei bordi rotanti */
	.border-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 3;
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

	/* Alone cromatico mini trail */
	.mini-trail-canvas {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		opacity: 0.9;
		filter: blur(80px);
		z-index: 0;
	}

	/* Pannello di testo con citazioni nel risultato */
	.right-text-panel {
		width: 540px;
		height: 220px;
		position: absolute;
		top: calc(50% - 60px);
		left: 0;
		z-index: 5;
		transform: translateX(-100px);
		opacity: 0;
		filter: blur(10px);
		transition:
			transform 0.6s cubic-bezier(0.25, 1, 0.5, 1),
			opacity 0.6s ease,
			filter 0.6s ease;
	}

	.right-text-panel.visible {
		opacity: 1;
		transform: translateX(0);
		filter: blur(0px);
	}

	.text-block {
		position: absolute;
		top: 50%;
		left: 0;
		transform: translateY(-50%);
		width: 100%;
		transition:
			filter 0.6s cubic-bezier(0.25, 1, 0.5, 1),
			opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1);
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
		color: var(--content-primary, #071e45);
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
		color: var(--content-primary, #071e45);
		padding-top: var(--spacing-10);
		margin: 0 0 var(--spacing-4) 0;
		white-space: normal;
	}

	.long-quote.blur-in {
		opacity: 1;
		filter: blur(0px);
		pointer-events: auto;
	}
</style>
