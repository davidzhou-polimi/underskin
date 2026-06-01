<script>
	import { perfectionGameAction } from '$lib/actions/insoddisfatto/perfectionGame.js';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import { onMount, onDestroy } from 'svelte';
	import CursorTooltip from '$lib/components/ui/CursorTooltip.svelte';

	if (typeof window !== 'undefined') {
		gsap.registerPlugin(ScrollTrigger);
	}

	// Svelte 5 Runes: la pallina parte già attiva e in movimento per default
	let isPlaying = $state(true);
	let attempts = $state(0);
	let isScrollLocked = $state(false);
	
	/** @type {number | null} */
	let accuracy = $state(null);

	// Riferimento al container nel DOM per agganciare ScrollTrigger e gestire l'allineamento
	/** @type {HTMLElement | undefined} */
	let container = $state();

	const MAX_ATTEMPTS = 3;

	let mouseX = $state(0);
	let mouseY = $state(0);
	let isHovering = $state(false);

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

	/**
	 * Traccia la posizione del cursore rispetto alla viewport
	 * per allineare il tooltip personalizzato
	 * @param {MouseEvent} event
	 */
	function handleMouseMove(event) {
		mouseX = event.clientX;
		mouseY = event.clientY;
	}

	/** @type {ScrollTrigger | null} */
	let scrollTriggerInstance = null;

	onMount(() => {
		if (container) {
			// Rileva quando la sezione raggiunge la sommità dello schermo per agganciare il blocco
			scrollTriggerInstance = ScrollTrigger.create({
				trigger: container,
				start: 'top top',
				onEnter: () => {
					if (attempts === 0) {
						// Centra a schermo intero in modo morbido e attiva il lock
						container?.scrollIntoView({ behavior: 'smooth' });
						isScrollLocked = true;
					}
				}
			});
		}
	});

	onDestroy(() => {
		if (scrollTriggerInstance) {
			scrollTriggerInstance.kill();
		}
	});

	// Rimuove o applica i listener di blocco dello scroll in base allo stato del gioco
	$effect(() => {
		if (isScrollLocked && attempts === 0) {
			/** @param {any} e */
			const preventDefault = (e) => {
				// Consente il pinch-to-zoom su trackpad (ctrlKey: true)
				if (e.ctrlKey) return;

				// Consente lo zoom multitouch su dispositivi mobile
				if (e.touches && e.touches.length > 1) return;

				e.preventDefault();
			};

			window.addEventListener('wheel', preventDefault, { passive: false });
			window.addEventListener('touchmove', preventDefault, { passive: false });

			return () => {
				window.removeEventListener('wheel', preventDefault);
				window.removeEventListener('touchmove', preventDefault);
			};
		}
	});

	/**
	 * Gestisce l'avvio e l'arresto del gioco, aggiornando lo stato
	 * per innescare i comportamenti dell'azione Svelte GSAP.
	 */
	function toggleGame() {
		if (attempts >= MAX_ATTEMPTS) return;

		if (isPlaying) {
			isPlaying = false;
			// Il primo tentativo sblocca istantaneamente lo scroll consentendo all'utente di proseguire
			isScrollLocked = false;
		} else {
			accuracy = null;
			isPlaying = true;
		}
	}

	/**
	 * Riceve la X finale registrata nel momento in cui il gioco si è interrotto.
	 * Calcola e normalizza la precisione del tentativo.
	 * 
	 * @param {number} finalX La coordinata X registrata dall'azione GSAP
	 */
	function handleStop(finalX) {
		attempts++;
		const distance = Math.abs(finalX);
		
		// Calcola la percentuale normalizzata sul raggio massimo di oscillazione (320px)
		let calcPerc = 100 - (distance / 320) * 100;

		// Il 100% di perfezione rimane volutamente inarrivabile, il tetto massimo è 99%
		accuracy = Math.max(1, Math.min(99, Math.round(calcPerc)));
	}

	/**
	 * Permette l'interazione tramite la barra spaziatrice e previene lo scroll da tastiera se bloccato
	 * @param {KeyboardEvent} event
	 */
	function handleKeydown(event) {
		const keysToBlock = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'];
		if (isScrollLocked && attempts === 0 && keysToBlock.includes(event.code)) {
			event.preventDefault();
			return;
		}

		if (event.code === 'Space') {
			event.preventDefault();
			toggleGame();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<section class="perfection-container" bind:this={container}>
	
	<div class="header-text">
		<h2 class="title">Quanto è difficile la perfezione?</h2>
		<p class="subtitle" class:game-over-text={attempts >= MAX_ATTEMPTS}>{subtitleText}</p>
	</div>

	<!-- L'area di gioco si comporta come area interattiva principale -->
	<div 
		class="game-area" 
		onclick={toggleGame} 
		role="button" 
		tabindex="0" 
		aria-label="Avvia o ferma il gioco per misurare la precisione"
		onkeydown={(e) => e.key === 'Enter' && toggleGame()}
		onmousemove={handleMouseMove}
		onmouseenter={() => isHovering = true}
		onmouseleave={() => isHovering = false}
	>
		<div class="target-circle"></div>

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

	{#if isHovering && attempts === 0}
		<CursorTooltip 
			visible={true} 
			text="click o spazio"
			type="semplice"
			x={mouseX} 
			y={mouseY} 
		/>
	{/if}

</section>

<style>
	.perfection-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh; /* Schermo intero immersivo per lo scrollytelling locking */
		background-color: var(--background-primary);
		user-select: none;
	}

	.header-text {
		text-align: center;
		margin-bottom: var(--spacing-4); /* Utilizza il token di spacing da 2rem / 32px */
	}

	.title {
		font-family: var(--font-family-base);
		font-size: var(--text-xl); /* Utilizza il token di testo grande da 3.5rem / 56px */
		font-weight: 700;
		color: var(--content-primary);
		margin: var(--spacing-0);
	}

	.subtitle {
		font-family: var(--font-family-base);
		font-size: var(--text-s);
        font-weight: 400;
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
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		background-size: 300% 100%;
		font-weight: 700;
		animation: global-shift-gradient 8s linear infinite;
		display: inline-block;
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

	/* Rimuove il cursore di mira se i tentativi sono esauriti */
	.game-area:has(.game-over) {
		cursor: default;
	}

	.target-circle {
		position: absolute;
		/* 320px è l'80% di 400px (var(--spacing-14)) */
		width: calc(var(--spacing-14) * 0.8);
		height: calc(var(--spacing-14) * 0.8);
		border: 2px dashed var(--content-primary);
		border-radius: 50%;
		opacity: 0.5;
		z-index: 1;
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
	}

	.purple-blob.game-over {
		opacity: 0.7;
	}

	.percentage {
		position: relative;
		z-index: 2;
		font-family: var(--font-family-base);
		font-size: 5.5rem; /* Utilizza il token tipografico --text-xl (3.5rem / 56px) */
		font-weight: 800;
		color: var(--background-primary);
		animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
	}

	@keyframes popIn {
		0% { transform: scale(0.5); opacity: 0; }
		100% { transform: scale(1); opacity: 1; }
	}
</style>