<script>
	import { quizAnimation, animateQuizStep } from '$lib/actions/home/quizAnimation.js';
	import { quizDragMobile } from '$lib/actions/home/quizDragMobile.js';
	import { tooltip } from '$lib/stores/tooltipState.svelte.js';
	import { scrollTo } from '$lib/stores/lenis.svelte.js';
	import { scrollLock } from '$lib/stores/scrollLock.svelte.js';
	import { media } from '$lib/stores/mediaQuery.svelte.js';
	import quoteIconSrc from '$lib/assets/quote-icon.svg';
	import ScrollHint from '$lib/components/ui/ScrollHint.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { scrollHintAfterUnlock } from '$lib/utils/scrollHintAfterUnlock.js';
	import { fade } from 'svelte/transition';

	// Stati reattivi (Rune Svelte 5)
	let quizState = $state('choosing'); // 'choosing' | 'animating' | 'results'
	let textStep = $state(1);           // 1: Primo blocco di testo, 2: Citazione Adrian Yung
	/** Permette allo scroll di passare quando l'utente ha finito gli step e naviga via */
	let canLeave = $state(false);
	/** Flag di sicurezza per evitare input dello scroll durante le transizioni dei testi */
	let isAnimatingStep = $state(false);
	let showQuizScrollHint = $state(false);

	// L'Observer GSAP che intercetta i gesti durante il lock vive in quizAnimation.js
	// (regola progetto: tutto GSAP nelle actions); qui si decide solo QUANDO è attivo.
	// Solo desktop: il branch mobile ha un flusso e un gating propri in quizDragMobile.js.
	let observerEnabled = $derived(!media.isMobile && (quizState === 'animating' || quizState === 'results') && !canLeave);

	function advance() {
		if (quizState !== 'results' || isAnimatingStep) return;
		if (textStep === 1) {
			isAnimatingStep = true;
			animateQuizStep(2, { 
				onStepChange: () => { textStep = 2; },
				onComplete: () => { isAnimatingStep = false; }
			});
		} else if (textStep === 2) {
			// Gate aperto: si esce verso Performance con scroll morbido di Lenis
			showQuizScrollHint = false;
			canLeave = true;
			scrollTo('#performance');
		}
	}

	function back() {
		if (quizState !== 'results' || isAnimatingStep) return;
		if (textStep === 2) {
			isAnimatingStep = true;
			animateQuizStep(1, { 
				onStepChange: () => { textStep = 1; },
				onComplete: () => { isAnimatingStep = false; }
			});
		} else if (textStep === 1) {
			// Scroll up dalla prima scritta → sblocca così il pin si riavvolge verso l'intro
			canLeave = true;
		}
	}

	// Commento solo il PERCHÉ: il blocco scroll segue lo stato del quiz; canLeave apre il gate (uscita o ritorno
	// all'intro). L'Observer (in quizAnimation) segue lo stesso stato via param observerEnabled.
	// Stesso owner 'quiz' dell'action: acquire/release ripetuti sono idempotenti sul manager.
	// Il cleanup sblocca allo smontaggio: navigare via mentre observerEnabled è true lascerebbe
	// altrimenti Lenis stopped e la pagina successiva non scrollerebbe.
	$effect(() => {
		// Commento solo il PERCHÉ: su mobile il lock è gestito interamente da quizDragMobile,
		// quindi qui non interferiamo per non sovrapporre due sorgenti di blocco.
		if (media.isMobile) return;
		if (observerEnabled) {
			scrollLock.acquire('quiz', { mode: 'full' });
		} else {
			scrollLock.release('quiz');
		}
		return () => scrollLock.release('quiz');
	});

	// Commento solo il PERCHÉ: svela l'indicatore di scroll con un breve delay nel primo step dei risultati,
	// o immediatamente nello step finale che consente di uscire, facilitando la comprensione dello scrollytelling.
	$effect(() => {
		if (quizState === 'results') {
			if (textStep === 2) {
				showQuizScrollHint = true;
			} else {
				showQuizScrollHint = false;
				// L'util nasconde il cue definitivamente al primo vero scroll: col solo timeout,
				// su mobile restava sulla pagina anche dopo che l'utente aveva scrollato oltre.
				return scrollHintAfterUnlock((visible) => { showQuizScrollHint = visible; });
			}
		} else {
			showQuizScrollHint = false;
		}
	});

	// Nasconde il tooltip quando quizState cambia mentre il mouse è ancora nell'area
	$effect(() => { if (quizState !== 'choosing') tooltip.hide(); });
