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

	let activeIndex = $state(0);

	let filteredAthletes = $derived(
		/** @type {any} */ (athletesData.filter(athlete => athlete.type === type))
	);

	// ─── Navigation arc geometry ──────────────────────────────────────────────

	const NAV_HEIGHT = 120; // px

	// navWidth = full viewport width (SVG is positioned full-bleed via CSS transform)
	let navWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 800);

	$effect(() => {
		const onResize = () => { navWidth = window.innerWidth; };
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});

	// Arc path: big circle that exits the viewport on both sides
	const R_nav = $derived(navWidth * 0.694);
	const cx_nav = $derived(navWidth / 2);
	const cy_nav = $derived(NAV_HEIGHT * 0.17 + R_nav);

	// Upper semicircle: sweep=1 goes through the top of the circle (lower y values)
	const arcPath = $derived(
		`M ${cx_nav - R_nav},${cy_nav} A ${R_nav},${R_nav} 0 0 1 ${cx_nav + R_nav},${cy_nav}`
	);

	const svgViewBox = $derived(`0 0 ${navWidth} ${NAV_HEIGHT}`);

	// Spaziatura in gradi tra i dot lungo la circonferenza dell'arco
	const DOT_SPACING_ANGLE = 17.15;

	/**
	 * Position on the arc for a given angular diff (-1, 0, +1).
	 * @param {number} diff
	 */
	function getDotPos(diff) {
		const angle = diff * DOT_SPACING_ANGLE * (Math.PI / 180);
		return {
			x: cx_nav + R_nav * Math.sin(angle),
			y: cy_nav - R_nav * Math.cos(angle)
		};
	}

	// ─── Navigation ───────────────────────────────────────────────────────────

	function next() {
		activeIndex = (activeIndex + 1) % filteredAthletes.length;
	}

	function prev() {
		activeIndex = (activeIndex - 1 + filteredAthletes.length) % filteredAthletes.length;
	}

	/** @param {number} index */
	function selectIndex(index) {
		activeIndex = index;
	}

	// ─── Touch ────────────────────────────────────────────────────────────────

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
	class="carousel-container"
	role="region"
	aria-label="Athlete Showcase Carousel"
>
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
					isActive={i === activeIndex}
				/>
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

	<!-- Navigation: SVG uses full-bleed CSS transform so the arc exits the full section width -->
	<div class="carousel-navigation">
		<svg
			class="svg-track"
			viewBox={svgViewBox}
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<!-- Dotted arc path — equator points are off-screen, arc exits container on both sides -->
			<path
				d={arcPath}
				stroke="var(--content-primary)"
				stroke-width="2"
				stroke-linecap="round"
				stroke-dasharray="0.1 8"
				fill="none"
				opacity="0.7"
				style="pointer-events: none;"
			/>

			<!-- 3 static decorative dots — one under each visible card, on the arc -->
			{#each [-1, 0, 1] as diff}
				{@const pt = getDotPos(diff)}
				<circle
					cx={pt.x}
					cy={pt.y}
					r="6"
					fill="var(--content-primary)"
					style="pointer-events: none;"
				/>
			{/each}
		</svg>
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
		padding: var(--spacing-2) 0;
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
		overflow: hidden;
		margin-top: var(--spacing-1);
		position: relative;
		height: 120px;
	}

	.svg-track {
		/* Full-bleed: extends to full viewport width regardless of max-width container */
		display: block;
		width: 100vw;
		height: 120px;
		position: relative;
		left: 50%;
		transform: translateX(-50vw);
		overflow: visible;
	}
</style>
