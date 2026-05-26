<script>
	import { perfectionGameAction } from '$lib/actions/perfectionGame.js';

	// Svelte 5 Runes per la gestione dello stato locale reattivo
	let isPlaying = $state(false);
	let attempts = $state(0);
	
	/** @type {number | null} */
	let accuracy = $state(null);

	// Riferimento al container nel DOM per agganciare in modo sicuro lo ScrollTrigger
	/** @type {HTMLElement | undefined} */
	let container = $state();

	const MAX_ATTEMPTS = 3;

	/**
	 * Gestisce l'avvio e l'arresto del gioco, aggiornando lo stato
	 * per innescare i comportamenti dell'azione Svelte GSAP.
	 */
	function toggleGame() {
		// Impedisce interazioni se si è raggiunto il numero massimo di tentativi
		if (attempts >= MAX_ATTEMPTS) return;

		if (isPlaying) {
			// Cambiare lo stato in false interrompe l'oscillazione nell'action GSAP,
			// la quale restituirà la coordinata X finale tramite la callback handleStop.
			isPlaying = false;
		} else {
			// Resetta la precisione precedente e fa ripartire l'oscillazione
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
	 * Permette l'interazione tramite la barra spaziatrice per massima accessibilità
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

<section class="perfection-container" bind:this={container}>
	
	<div class="header-text">
		<h2 class="title">Quanto è difficile la perfezione?</h2>
	</div>

	<!-- L'area di gioco si comporta come area interattiva principale -->
	<div 
		class="game-area" 
		onclick={toggleGame} 
		role="button" 
		tabindex="0" 
		aria-label="Avvia o ferma il gioco per misurare la precisione"
		onkeydown={(e) => e.key === 'Enter' && toggleGame()}
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

</section>

<style>
	.perfection-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 50rem; /* Equivale a 800px (16px base) per garantire ampio spazio di gioco */
		background-color: var(--background-primary);
		user-select: none;
	}

	.header-text {
		text-align: center;
		margin-bottom: var(--spacing-4); /* Utilizza il token di spacing da 2rem / 32px */
	}

	.title {
		font-family: var(--font-family-base);
		font-size: var(--text-l); /* Utilizza il token di testo grande da 2.5rem / 40px */
		font-weight: 600;
		color: var(--content-primary);
		margin: var(--spacing-0);
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
		font-size: var(--text-xl); /* Utilizza il token tipografico --text-xl (3.5rem / 56px) */
		font-weight: 800;
		color: var(--background-primary);
		animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
	}

	@keyframes popIn {
		0% { transform: scale(0.5); opacity: 0; }
		100% { transform: scale(1); opacity: 1; }
	}
</style>