</script>

<!-- Titolo e citazione condivisi tra desktop e mobile: snippet per non duplicarne il markup -->
{#snippet titleBlock()}
	<div class="quiz-title-wrap">
		<h2 class="quiz-title">
			<span class="title-line">Quando tutto si decide in pochi istanti,<br> cosa pesa davvero di più?</span>
		</h2>
	</div>
{/snippet}

{#snippet quoteBlock()}
	<div class="quote-wrapper">
		<img src={quoteIconSrc} alt="" role="presentation" class="quote-icon" />
		<p class="quote-content">
			At this level, it’s probably 70% mental<br />
			and 30% physical.
		</p>
		<p class="quote-content">
			[...] I’ve had races where I was confident<br />
			and performed incredibly well, and<br />
			others where negativity took over<br />
			and everything fell apart. Learning to<br />
			control that is the real challenge.
		</p>
		<span class="quote-author">— Adrian Yung, sci alpino</span>
	</div>
{/snippet}

{#snippet mobileQuoteBlock()}
	<div class="quote-wrapper mobile-quote">
		<!-- Commento solo il PERCHÉ: icona citazione posizionata in alto e centrata per separare visivamente l'inizio della quote -->
		<img src={quoteIconSrc} alt="" role="presentation" class="quote-icon" />
		<p class="quote-text">
			At this level, it’s probably<br />
			<span class="quote-gradient-text">70% mental and 30% physical</span>.
		</p>
		<p class="quote-text">
			I’ve had races where [...]<br />
			negativity took over and<br />
			everything fell apart.<br />
			Learning to control that<br />
			is the real challenge.
		</p>
		<span class="quote-author">- Adrian Yung, sci alpino</span>
	</div>
{/snippet}

{#snippet scrollHint()}
	{#if showQuizScrollHint}
		<!-- Commento solo il PERCHÉ: svela il suggerimento di scroll per guidare l'utente nei blocchi dello scrollytelling -->
		<div class="scroll-hint-container" transition:fade={{ duration: 400 }}>
			<ScrollHint showText={false} />
		</div>
	{/if}
{/snippet}

{#if media.isMobile}
	<section
		id="cerchi-quiz"
		class="quiz-wrapper quiz-wrapper--mobile"
		aria-label="Quiz interattivo tra mente e fisico"
		use:quizDragMobile={{
			quizState,
			onStateChange: (s) => quizState = s
		}}
	>
		<!-- Schermata introduttiva centrata: la domanda precede il gioco e sfuma allo scroll -->
		<div class="quiz-intro">
			<p class="quiz-intro-lead">
				Quando tutto si decide<br>
				in pochi istanti...
			</p>
			<p class="quiz-intro-cta">Cosa pesa di più?</p>
		</div>

		<div class="quiz-split">
			<div class="zone zone-mentale">
				<span class="zone-pct">50%</span>
				<span class="zone-name">mentale</span>
			</div>
			<div class="zone zone-fisico">
				<span class="zone-pct">50%</span>
				<span class="zone-name">fisico</span>
			</div>

			<!-- Barra-maniglia a tutta larghezza: si trascina a step di 10, un tap conferma.
			     Dopo il primo drag "Trascina" lascia il posto a "Scopri" (toggle via .is-confirmable). -->
			<div class="split-handle">
				<Button ariaLabel="Trascina per bilanciare mentale e fisico, tocca per scoprire">
					<span class="handle-label">Trascina</span>
					<span class="handle-cta">Scopri</span>
				</Button>
			</div>
		</div>

		<!-- Solo la citazione, centrata, che sostituisce la schermata del drag alla conferma -->
		<div class="quote-panel">
			{@render mobileQuoteBlock()}
		</div>

		{@render scrollHint()}
	</section>
{:else}
	<section
		id="cerchi-quiz"
		class="quiz-wrapper"
		aria-label="Quiz interattivo tra mente e fisico"
		use:quizAnimation={{
			quizState,
			observerEnabled,
			onStateChange: (s) => quizState = s,
			onStepChange: (step) => textStep = step,
			onAdvance: advance,
			onBack: back,
			onEnterBack: () => {
				// ScrollTrigger ha rilevato che l'utente è tornato nella quiz section
				// scrollando verso l'alto dalla sezione successiva: riattiva il controllo scroll
				if (canLeave && quizState === 'results') canLeave = false;
			}
		}}
	>
		{@render titleBlock()}

		<div class="quiz-body">

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
					{@render quoteBlock()}
				</div>

			</div>
		</div>

		{@render scrollHint()}
	</section>
{/if}

<style>
	.quiz-wrapper {
		position: relative; /* Assicura il corretto posizionamento assoluto dell'indicatore */
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

	.interactive-circle-btn:not(:disabled):hover {
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
		/* Commento solo il PERCHÉ: il gradiente sta SEMPRE sotto il colore opaco (i gradienti non
		   sono interpolabili da transition); così al mouseleave transita solo `color` e non c'è il
		   flash del gradiente che spariva di scatto. L'animazione è ferma finché non si va in hover. */
		background-image: linear-gradient(
			120deg,
			var(--gradient-c1),
			var(--gradient-c2),
			var(--gradient-c3),
			var(--gradient-c1)
		);
		background-size: 200% auto;
		background-clip: text;
		transition: color 0.3s ease;
		animation: moveGradient 3s linear infinite;
		animation-play-state: paused;
	}

	.interactive-circle-btn:hover .animate-gradient-text {
		color: transparent;
		animation-play-state: running;
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

	/* Solo il bordo interno tra le due parti della citazione: gap del wrapper (--spacing-2)
	   + --spacing-2 = --spacing-4 visivo, deterministico invece dei margini UA dei <p> (che in
	   flex non collassano e gonfiavano la distanza). Icona→testo e testo→autore invariati. */
	.quote-content:has(+ .quote-content) {
		margin-bottom: 0;
	}

	.quote-content + .quote-content {
		margin-top: var(--spacing-2);
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

	.scroll-hint-container {
		position: absolute;
		bottom: var(--scroll-hint-bottom);
		left: 50%;
		transform: translateX(-50%);
		z-index: 100;
	}

	@media (max-width: 768px) {
		/* Variante mobile a schermo pieno: contenitore di posizionamento per intro, gioco e citazione,
		   tutti sovrapposti in assoluto e alternati via GSAP (opacity/transform). */
		.quiz-wrapper--mobile {
			height: 100vh;
			padding: 0;
		}

		/* Schermata introduttiva: la domanda centrata che precede il gioco e sfuma allo scroll */
		.quiz-intro {
			position: absolute;
			inset: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: var(--spacing-2);
			padding: var(--spacing-6);
			text-align: center;
			z-index: 5;
			/* Il gesto d'ingresso è intercettato dall'Observer su window: l'intro non deve mai
			   catturare pointer/touch, così anche da sfumata non blocca la maniglia sottostante. */
			pointer-events: none;
		}

		.quiz-intro-lead {
			/* Commento solo il PERCHÉ: aumenta il font size da text-s (18px) a text-m (20px) su mobile per maggior leggibilità */
			font-size: var(--text-l);
			color: var(--content-primary);
			line-height: 1.4;
		}

		.quiz-intro-cta {
			/* Commento solo il PERCHÉ: aumenta il font size da text-m (20px) a text-l (24px) su mobile per dare maggiore impatto alla cta */
			font-size: var(--text-xl);
			font-weight: var(--text-bold);
			color: var(--content-primary);
			margin-top: var(--spacing-2);
		}

		/* Barra che divide il viewport: le zone lo riempiono in assoluto con altezza/top in px
		   guidati da quizDragMobile (i valori % sono solo fallback pre-JS). */
		.quiz-split {
			position: absolute;
			inset: 0;
			width: 100%;
			overflow: hidden;
		}

		/* Commento solo il PERCHÉ: mentre la sezione è "presa" (quizDragMobile aggiunge is-engaged),
		   intro, gioco e citazione passano a position:fixed, allineati al viewport invece che allo
		   scroll del documento — elimina la dipendenza da uno scroll pixel-perfect (causa dell'ex-bug
		   di asimmetria mentale/fisico). Gli z-index espliciti servono perché con lo scroll congelato
		   fuori registro i sibling in flow (Preface pinnata col testo a z-index:1, Performance
		   successiva nel DOM) coprirebbero il viewport vincendo paint order E hit-testing sul layer
		   z-auto — era ciò che rendeva la maniglia intoccabile; l'ordine interno resta quello degli
		   stati non-engaged (intro sopra quote sopra split). La classe segue il ciclo di vita del
		   gioco: viene tolta a fine conferma o all'uscita dalla sosta, dopo una ri-sincronizzazione
		   dello scroll sul top della sezione che rende l'handoff fixed→absolute privo di salti.
		   inset:0 con fixed ricava width/height dal viewport reale, quindi si adatta da sé a
		   mostra/nascondi della barra URL mobile senza bisogno di 100dvh. */
		.quiz-wrapper--mobile:global(.is-engaged) .quiz-split {
			position: fixed;
			z-index: 10;
		}

		.quiz-wrapper--mobile:global(.is-engaged) .quote-panel {
			position: fixed;
			z-index: 11;
		}

		.quiz-wrapper--mobile:global(.is-engaged) .quiz-intro {
			position: fixed;
			z-index: 12;
		}

		.zone {
			position: absolute;
			left: 0;
			right: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: var(--spacing-1);
			text-align: center;
		}

		/* Commento solo il PERCHÉ: mentale è trasparente per lasciar trasparire il gradiente
		   persistente della home (continuità visiva); fisico ha invece un fill solido che lo copre.
		   Il fallback pre-JS è la POSA DI RIPOSO (confine sul bordo inferiore, fisico collassato
		   fuori vista): un 50/50 qui si intravedrebbe entrando nella sezione prima dell'ingresso. */
		.zone-mentale {
			top: 0;
			height: 100%;
			color: var(--content-primary);
		}

		.zone-fisico {
			top: 100%;
			bottom: 0;
			background-color: var(--background-primary);
			color: var(--content-primary);
		}

		.zone-name {
			font-size: var(--text-l);
			font-weight: var(--text-bold);
		}

		.zone-pct {
			font-size: var(--text-xl);
			font-weight: var(--text-bold);
			/* Larghezza stabile mentre i numeri scattano durante drag e reveal */
			font-variant-numeric: tabular-nums;
		}

		/* Maniglia: barra a tutta larghezza posizionata sul confine (transform-y via GSAP).
		   Height 0 + align-items center fa "cavalcare" il pulsante esattamente sulla linea. */
		.split-handle {
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			height: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 3;
			cursor: grab;
			/* Il gesto verticale appartiene al Draggable, non allo scroll della pagina */
			touch-action: none;
		}

		.split-handle::before {
			content: '';
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			/* Hairline sottilissima color sfondo: percettibile solo contro il gradiente di mentale,
			   si fonde col fill di fisico (stesso token) — linea "appena percettibile". */
			height: 1px;
			background-color: var(--background-primary);
		}

		.split-handle :global(.pill-button) {
			touch-action: none;
		}

		/* Dopo il primo rilascio la maniglia pulsa per segnalare che un tap conferma */
		.split-handle:global(.is-confirmable) :global(.pill-button) {
			animation: handlePulse 1.6s ease-in-out infinite;
		}

		@keyframes handlePulse {
			0%, 100% { transform: scale(1); }
			50% { transform: scale(1.06); }
		}

		/* Prima del drag la maniglia mostra "Trascina"; dopo il primo rilascio diventa "Scopri". */
		.handle-cta {
			display: none;
		}

		.split-handle:global(.is-confirmable) :global(.handle-label) {
			display: none;
		}

		.split-handle:global(.is-confirmable) :global(.handle-cta) {
			display: inline;
		}

		/* Dopo la prima conferma la label resta "Scopri" anche se la maniglia
		   rientra (retract/reset): il gesto di drag è ormai acquisito. */
		.split-handle:global(.has-confirmed) :global(.handle-label) {
			display: none;
		}

		.split-handle:global(.has-confirmed) :global(.handle-cta) {
			display: inline;
		}

		/* Solo la citazione, centrata, che sostituisce la schermata del drag alla conferma.
		   Altezza 100svh (non inset:0) in ENTRAMBI gli stati: da fixed l'inset seguirebbe la
		   viewport dinamica e da absolute la sezione 100vh (viewport lungo) — due centri diversi
		   che facevano "scattare" la citazione in basso al handoff fixed→absolute. Col riferimento
		   sempre svh il centro coincide a prescindere dalla barra URL. */
		.quote-panel {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 100svh;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: var(--spacing-6);
			opacity: 0;
			pointer-events: none;
			z-index: 4;
		}

		.quote-wrapper {
			align-items: center;
		}

		.quote-content {
			/* Commento solo il PERCHÉ: adatta la taglia del testo della citazione su mobile per migliorarne la leggibilità */
			font-size: var(--text-s);
			text-align: center;
		}

		/* --- Stili esclusivi della citazione mobile --- */
		.mobile-quote {
			display: flex;
			flex-direction: column;
			align-items: center;
			text-align: center;
			width: 100%;
			max-width: 90%;
			margin: 0 auto;
		}

		.mobile-quote .quote-icon {
			width: var(--spacing-7);
			height: auto;
			margin-bottom: var(--spacing-5);
			opacity: 0.85;
		}

		.mobile-quote .quote-text {
			font-family: var(--font-family-base, sans-serif);
			/* Commento solo il PERCHÉ: mantiene la dimensione del font uniforme per tutta la citazione, impostandola a text-m (20px su mobile) */
			font-size: var(--text-m);
			font-style: italic;
			font-weight: var(--text-regular);
			line-height: 1.5;
			color: var(--content-primary);
			margin: 0 0 var(--spacing-2) 0;
		}

		/* Tutte le distanze interne della quote sono equidistanti a spacing-4 visivo (32px,
		   come tra i paragrafi narrativi delle pagine archetipo): para→para = gap (s2) + s2,
		   para→autore = gap (s2) + margin-bottom (s2). Il primo paragrafo azzera il proprio
		   margine perché il bordo con il secondo è già coperto dal margin-top adiacente. */
		.mobile-quote .quote-text:has(+ .quote-text) {
			margin-bottom: 0;
		}

		.mobile-quote .quote-text + .quote-text {
			margin-top: var(--spacing-2);
		}

		.mobile-quote .quote-gradient-text {
			/* Commento solo il PERCHÉ: applica lo stesso gradiente animato continuo (blue-viola-arancio) usato per i testi principali del sito */
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
			-webkit-text-fill-color: transparent;
			color: transparent;
			display: inline-block;
			animation: moveGradient 3s linear infinite;
			font-weight: inherit;
		}

		.mobile-quote .quote-author {
			font-family: var(--font-family-base, sans-serif);
			font-size: var(--text-2xs);
			color: var(--neutral-600);
			margin: 0;
			opacity: 0.8;
		}
	}
</style>