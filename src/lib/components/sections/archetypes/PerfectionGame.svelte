<script>
	import { perfectionGameAction } from '$lib/actions/archetypes/perfectionGame.js';
	import { perfectionIntro } from '$lib/actions/archetypes/perfectionIntro.js';
	import { tooltip } from '$lib/stores/tooltipState.svelte.js';
	import ScrollHint from '$lib/components/ui/ScrollHint.svelte';
	import { scrollHintAfterUnlock } from '$lib/utils/scrollHintAfterUnlock.js';
	import { fade } from 'svelte/transition';

	// Svelte 5 Runes: la pallina parte già attiva e in movimento per default
	let isPlaying = $state(true);
	let attempts = $state(0);
	
	/** @type {number | null} */
	let accuracy = $state(null);

	// Riferimento al container nel DOM per attivare l'animazione al suo ingresso in viewport
	/** @type {HTMLElement | undefined} */
	let container = $state();

	const MAX_ATTEMPTS = 3;

	// Gestione del testo dinamico basata sulla runa $derived di Svelte 5
	const subtitleText = $derived(
		attempts === 0
			? "Cattura il centro perfetto."
			: attempts === 1
				? "Hai ancora due tentativi!"
				: attempts === 2
					? "Dai, l'ultima chance!"
					: "La perfezione è un'illusione."
	);

	// Tracciamento reattivo dello stato dell'intro e completamento per lo scroll lock
	let isIntroDone = $state(false);
	let hasCompletedOnce = $state(false);
	let showScrollHint = $state(false);

	$effect(() => {
		if (attempts > 0) {
			hasCompletedOnce = true;
		}
	});

	// Commento solo il PERCHÉ: svela l'indicatore con un delay dallo sblocco, ma lo nasconde
	// non appena l'utente inizia a scrollare; comportamento condiviso in scrollHintAfterUnlock.
	$effect(() => {
		if (hasCompletedOnce) {
			return scrollHintAfterUnlock((v) => (showScrollHint = v));
		}
		showScrollHint = false;
	});

	// Commento solo il PERCHÉ: il blocco scroll (giù bloccato finché l'utente non gioca un tentativo, su libero)
	// è ora interamente gestito dall'action perfectionIntro tramite lo store Lenis (lock direzionale in capture).

	/**
	 * Callback invocata dall'azione Svelte al variare dell'intro
	 * @param {boolean} val
	 */
	function handleIntroChange(val) {
		isIntroDone = val;
	}

	/**
	 * Callback invocata dall'azione Svelte in fase di reset
	 */
	function handleReset() {
		isIntroDone = false;
	}

	/**
	 * Gestisce l'avvio e l'arresto del gioco, aggiornando lo stato
	 * per innescare i comportamenti dell'azione Svelte GSAP.
	 */
	function toggleGame() {
		if (attempts >= MAX_ATTEMPTS) return;

		if (isPlaying) {
			isPlaying = false;
			// Commento solo il PERCHÉ: nasconde immediatamente il tooltip all'esecuzione del tentativo
			// per evitare che rimanga visibile sullo schermo dopo l'interazione.
			tooltip.hide();
		} else {
			accuracy = null;
			isPlaying = true;
		}
	}

	/**
	 * Riceve la coordinata finale registrata nel momento in cui il gioco si è interrotto (X su desktop, Y su mobile)
	 * e il raggio massimo di oscillazione usato dall'azione per quell'asse.
	 * Calcola e normalizza la precisione del tentativo.
	 *
	 * @param {number} finalValue La coordinata registrata dall'azione GSAP
	 * @param {number} maxRange Il raggio massimo di oscillazione (320px desktop, 140px mobile) usato dall'azione
	 */
	function handleStop(finalValue, maxRange) {
		attempts++;
		const distance = Math.abs(finalValue);

		// Calcola la percentuale normalizzata sul raggio massimo di oscillazione ricevuto dall'azione,
		// che è la stessa fonte (media.isMobile) usata per scegliere l'asse del tween: niente ricalcolo locale.
		let calcPerc = 100 - (distance / maxRange) * 100;

		// Il 100% di perfezione rimane volutamente inarrivabile, il tetto massimo è 99%
		accuracy = Math.max(1, Math.min(99, Math.round(calcPerc)));
	}

	/**
	 * Permette l'interazione tramite la barra spaziatrice
	 * @param {KeyboardEvent} event
	 */
	function handleKeydown(event) {
		if (event.code === 'Space') {
			event.preventDefault();
			toggleGame();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<section 
	class="perfection-container" 
	bind:this={container} 
	use:perfectionIntro={{ onIntroChange: handleIntroChange, onReset: handleReset, hasCompletedOnce }}
>
	
	<div class="header-text">
		<h2 class="title">Quanto è difficile<br class="mobile-only-br" /> la perfezione?</h2>
		<p class="subtitle" class:game-over-text={attempts >= MAX_ATTEMPTS}>{subtitleText}</p>
	</div>

	<!-- Commento solo il PERCHÉ: definisce una fascia orizzontale a tutta larghezza per attivare il tooltip 
	     esclusivamente all'altezza di movimento della palla, limitandola verticalmente a 400px -->
	<div 
		class="interaction-zone"
		role="presentation"
		onmouseenter={() => { if (attempts === 0) tooltip.show('Click o Spazio', 'semplice', 'crosshair'); }}
		onmouseleave={() => tooltip.hide()}
	>
		<!-- L'area di gioco si comporta come area interattiva principale -->
		<div 
			class="game-area" 
			onclick={toggleGame} 
			role="button" 
			tabindex="0" 
			aria-label="Avvia o ferma il gioco per misurare la precisione"
			onkeydown={(e) => e.key === 'Enter' && toggleGame()}
		>
		<svg class="target-circle" viewBox="0 0 320 320">
			<circle
				cx="160"
				cy="160"
				r="157.89"
				fill="none"
				stroke="var(--content-primary)"
				stroke-width="4"
				stroke-dasharray="0 12.4"
				stroke-linecap="round"
			/>
		</svg>

		<!-- 
			Delega l'animazione traslazionale e di scale all'azione GSAP.
			Lo stile inline è rimosso; viene manipolato direttamente dal motore GSAP
			con accelerazione hardware, evitando ricalcoli superflui in Svelte.
		-->
		<div 
			class="blob-wrapper"
			use:perfectionGameAction={{
				isPlaying: isPlaying,
				triggerElement: container,
				onStop: handleStop
			}}
		>
			<div 
				class="purple-blob" 
				class:stopped={!isPlaying}
				class:game-over={attempts >= MAX_ATTEMPTS}
			></div>
			{#if accuracy !== null}
				<span class="percentage">{accuracy}%</span>
			{/if}
		</div>
	</div>
</div>

	{#if showScrollHint}
		<!-- Commento solo il PERCHÉ: l'indicatore compare solo a gioco completato per segnalare lo sblocco dello scroll -->
		<div class="scroll-hint-container" transition:fade={{ duration: 400 }}>
			<ScrollHint showText={false} />
		</div>
	{/if}
</section>

<style>
	.perfection-container {
		position: relative; /* Assicura il posizionamento corretto dell'indicatore assoluto */
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh; /* Schermo intero immersivo per lo scrollytelling locking */
		background-color: transparent;
		user-select: none;
	}

	.header-text {
		text-align: center;
		margin-bottom: var(--spacing-4); /* Utilizza il token di spacing da 2rem / 32px */
	}

	.title {
		margin: var(--spacing-0);
	}

	.subtitle {
		font-family: var(--font-family-base);
		font-size: var(--text-s);
        /* Commento solo il PERCHÉ: allinea il testo descrittivo secondario al peso regular globale */
        font-weight: var(--text-regular);
		color: var(--neutral-500);
		margin-top: var(--spacing-2);
		margin-bottom: var(--spacing-0);
		transition: color 0.3s ease;
	}

	/* Applica lo stesso gradiente animato viola dell'Insoddisfatto per coerenza visiva premium */
	.subtitle.game-over-text {
		--gradient-c1: var(--viola-800);
		--gradient-c2: var(--viola-300);
		--gradient-c3: var(--viola-600);

		background: linear-gradient(
			120deg,
			var(--gradient-c1),
			var(--gradient-c2),
			var(--gradient-c3)
		);
		background-clip: text;
		color: var(--viola-600);
		-webkit-text-fill-color: transparent;
		background-size: 300% 100%;
		/* Commento solo il PERCHÉ: allinea il testo di game over con il peso bold globale */
		font-weight: var(--text-bold);
		animation: global-shift-gradient 8s linear infinite;
		display: inline-block;
		/* La transition su color ereditata da .subtitle repaint-a l'elemento proprio mentre si
		   attiva il clip-to-text: su GPU mobile il clip si perde a intermittenza e il gradiente
		   dipinge il suo intero box rettangolare (il "quadrato" al terzo tentativo). */
		transition: none;
	}

	.interaction-zone {
		width: 100%;
		max-width: 930px; /* Commento solo il PERCHÉ: limita la sensibilità all'oscillazione massima reale del blob (320px di corsa + raggio della palla) */
		height: var(--spacing-14);
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: crosshair; /* Commento solo il PERCHÉ: assicura che il cursore sia il mirino in tutta l'area di movimento della palla */
	}

	/* Rimuove il cursore di mira in tutta la zona se i tentativi sono esauriti */
	.interaction-zone:has(.game-over) {
		cursor: default;
	}

	.game-area {
		position: relative;
		width: var(--spacing-14); /* Utilizza il token da 25rem / 400px per l'area di gioco */
		height: var(--spacing-14);
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: crosshair; 
		outline: none;
	}

	.target-circle {
		position: absolute;
		/* 320px è l'80% di 400px (var(--spacing-14)) */
		width: calc(var(--spacing-14) * 0.8);
		height: calc(var(--spacing-14) * 0.8);
		z-index: 1;
		pointer-events: none;
	}

	.blob-wrapper {
		position: absolute;
		/* 290px è il 72.5% di 400px per mantenere un margine elegante dal cerchio di target */
		width: calc(var(--spacing-14) * 0.725);
		height: calc(var(--spacing-14) * 0.725);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 2;
		will-change: transform;
	}

	.purple-blob {
		position: absolute;
		width: 100%;
		height: 100%;
		background: radial-gradient(circle, var(--viola-500) 0%, var(--viola-800) 100%);
		border-radius: 50%;
		filter: blur(var(--spacing-3)); /* Utilizza il token --spacing-3 (1.5rem / 24px) per la sfocatura */
		opacity: 0.9;
		z-index: 1;
		/* Il layer del blur va promosso in anticipo: lo scatto di opacità a fine partita lo
		   creava/distruggeva al volo e su GPU mobile la rasterizzazione transitoria mostrava
		   i bordi quadrati del box sfocato. La transition rende comunque il cambio graduale. */
		will-change: filter, opacity;
		transition: opacity 0.3s ease;
	}

	.purple-blob.game-over {
		opacity: 0.7;
	}

	.percentage {
		position: relative;
		z-index: 2;
		font-family: var(--font-family-base);
		font-size: 5.5rem;
		/* Commento solo il PERCHÉ: allinea la percentuale di precisione del gioco con il peso extrabold globale */
		font-weight: var(--text-extrabold);
		color: color-mix(in srgb, var(--content-dark-primary) 90%, transparent);
		animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
	}

	@keyframes popIn {
		0% { transform: scale(0.5); opacity: 0; }
		100% { transform: scale(1); opacity: 1; }
	}

	.scroll-hint-container {
		position: absolute;
		bottom: var(--scroll-hint-bottom);
		left: 50%;
		transform: translateX(-50%);
		z-index: 100;
	}

	.mobile-only-br {
		display: none;
	}

	@media (max-width: 768px) {
		.mobile-only-br {
			display: block;
		}

		.purple-blob {
			/* --- TRUCCO ANTI-QUADRATO PER MOBILE --- */
			/* 1. Forza la GPU a ricalcolare i confini oltre il cerchio */
			transform: translate3d(0, 0, 0);

			/* 2. Estende l'area di rendering della sfocatura isolando l'elemento */
			isolation: isolate;

			/* 3. Evita che i sub-pixel arrotondati vengano clippati dal browser */
			-webkit-backface-visibility: hidden;
			backface-visibility: hidden;
		}

		.header-text {
			/* Sposta le scritte leggermente più in alto e riduce lo spazio rispetto all'area di gioco */
			margin-top: -50px;
			margin-bottom: var(--spacing-8);
		}

		.title {
			/* Commento solo il PERCHÉ: utilizza var(--text-xl) (36px) per mantenere il testo leggibile 
			   e imponente, spezzandolo su due righe bilanciate grazie al tag br */
			font-size: var(--text-xl);
			padding: 0 var(--spacing-4);
			line-height: 1.25;
		}

		.interaction-zone {
			/* Su mobile il moto è verticale, quindi aumentiamo l'altezza dell'area */
			height: 360px;
			width: 100%;
			flex-direction: column;
			margin-top: var(--spacing-3);
		}

		.game-area {
			width: 300px;
			height: 300px;
			flex-shrink: 0;
			aspect-ratio: 1 / 1;
		}

		.target-circle {
			/* Diminuita ulteriormente la dimensione del cerchio tratteggiato */
			width: 220px;
			height: 220px;
		}

		.blob-wrapper {
			/* Ridotta la dimensione base a 160px per evitare contatti o sovrapposizioni del blob con i testi descrittivi superiori */
			width: 160px;
			height: 160px;
			aspect-ratio: 1 / 1;
		}

		.percentage {
			font-size: 3rem;
		}
	}
</style>