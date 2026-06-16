<script>
	import { gsap } from 'gsap';
	import { onMount } from 'svelte';
	import { trackSection } from '$lib/actions/trackSection.js';
	import { quizAnimation } from '$lib/actions/home/quizAnimation.js';
	import CursorTooltip from '$lib/components/ui/CursorTooltip.svelte';
	import quoteIconSrc from '$lib/assets/quote-icon.svg';

	/**
	 * @typedef {Object} QuizProps
	 * @property {(() => void)} [lockScroll]
	 * @property {(() => void)} [unlockScroll]
	 * @property {(() => void)} [onExpand]
	 * @property {(() => void)} [onCollapse]
	 */

	/** @type {QuizProps} */
	let {
		lockScroll = () => {},
		unlockScroll = () => {},
		onExpand = () => {},
		onCollapse = () => {}
	} = $props();

	// Stati reattivi (Rune Svelte 5)
	let quizState = $state('choosing'); // 'choosing' | 'animating' | 'results'
	let textStep = $state(1);           // 1: Primo blocco di testo, 2: Citazione Adrian Yung
	let isHovering = $state(false);
	let mouseX = $state(0);
	let mouseY = $state(0);
	/** Permette allo scroll di passare quando l'utente ha finito gli step e naviga via */
	let canLeave = $state(false);

	/**
	 * Listener wheel non-passivo montato via onMount: l'unico modo affidabile per
	 * bloccare lo scroll anche quando ScrollTrigger usa listener propri sulla window.
	 * passive: false è necessario per poter chiamare e.preventDefault().
	 */
	onMount(() => {
		/**
		 * @param {WheelEvent} e
		 */
		function preventScrollDuringQuiz(e) {
			if ((quizState === 'animating' || quizState === 'results') && !canLeave) {
				// Eccezione: scroll verso l'alto da textStep=1 in results → lascia passare,
				// lo scroll naturale rilascerà il pin e tornerà all'intro
				if (quizState === 'results' && textStep === 1 && e.deltaY < 0) return;
				e.preventDefault();
			}
		}
		window.addEventListener('wheel', preventScrollDuringQuiz, { passive: false });
		return () => window.removeEventListener('wheel', preventScrollDuringQuiz);
	});

	/**
	 * @param {MouseEvent} event
	 */
	function handleMouseMove(event) {
		mouseX = event.clientX;
		mouseY = event.clientY;
	}

	/**
	 * @param {WheelEvent} e
	 */
	function handleSelectiveScroll(e) {
		// Backup: il listener non-passivo in onMount è il primary blocker;
		// questo copre i casi in cui svelte:window sia non-passivo e cancelable
		const shouldBlock =
			(quizState === 'choosing' && e.deltaY > 0) ||
			((quizState === 'animating' || quizState === 'results') && !canLeave);
		if (shouldBlock && e.cancelable) e.preventDefault();
	}

	$effect(() => {
		if (quizState === 'results' || quizState === 'animating') {
			onExpand();
		} else {
			onCollapse();
		}
	});

	/**
	 * @param {WheelEvent} e
	 */
	function handleVirtualScroll(e) {
		if (quizState !== 'results') return;

		if (e.deltaY > 20) {
			// Scroll verso il basso
			e.preventDefault();
			if (textStep === 1) {
				// Imposta lo stato iniziale su step-2 mentre è ancora hidden,
				// così quando il DOM lo rende visibile non fa un flash
				gsap.set('.step-2', { opacity: 0, y: 20, filter: 'blur(10px)' });
				gsap.timeline()
					.to('.step-1', { opacity: 0, y: -20, filter: 'blur(10px)', duration: 0.4, ease: 'power2.in' })
					.add(() => { textStep = 2; }) // aggiorna solo dopo che step-1 è uscito
					.to('.step-2', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' });
			} else if (textStep === 2) {
				// Apre il gate: il listener non-passivo non bloccherà più lo scroll
				canLeave = true;
				unlockScroll();
				const nextSection = document.getElementById('performance');
				if (nextSection) {
					nextSection.scrollIntoView({ behavior: 'smooth' });
				}
			}
		} else if (e.deltaY < -20) {
			// Scroll verso l'alto
			if (textStep === 2) {
				e.preventDefault();
				// Richiude il gate se l'utente torna indietro alla prima scritta
				canLeave = false;
				gsap.set('.step-1', { opacity: 0, y: -20, filter: 'blur(10px)' });
				gsap.timeline()
					.to('.step-2', { opacity: 0, y: 20, filter: 'blur(10px)', duration: 0.4, ease: 'power2.in' })
					.add(() => { textStep = 1; })
					.to('.step-1', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' });
			} else if (textStep === 1) {
				// Scroll up dalla prima scritta → torna all'intro
				// preventScrollDuringQuiz già lascia passare questo evento
				canLeave = true; // per sicurezza, assicura che il gate sia aperto
			}
		}
	}
</script>

<svelte:window onwheel={handleSelectiveScroll} />

<section
	id="cerchi-quiz"
	class="quiz-wrapper"
	aria-label="Quiz interattivo tra mente e fisico"
	onwheel={handleVirtualScroll}
	onmousemove={handleMouseMove}
	onmouseenter={() => isHovering = true}
	onmouseleave={() => isHovering = false}
	use:trackSection={{ id: 'quiz' }}
	use:quizAnimation={{
		quizState,
		lockScroll,
		unlockScroll,
		onStateChange: (s) => quizState = s,
		onStepChange: (step) => textStep = step,
		onEnterBack: () => {
			// ScrollTrigger ha rilevato che l'utente è tornato nella quiz section
			// scrollando verso l'alto dalla sezione successiva: riattiva il controllo scroll
			if (canLeave && quizState === 'results') canLeave = false;
		}
	}}
>
	<div class="quiz-title-wrap" class:hidden={quizState !== 'choosing'}>
		<h2 class="quiz-title">
			<span class="title-line">Quando tutto si decide in pochi istanti,<br> cosa pesa davvero di più?</span>
		</h2>
	</div>

	<div class="quiz-body" class:centered-layout={quizState === 'choosing'} class:results-layout={quizState === 'results'}>
		
		<div class="circle-container left-side" class:is-final={quizState === 'results'}>
			<button class="interactive-circle-btn" disabled={quizState !== 'choosing'}>
				<svg class="target-circle-svg" viewBox="0 0 320 320" aria-hidden="true">
					<circle cx="160" cy="160" r="150" class="dashed-circle-element" />
				</svg>
				<div class="label-overlay">
					<span class="initial-label animate-gradient-text">mentale</span>
				</div>
				<span class="percentage-text mental-gradient">70% mentale</span>
			</button>
		</div>

		<div class="circle-container right-side" class:is-hidden-final={quizState === 'results'}>
			<button class="interactive-circle-btn" disabled={quizState !== 'choosing'}>
				<svg class="target-circle-svg" viewBox="0 0 320 320" aria-hidden="true">
					<circle cx="160" cy="160" r="150" class="dashed-circle-element" />
				</svg>
				<div class="label-overlay">
					<span class="initial-label animate-gradient-text">fisico</span>
				</div>
				<span class="percentage-text mental-gradient">30% fisico</span>
			</button>
		</div>

		<div class="text-panel" class:visible={quizState === 'results'}>
			
			<div class="text-block step-1" class:hidden={textStep !== 1}>
				<p class="main-statement">
					Il fisico porta l'atleta alla partenza.<br />
					<span class="strong-focus">La mente decide cosa succede dopo.</span>
				</p>
			</div>

			<div class="text-block step-2" class:hidden={textStep !== 2}>
				<div class="quote-wrapper">
					<img src={quoteIconSrc} alt="" role="presentation" class="quote-icon" />
					<p class="quote-content">
						At this level, it’s probably 70% mental and 30% physical. [...] <br />I’ve had races where I was confident and performed incredibly well, and others where negativity took over and everything fell apart. Learning to control that is the real challenge.
					</p>
					<span class="quote-author">— Adrian Yung, sci alpino</span>
				</div>
			</div>

		</div>
	</div>

	{#if isHovering && quizState === 'choosing'}
		<CursorTooltip visible={true} text="Scegli" type="semplice" x={mouseX} y={mouseY} />
	{/if}
</section>

<style>
	.quiz-wrapper {
		position: relative;
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background: transparent;
	}

	.quiz-title-wrap {
		text-align: center;
		margin-bottom: var(--spacing-8);
		z-index: 10;
		opacity: 1;
		transition: opacity 0.3s ease;
	}

	.quiz-title {
		line-height: 1.2;
		margin: 0;
	}

	.quiz-body {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		max-width: 1200px;
		height: 380px;
		/* Gap costante in tutti gli stati per evitare layout shift durante l'animazione */
		gap: var(--spacing-10);
	}

	.centered-layout {
		gap: var(--spacing-10);
	}

	.quiz-body.results-layout {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-10);
	}

	.circle-container {
		position: relative;
		width: 360px;
		height: 360px;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		will-change: transform, opacity;
	}

	.circle-container.left-side.is-final {
		/* Commento solo il PERCHÉ: allinea la traslazione finale del cerchio sinistro al nuovo posizionamento bilanciato e centrato nella viewport */
		transform: translateX(calc(-1 * var(--spacing-5))) scale(1.5) !important;
		opacity: 1 !important;
	}

	.circle-container.left-side.is-final .percentage-text {
		opacity: 1 !important;
		transform: scale(1) !important;
	}

	.circle-container.left-side.is-final .initial-label {
		opacity: 0 !important;
	}

	.circle-container.right-side.is-hidden-final {
		transform: translateX(500px) !important;
		opacity: 0 !important;
		pointer-events: none;
	}

	.interactive-circle-btn {
		background: transparent;
		border: none;
		cursor: pointer;
		position: relative;
		width: 100%;
		height: 100%;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		outline: none;
	}

	.interactive-circle-btn:disabled {
		cursor: default;
	}

	.target-circle-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	/* Rimosso completamente l'attributo 'opacity' come richiesto */
	.dashed-circle-element {
		fill: none;
		stroke: var(--content-primary);
		stroke-width: 4;
		stroke-dasharray: 0 12.4;
		stroke-linecap: round;
		transition: stroke 0.3s ease;
	}

	.label-overlay {
		position: relative;
		z-index: 2;
		text-align: center;
		font-family: var(--font-family-base, sans-serif);
		/* Commento solo il PERCHÉ: allinea il peso del font del testo overlay al token bold globale */
		font-weight: var(--text-bold);
	}

	.animate-gradient-text {
		--gradient-c1: var(--archetipi-favorito, #6A96DF);
		--gradient-c2: var(--archetipi-insoddisfatto, #8035D2);
		--gradient-c3: var(--archetipi-infortunato, #D86146);

		font-size: var(--text-l, 1.5rem);
		color: var(--content-primary);
		text-transform: lowercase;
		transition: color 0.3s ease, background-image 0.3s ease;
		background-size: 200% auto;
		background-clip: text;
		-webkit-background-clip: text;
	}

	.interactive-circle-btn:hover .animate-gradient-text {
		color: transparent;
		background-image: linear-gradient(
			120deg,
			var(--gradient-c1),
			var(--gradient-c2),
			var(--gradient-c3),
			var(--gradient-c1)
		);
		animation: moveGradient 3s linear infinite;
	}

	@keyframes moveGradient {
		0% {
			background-position: 0% center;
		}
		100% {
			background-position: 200% center;
		}
	}

	.percentage-text {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-xl, 2rem);
		white-space: nowrap;
		opacity: 0;
		transform: scale(0.8);
		will-change: opacity, transform;
	}



	.text-panel {
		position: absolute;
		/* Commento solo il PERCHÉ: sposta il punto di partenza del pannello di testo a destra per bilanciare geometricamente il cerchio sinistro ingrandito */
		left: calc(50% + var(--spacing-7));
		width: 480px;
		height: 300px;
		display: flex;
		align-items: center;
		opacity: 0;
		pointer-events: none;
	}

	.text-panel.visible {
		opacity: 1 !important;
		pointer-events: auto;
	}

	.text-block {
		position: absolute;
		width: 100%;
		will-change: transform, opacity, filter;
	}

	.main-statement {
		font-family: var(--font-family-base, sans-serif);
		font-size: var(--text-caption-size);
		line-height: 1.2;
		color: var(--content-primary);
	}

	.strong-focus {
		/* Commento solo il PERCHÉ: allinea il peso del font evidenziato al token bold globale */
		font-weight: var(--text-bold);
	}

	.quote-wrapper {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--spacing-2);
	}

	.quote-icon {
		width: var(--spacing-4);
		height: auto;
	}

	.quote-content {
		font-family: var(--font-family-base, sans-serif);
		font-size: var(--text-caption-size);
		font-style: italic;
		color: var(--content-primary);
	}

	.quote-author {
		font-family: var(--font-family-base, sans-serif);
		font-size: var(--text-xs);
		color: var(--neutral-700);
	}

	.mental-gradient {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-body-size);
		font-weight: var(--text-important-weight);
		white-space: nowrap;
		opacity: 0;
		will-change: opacity, transform;
		/* Stesso gradiente animato dell'initial-label */
		color: transparent;
		background-image: linear-gradient(
			120deg,
			var(--archetipi-favorito, #6A96DF),
			var(--archetipi-insoddisfatto, #8035D2),
			var(--archetipi-infortunato, #D86146),
			var(--archetipi-favorito, #6A96DF)
		);
		background-size: 200% auto;
		background-clip: text;
		-webkit-background-clip: text;
		animation: moveGradient 3s linear infinite;
	}

	.hidden {
		display: none !important;
	}
</style>