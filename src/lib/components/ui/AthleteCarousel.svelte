<script>
	import AthleteCard from '$lib/components/ui/AthleteCard.svelte';
	import { carousel } from '$lib/actions/carousel.js';
	import athletesData from '$lib/data/athletes.json';

	/**
	 * @type {{
	 *   type?: 'favorito' | 'infortunato' | 'insoddisfatto'
	 * }}
	 */
	let { type = 'favorito' } = $props();

	// Reactive state tracking the current active card index
	let activeIndex = $state(0);

	// Derived array containing only athletes matching the selected archetype
	let filteredAthletes = $derived(
		/** @type {any} */ (athletesData.filter(athlete => athlete.type === type))
	);

	// Bezier control points to match the GSAP active dot path positioning
	const p0 = { x: 100, y: 80 };
	const p1 = { x: 500, y: 10 };
	const p2 = { x: 900, y: 80 };

	/**
	 * Calculates the position along a quadratic Bezier curve
	 * @param {number} index - The current item index
	 * @param {number} total - Total items in the list
	 */
	function getDotCoordinates(index, total) {
		const t = total > 1 ? index / (total - 1) : 0.5;
		const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
		const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
		return { x, y };
	}

	function next() {
		if (activeIndex < filteredAthletes.length - 1) {
			activeIndex += 1;
		}
	}

	function prev() {
		if (activeIndex > 0) {
			activeIndex -= 1;
		}
	}

	/**
	 * Focuses a clicked card
	 * @param {number} index - Target index
	 */
	function selectIndex(index) {
		activeIndex = index;
	}

	// Gesture variables for touch support
	let touchStartX = 0;
	let touchStartY = 0;

	/** @param {TouchEvent} e */
	function handleTouchStart(e) {
		touchStartX = e.touches[0].clientX;
		touchStartY = e.touches[0].clientY;
	}

	/** @param {TouchEvent} e */
	function handleTouchEnd(e) {
		const touchEndX = e.changedTouches[0].clientX;
		const touchEndY = e.changedTouches[0].clientY;
		const diffX = touchEndX - touchStartX;
		const diffY = touchEndY - touchStartY;

		// Detect swipe only if horizontal movement is dominant
		if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
			if (diffX > 0) {
				prev();
			} else {
				next();
			}
		}
	}

	/** @param {KeyboardEvent} e */
	function handleKeyDown(e) {
		if (e.key === 'ArrowLeft') {
			prev();
		} else if (e.key === 'ArrowRight') {
			next();
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<!-- The carousel component handles navigation and swipe tracking -->
<div 
	class="carousel-container" 
	role="region" 
	aria-label="Athlete Showcase Carousel" 
>
	<!-- Track using the GSAP carousel Svelte action -->
	<div 
		class="carousel-track" 
		use:carousel={{ activeIndex, itemsCount: filteredAthletes.length }}
		ontouchstart={handleTouchStart}
		ontouchend={handleTouchEnd}
		role="group"
		aria-label="Carousel Track"
	>
		{#each filteredAthletes as athlete, i (athlete.name)}
			<div class="carousel-item">
				<AthleteCard 
					name={athlete.name}
					imageSrc={athlete.imageSrc}
					context={athlete.context}
					quote={athlete.quote}
					type={athlete.type}
					number={"0" + (i + 1)}
				/>
				<!-- Overlay intercepts click on side items to change slide without flipping -->
				{#if i !== activeIndex}
					<button 
						class="card-overlay" 
						onclick={() => selectIndex(i)} 
						aria-label="View athlete {athlete.name}" 
					></button>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Navigation Bar containing dots along the SVG Bezier curve and arrows -->
	<div class="carousel-navigation">
		<button 
			class="nav-btn prev-btn" 
			onclick={prev} 
			aria-label="Previous athlete" 
			disabled={activeIndex === 0}
		>
			<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M15 18l-6-6 6-6" />
			</svg>
		</button>
		
		<div class="svg-track-container">
			<svg class="svg-track" viewBox="0 0 1000 100" preserveAspectRatio="none">
				<!-- Dotted curve path -->
				<path 
					d="M 100,80 Q 500,10 900,80" 
					stroke="var(--background-primary)" 
					stroke-width="2" 
					stroke-linecap="round" 
					stroke-dasharray="0.1 8" 
					fill="none" 
					opacity="0.3"
				/>
				<!-- Clickable static indicator circles on the path -->
				{#each filteredAthletes as _, i}
					{@const pt = getDotCoordinates(i, filteredAthletes.length)}
					<circle 
						cx={pt.x} 
						cy={pt.y} 
						r="6" 
						fill="var(--background-primary)" 
						opacity={i === activeIndex ? 1 : 0.4} 
						class="track-dot"
						role="button"
						tabindex="0"
						aria-label="Go to athlete {i + 1}"
						onclick={() => selectIndex(i)}
						onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectIndex(i); }}
					/>
				{/each}
				<!-- Active GSAP-driven pointer circle -->
				<circle 
					class="active-dot" 
					r="8" 
					fill="var(--background-primary)" 
				/>
			</svg>
		</div>

		<button 
			class="nav-btn next-btn" 
			onclick={next} 
			aria-label="Next athlete" 
			disabled={activeIndex === filteredAthletes.length - 1}
		>
			<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M9 5l6 6-6 6" />
			</svg>
		</button>
	</div>
</div>

<style>
	.carousel-container {
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		overflow: visible;
		padding: var(--spacing-4) 0;
		outline: none;
	}

	.carousel-track {
		width: 100%;
		height: 520px;
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

	.carousel-navigation {
		width: 100%;
		max-width: 800px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: var(--spacing-4);
		gap: var(--spacing-4);
	}

	.svg-track-container {
		flex: 1;
		height: 80px;
		position: relative;
	}

	.svg-track {
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	.track-dot {
		cursor: pointer;
		transition: opacity 0.3s ease, r 0.3s ease;
	}

	.track-dot:hover {
		opacity: 0.8;
		r: 8px;
	}

	.nav-btn {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--background-primary);
		cursor: pointer;
		transition: background 0.3s ease, transform 0.2s ease;
	}

	.nav-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.25);
		transform: scale(1.1);
	}

	.nav-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}
</style>
