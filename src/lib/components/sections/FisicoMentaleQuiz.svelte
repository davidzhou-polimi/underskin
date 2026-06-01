<script>
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import { drawBorder } from '$lib/actions/drawBorder.js';
	import { trackSection } from '$lib/actions/trackSection.js';
	import { miniTrailCanvas } from '$lib/actions/miniTrailCanvas.js';
	import { layers } from '$lib/stores/layers.svelte.js';
	import CursorTooltip from '$lib/components/ui/CursorTooltip.svelte';
	import { slotMachineCanvas } from '$lib/actions/slotMachineCanvas.js';

	// Props per il controllo dello scroll dal genitore
	let {
		lockScroll = () => {},
		unlockScroll = () => {},
		onExpand = () => {},
		onCollapse = () => {}
	} = $props();

	// z-index e stile del layer calcolati dallo store globale
	let zIndex = $derived(layers.getLayerZIndex(1));
	let layerStyle = $derived(layers.getLayerStyle(1));
	let layerVisible = $derived(layers.getLayerOpacity(1) > 0 && layers.getLayerZIndex(1) >= 0);

	// Stato del quiz
	let quizState = $state('choosing');
	let selectedSide = $state('');

	// Tracciamento coordinate e stato hover per visualizzare il tooltip custom su cerchi interattivi
	let mouseX = $state(0);
	let mouseY = $state(0);
	let isHovering = $state(false);

	/**
	 * Traccia le coordinate relative del mouse nella viewport per posizionare il tooltip custom
	 * @param {MouseEvent} event
	 */
	function handleMouseMove(event) {
		mouseX = event.clientX;
		mouseY = event.clientY;
	}
	let fisicoExpanding = $state(false);
	let mentaleShowing = $state(false);
	let fisicoFading = $state(false);
	let hasScrolledDown = $state(false);
	let animationTriggered = $state(false);
	/** @type {any} */
	let quizWrapper;
	// URL della maschera CSS esportata dall'action Canvas, usata per il gradiente animato
	let canvasMaskUrl = $state('');
	// IDs dei timeout attivi, cancellati nel destroy per prevenire callback su DOM smontato
	/** @type {ReturnType<typeof setTimeout>[]} */
	let pendingTimeouts = [];

	onMount(() => {
		gsap.set(quizWrapper, { y: '100vh' });
		gsap.set('.quiz-title-wrap .title-line-1', { opacity: 0, scale: 0.85, y: 15, transformOrigin: 'center center' });
		gsap.set('.quiz-title-wrap .title-line-2', { opacity: 0, scale: 0.85, y: 15, transformOrigin: 'center center' });
		gsap.set('.circle .text', { opacity: 0, scale: 0.85, y: 30, transformOrigin: 'center center' });
	});

	// Animazione di entrata/uscita basata sulla visibilità del layer
	$effect(() => {
		if (layerVisible && !animationTriggered) {
			animationTriggered = true;
			const targetY = layers.scrollDirection === 'up' ? '-100vh' : '100vh';

			gsap.set(quizWrapper, { y: targetY });
			gsap.to(quizWrapper, {
				y: '0',
				duration: 1.2,
				ease: 'power3.out'
			});

			// Reset

			// 重置并淡入选择页标题
			gsap.set('.quiz-title-wrap', { opacity: 1 });
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
			const targetY = layers.scrollDirection === 'up' ? '100vh' : '-100vh';

			gsap.to(quizWrapper, {
				y: targetY,
				duration: 1.0,
				ease: 'power3.inOut',
				onComplete: () => {
					if (layers.scrollDirection === 'up' && layers.progress < 0.25) {
						resetQuiz();
					}
				}
			});

			// 淡出选择页标题
			gsap.to('.quiz-title-wrap', { opacity: 0, duration: 0.2 });
		}
	});

	// Reset allo stato di scelta quando si torna all'inizio della sessione
	$effect(() => {
		const progress = layers.progress;
		if (progress < 0.30) {
			quizState = 'choosing';
			selectedSide = '';
			mentaleShowing = false;
			fisicoFading = false;
			hasScrolledDown = false;
			layers.quizCompleted = false;
		}
	});

	// Notifica il genitore quando lo stato cambia
	$effect(() => {
		if (quizState === 'expanded' || quizState === 'expanding') {
			onExpand();
		} else {
			onCollapse();
		}
	});

	function resetQuiz() {
		unlockScroll();
		quizState = 'choosing';
		selectedSide = '';
		fisicoExpanding = false;
		mentaleShowing = false;
		fisicoFading = false;
		hasScrolledDown = false;
		layers.quizCompleted = false;
	}

	function selectMentale(skipLock = false) {
		if (quizState === 'expanded' || quizState === 'expanding') return;
		if (!skipLock) lockScroll();

		selectedSide = 'mentale';
		quizState = 'expanding';
		mentaleShowing = true;

		// Titolo scelta scivola fuori, poi quello espanso scivola dentro
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

	function selectFisico(skipLock = false) {
		if (quizState === 'expanded' || quizState === 'expanding') return;
		if (!skipLock) lockScroll();

		selectedSide = 'fisico';
		quizState = 'expanding';
		fisicoExpanding = true;

		// Titolo scelta scivola fuori, poi il cerchio fisico si trasforma in mentale
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

	// Cancella tutti i timeout pendenti al momento dello smontaggio del componente
	onDestroy(() => {
		for (const id of pendingTimeouts) clearTimeout(id);
	});

	/**
	 * @param {any} e
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
				layers.quizCompleted = true;
				unlockScroll();
			}
		} else if (deltaY < -10) {
			if (hasScrolledDown) {
				hasScrolledDown = false;
				layers.quizCompleted = false;
			}
		}
	}
</script>

<section
	id="cerchi-quiz"
	class="quiz-wrapper"
	bind:this={quizWrapper}
	aria-label="Scelta tra mentale e fisico"
	style:z-index={zIndex}
	style={layerStyle}
	onwheel={handleVirtualScroll}
	use:trackSection
	onmousemove={handleMouseMove}
	onmouseenter={() => isHovering = true}
	onmouseleave={() => isHovering = false}
>


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
								<canvas class="slot-machine-canvas" use:slotMachineCanvas={{ onUpdateMask: (url) => canvasMaskUrl = url }}></canvas>
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
		justify-content: center; /* Centra verticalmente l'intero gruppo di contenuti per un perfetto bilanciamento asimmetrico */
		position: absolute;
		top: 0;
		left: 0;
		height: 100vh;
		width: 100%;
		overflow: hidden;
		box-sizing: border-box;
		background-color: var(--stage-background, #ffffff);
		transition: transform 0.1s linear;
		will-change: transform;
	}

	/* Titolo */
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
		margin-bottom: var(--spacing-8); /* Aumentato a 64px per dare il corretto respiro tipografico alla doppia riga di grandi dimensioni */
	}

	/* Risultato finale 标题 - 定位在 70% 圆圈 right */
	.left-wrap {
		position: relative;
		transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
	}

	.left-wrap.expanded {
		min-width: 540px;
	}

	.quiz-title {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 700;
		text-align: center;
		margin: 0;
		font-size: var(--text-title);
		/* Un interlinea di 1.25 offre un respiro ideale per la lettura di due righe a 56px, evitando che i caratteri appaiano visivamente troppo vicini o che si verifichino collisioni con caratteri ascendenti/discendenti */
		line-height: 1.25;
		color: var(--content-primary);
		transform-origin: center top;
		transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
		will-change: transform;
	}

	.quiz-title-wrap.hidden {
		display: none !important; /* Rimuove completamente il titolo dal flusso flex quando il quiz entra nello stato espanso a schermo intero */
	}

	.title-line-1,
	.title-line-2 {
		display: block;
	}

	/* Body e colonne */
	.quiz-body {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--spacing-10);
		width: 100%;
		max-width: 1200px;
		position: relative;
		box-sizing: border-box;
		height: 320px; /* Altezza fissa pari al diametro dei cerchi per garantire che il contenitore flex esegua una centratura verticale perfetta */
		transition: all 0.8s cubic-bezier(0.25, 1, 0.5, 1);
		z-index: 1;
	}

	/* 展开状态：垂直居中，给右侧标题腾空间 */
	.quiz-body.expanded {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100%;
		max-width: 1200px;
		height: 100vh;
		min-height: 100vh;
		justify-content: center;
		align-items: center;
		gap: 100px;
		margin-top: 0;
		z-index: 10; /* Si stacca dal flusso flex occupando l'intero schermo in modo indipendente dal titolo */
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

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	/* Cerchi */
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
		/* Peso impostato a 700 (bold) ed adattato alla misura var(--text-l) (40px) per un bilanciamento ottimale */
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

	/* Border SVG */
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

	/* Mini trail canvas */
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

	/* Pannello testo destro */
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
