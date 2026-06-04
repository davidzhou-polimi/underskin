<script>
	import ArchetypeCard from '$lib/components/ui/ArchetypeCard.svelte';
	import { horizontalCarousel } from '$lib/actions/horizontalCarousel.js';
	import { autoplay } from '$lib/actions/autoplay.js';
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
	let isHovered = $state(false);

	// ─── Navigation ───────────────────────────────────────────────────────────

	function next() {
		activeIndex = (activeIndex + 1) % archetypes.length;
		isHovered = false;
	}

	function prev() {
		activeIndex = (activeIndex - 1 + archetypes.length) % archetypes.length;
		isHovered = false;
	}

	/** @param {number} index */
	function selectIndex(index) {
		activeIndex = index;
		isHovered = false;
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
				<div
					class="carousel-item"
					role="group"
					aria-roledescription="card"
					onmouseenter={i === activeIndex ? () => { isHovered = true; } : null}
					onmouseleave={i === activeIndex ? () => { isHovered = false; } : null}
				>
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
		<div class="glass-effect dots-pill">
			{#each archetypes as archetype, i}
				<button
					class="dot-button"
					class:active={i === activeIndex}
					onclick={() => selectIndex(i)}
					aria-label="Vai alla card {i + 1}"
				>
					{#if i === activeIndex}
						<span
							class="dot-progress"
							use:autoplay={{ duration: 3.5, paused: isHovered, onComplete: next }}
						></span>
					{/if}
				</button>
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
		padding: var(--spacing-2) var(--spacing-4);
		border-radius: 9999px; /* rounded-full */
	}

	.dot-button {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background-color: var(--neutral-400); /* token per dot non selezionato */
		border: none;
		padding: 0;
		cursor: pointer;
		position: relative;
		overflow: hidden;
		transition: background-color var(--transition-duration-normal) var(--easing-standard),
			width var(--transition-duration-normal) var(--easing-standard),
			border-radius var(--transition-duration-normal) var(--easing-standard);
	}

	.dot-button:hover {
		background-color: var(--neutral-500);
	}

	.dot-button.active {
		/* Trasformiamo il dot attivo in una pillola allungata per visualizzare il progresso temporale */
		width: 40px;
		border-radius: 9999px;
		background-color: color-mix(in srgb, var(--content-primary) 20%, transparent);
	}

	.dot-progress {
		position: absolute;
		left: 0;
		top: 0;
		height: 100%;
		width: 0%;
		border-radius: 9999px;
		background-color: var(--content-primary); /* token per dot selezionato */
		pointer-events: none;
	}
</style>
