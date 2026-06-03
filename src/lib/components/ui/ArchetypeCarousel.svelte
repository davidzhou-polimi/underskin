<script>
	import ArchetypeCard from '$lib/components/ui/ArchetypeCard.svelte';
	import { horizontalCarousel } from '$lib/actions/horizontalCarousel.js';
	// Definiamo i 3 archetipi statici con i rispettivi tipi e sorgenti video
	/**
	 * @type {Array<{
	 *   name: string,
	 *   type: 'favorito' | 'infortunato' | 'insoddisfatto',
	 *   videoSrc: string
	 * }>}
	 */
	const archetypes = [
		{ name: "Il favorito", type: "favorito", videoSrc: "/videos/favorito.mp4" },
		{ name: "L'infortunato", type: "infortunato", videoSrc: "/videos/infortunato.mp4" },
		{ name: "L'insoddisfatto", type: "insoddisfatto", videoSrc: "/videos/insoddisfatto.mp4" }
	];

	let activeIndex = $state(0);

	// ─── Navigation ───────────────────────────────────────────────────────────

	function next() {
		activeIndex = (activeIndex + 1) % archetypes.length;
	}

	function prev() {
		activeIndex = (activeIndex - 1 + archetypes.length) % archetypes.length;
	}

	/** @param {number} index */
	function selectIndex(index) {
		activeIndex = index;
	}

	// ─── Touch Events per Swipe ───────────────────────────────────────────────

	let touchStartX = 0;
	let touchStartY = 0;

	/** @param {TouchEvent} e */
	function handleTouchStart(e) {
		touchStartX = e.touches[0].clientX;
		touchStartY = e.touches[0].clientY;
	}

	/** @param {TouchEvent} e */
	function handleTouchEnd(e) {
		const dx = e.changedTouches[0].clientX - touchStartX;
		const dy = e.changedTouches[0].clientY - touchStartY;
		if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
			dx > 0 ? prev() : next();
		}
	}
</script>

<div
	class="archetype-carousel-container"
	role="region"
	aria-label="Archetype Showcase Carousel"
>
	<!-- Viewport che contiene la traccia scorrevole e ritaglia lo spazio orizzontale -->
	<div class="carousel-viewport">
		<div
			class="carousel-track"
			use:horizontalCarousel={{ activeIndex }}
			ontouchstart={handleTouchStart}
			ontouchend={handleTouchEnd}
			role="group"
			aria-label="Carousel Track"
		>
			{#each archetypes as archetype, i (archetype.name)}
				<div class="carousel-item">
					<ArchetypeCard
						name={archetype.name}
						videoSrc={archetype.videoSrc}
						type={archetype.type}
						isPlaying={i === activeIndex}
					/>
					<!-- Overlay invisibile cliccabile per selezionare le card non attive -->
					{#if i !== activeIndex}
						<button
							class="card-overlay"
							onclick={() => selectIndex(i)}
							aria-label="Visualizza {archetype.name}"
						></button>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- Dot Navigation: barra arrotondata con ombra e opacità al 40% -->
	<div class="dots-navigation-container">
		<div class="dots-pill">
			{#each archetypes as archetype, i}
				<button
					class="dot-button"
					class:active={i === activeIndex}
					onclick={() => selectIndex(i)}
					aria-label="Vai alla slide {i + 1}"
				></button>
			{/each}
		</div>
	</div>
</div>

<style>
	.archetype-carousel-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		overflow: visible;
		padding: var(--spacing-2) 0;
		outline: none;
	}

	.carousel-viewport {
		width: 100%;
		height: 520px;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: visible;
		position: relative;
	}

	.carousel-track {
		width: 100%;
		height: 100%;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: visible;
	}

	.carousel-item {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 357px;
		height: 461px;
		will-change: transform, opacity;
	}

	.card-overlay {
		position: absolute;
		inset: 0;
		z-index: 20;
		cursor: pointer;
		background: transparent;
		border: none;
		padding: 0;
		margin: 0;
	}

	/* DOTS NAVIGATION STYLES */
	.dots-navigation-container {
		margin-top: var(--spacing-6);
		z-index: 10;
	}

	.dots-pill {
		display: flex;
		gap: var(--spacing-2);
		/* Usiamo color-mix per applicare il 40% di opacità mantenendo la variabile del colore di sfondo */
		background-color: color-mix(in srgb, var(--background-primary) 40%, transparent);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		padding: var(--spacing-2) var(--spacing-4);
		border-radius: 9999px; /* rounded-full */
		box-shadow: 0px 4px 16px rgba(7, 30, 69, 0.08); /* shadow calibrata su toni scuri */
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.dot-button {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background-color: var(--neutral-400); /* token per dot non selezionato */
		border: none;
		padding: 0;
		cursor: pointer;
		transition: background-color 0.3s ease, transform 0.3s ease;
	}

	.dot-button:hover {
		background-color: var(--neutral-500);
	}

	.dot-button.active {
		background-color: var(--content-primary); /* token per dot selezionato */
		transform: scale(1.2);
	}
</style>
