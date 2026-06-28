<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { Observer } from 'gsap/dist/Observer';
	import { quizAnimation, animateQuizStep } from '$lib/actions/home/quizAnimation.js';
	import { tooltip } from '$lib/stores/tooltipState.svelte.js';
	import { lockScroll, unlockScroll, scrollTo, lockScrollDown, unlockScrollDown } from '$lib/stores/lenis.svelte.js';
	import quoteIconSrc from '$lib/assets/quote-icon.svg';

	if (typeof window !== 'undefined') {
		gsap.registerPlugin(Observer);
	}

	// Stati reattivi (Rune Svelte 5)
	let quizState = $state('choosing'); // 'choosing' | 'animating' | 'results'
	let textStep = $state(1);           // 1: Primo blocco di testo, 2: Citazione Adrian Yung
	/** Permette allo scroll di passare quando l'utente ha finito gli step e naviga via */
	let canLeave = $state(false);

	/** @type {Observer | undefined} */
	let quizObserver;

	// Commento solo il PERCHÉ: durante animazione/risultati il lock è in Lenis (blocca lo smooth-wheel), ma
	// con syncTouch:false il touch resta nativo: l'Observer con preventDefault — abilitato solo nel lock — è
	// ciò che blocca davvero il touch e, con wheelSpeed -1, unifica la direzione di rotella e swipe.
	function advance() {
		if (quizState !== 'results') return;
		if (textStep === 1) {
			animateQuizStep(2, { onStepChange: () => { textStep = 2; } });
		} else if (textStep === 2) {
			// Gate aperto: si esce verso Performance con scroll morbido di Lenis
			canLeave = true;
			scrollTo('#performance');
		}
	}

	function back() {
		if (quizState !== 'results') return;
		if (textStep === 2) {
			animateQuizStep(1, { onStepChange: () => { textStep = 1; } });
		} else if (textStep === 1) {
			// Scroll up dalla prima scritta → sblocca così il pin si riavvolge verso l'intro
			canLeave = true;
		}
	}

	onMount(() => {
		quizObserver = Observer.create({
			target: window,
			type: 'wheel,touch,pointer',
			wheelSpeed: -1,
			tolerance: 20,
			preventDefault: true,
			onUp: advance,
			onDown: back
		});
		quizObserver.disable();
		return () => quizObserver?.kill();
	});

	// Commento solo il PERCHÉ: il blocco scroll segue lo stato del quiz; canLeave apre il gate (uscita o ritorno
	// all'intro). enable/disable dell'Observer è ciò che attiva/disattiva il preventDefault sul touch nativo.
	$effect(() => {
		if ((quizState === 'animating' || quizState === 'results') && !canLeave) {
			lockScroll();
			quizObserver?.enable();
		} else {
			unlockScroll();
			quizObserver?.disable();
		}
	});

	// Nasconde il tooltip quando quizState cambia mentre il mouse è ancora nell'area
	$effect(() => { if (quizState !== 'choosing') tooltip.hide(); });
</script>

<section
	id="cerchi-quiz"
	class="quiz-wrapper"
	aria-label="Quiz interattivo tra mente e fisico"
	use:quizAnimation={{
		quizState,
		lockScroll,
		unlockScroll,
		lockScrollDown,
		unlockScrollDown,
		onStateChange: (s) => quizState = s,
		onStepChange: (step) => textStep = step,
		onEnterBack: () => {
			// ScrollTrigger ha rilevato che l'utente è tornato nella quiz section
			// scrollando verso l'alto dalla sezione successiva: riattiva il controllo scroll
			if (canLeave && quizState === 'results') canLeave = false;
		}
	}}
>
	<div class="quiz-title-wrap">
		<h2 class="quiz-title">
			<span class="title-line">Quando tutto si decide in pochi istanti,<br> cosa pesa davvero di più?</span>
		</h2>
	</div>

	<div class="quiz-body" class:centered-layout={quizState === 'choosing'} class:results-layout={quizState === 'results'}>

		<div class="circle-container left-side" class:is-final={quizState === 'results'}>
			<button
				class="interactive-circle-btn"
				disabled={quizState !== 'choosing'}
				onmouseenter={() => { if (quizState === 'choosing') tooltip.show('Scegli', 'semplice'); }}
				onmouseleave={() => tooltip.hide()}
			>
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
			<button
				class="interactive-circle-btn"
				disabled={quizState !== 'choosing'}
				onmouseenter={() => { if (quizState === 'choosing') tooltip.show('Scegli', 'semplice'); }}
				onmouseleave={() => tooltip.hide()}
			>
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
						At this level, it’s probably 70% mental<br />
						and 30% physical. [...]<br />
						I’ve had races where I was confident<br />
						and performed incredibly well, and<br />
						others where negativity took over<br />
						and everything fell apart. Learning to<br />
						control that is the real challenge.
					</p>
					<span class="quote-author">— Adrian Yung, sci alpino</span>
				</div>
			</div>

		</div>
	</div>

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
		overflow: hidden;
		z-index: 10;
		opacity: 1;
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
	}

	.circle-container.left-side.is-final {
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
		/* clip-path rende l'area interattiva e visiva circolare (pointer-events seguono il clip) */
		clip-path: circle(50%);
		transition: transform var(--transition-duration-normal) var(--easing-out);
	}

	.interactive-circle-btn:disabled {
		cursor: default;
	}

	.centered-layout .interactive-circle-btn:not(:disabled):hover {
		transform: scale(1.06);
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
		/* Commento solo il PERCHÉ: mantiene il testo minuscolo fin da subito per coerenza visiva con le etichette delle percentuali */
		text-transform: none;
		transition: color 0.3s ease, background-image 0.3s ease;
		background-size: 200% auto;
		background-clip: text;
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
		/* Commento solo il PERCHÉ: sposta ulteriormente il pannello di testo a destra per distanziarlo dal cerchio sinistro ingrandito ed evitare sovrapposizioni visive */
		left: calc(50% + var(--spacing-9));
		/* Commento solo il PERCHÉ: centra perfettamente il pannello di testo (altezza 300px) sull'asse verticale rispetto al quiz-body (altezza 380px) */
		top: 40px;
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
		animation: moveGradient 3s linear infinite;
	}

	.hidden {
		display: none !important;
	}
</style>