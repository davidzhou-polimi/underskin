<script>
	import { perfectionGameAction } from '$lib/actions/archetypes/perfectionGame.js';
	import { perfectionIntro } from '$lib/actions/archetypes/perfectionIntro.js';
	import { tooltip } from '$lib/stores/tooltipState.svelte.js';

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

	$effect(() => {
		if (attempts > 0) {
			hasCompletedOnce = true;
		}
	});

	// Il blocco si attiva solo se l'intro è completata e l'utente non ha mai giocato
	const shouldLock = $derived(isIntroDone && !hasCompletedOnce);

	let hasLocked = false;
	let touchStart = 0;

	/**
	 * Blocca lo scorrimento verso il basso da tastiera/rotella
	 * @param {WheelEvent} event
	 */
	function preventScrollDown(event) {
		if (event.ctrlKey) return;
		if (event.deltaY > 0) {
			event.preventDefault();
		}
	}

	/**
	 * Registra l'inizio del tocco su touch screen
	 * @param {TouchEvent} event
	 */
	function handleTouchStart(event) {
		if (event.touches.length > 0) {
			touchStart = event.touches[0].clientY;
		}
	}

	/**
	 * Blocca i gesti touch verticali orientati verso il basso
	 * @param {TouchEvent} event
	 */
	function handleTouchMove(event) {
		if (event.touches.length > 1) return;
		if (event.touches.length > 0) {
			const touchCurrent = event.touches[0].clientY;
			const diffY = touchStart - touchCurrent;
			if (diffY > 0) {
				event.preventDefault();
			}
		}
	}

	/**
	 * Impedisce l'uso dei tasti di navigazione orientati verso il basso
	 * @param {KeyboardEvent} event
	 */
	function preventKeysDown(event) {
		const keysToBlock = ['ArrowDown', 'PageDown', 'End'];
		if (keysToBlock.includes(event.key)) {
			event.preventDefault();
		}
	}

	// Gestione dei listener dello scroll lock legati reattivamente a shouldLock
	$effect(() => {
		if (shouldLock) {
			window.addEventListener('wheel', preventScrollDown, { passive: false });
			window.addEventListener('touchstart', handleTouchStart, { passive: true });
			window.addEventListener('touchmove', handleTouchMove, { passive: false });
			window.addEventListener('keydown', preventKeysDown, { passive: false });

			// Allinea lo schermo al centro della sezione solo una volta all'avvio del blocco
			if (!hasLocked && container) {
				hasLocked = true;
				container.scrollIntoView({ behavior: 'smooth' });
			}
		} else {
			window.removeEventListener('wheel', preventScrollDown);
			window.removeEventListener('touchstart', handleTouchStart);
			window.removeEventListener('touchmove', handleTouchMove);
			window.removeEventListener('keydown', preventKeysDown);
			hasLocked = false;
		}

		return () => {
			window.removeEventListener('wheel', preventScrollDown);
			window.removeEventListener('touchstart', handleTouchStart);
			window.removeEventListener('touchmove', handleTouchMove);
			window.removeEventListener('keydown', preventKeysDown);
		};
	});

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

<section class="perfection-container" bind:this={container} use:perfectionIntro={{ onIntroChange: handleIntroChange, onReset: handleReset }}>
	
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
		onmouseenter={() => { if (attempts === 0) tooltip.show('Click o Spazio', 'semplice'); }}
		onmouseleave={() => tooltip.hide()}
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


</section>

<style>
	.perfection-container {
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
</style>