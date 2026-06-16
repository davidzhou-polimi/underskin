<script>
	import AthleteCard from '$lib/components/ui/AthleteCard.svelte';
	import { carousel } from '$lib/actions/carousel.js';
	import athletesData from '$lib/data/athletes.json';
	import { gsap } from 'gsap';
	import { tooltip } from '$lib/stores/tooltipState.svelte.js';

	/**
	 * @type {{
	 *   type?: 'favorito' | 'infortunato' | 'insoddisfatto'
	 * }}
	 */
	let { type = 'favorito' } = $props();

	let activeIndex = $state(0);

	// Offset angolare in gradi animato da GSAP per far scorrere i pallini lungo l'arco
	let dotAngleOffset = $state(0);
	const dotTweenObj = { value: 0 };

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

	// ─── Navigation animation ─────────────────────────────────────────────────

	/**
	 * Anima i pallini lungo la curva dell'arco in sync con le card.
	 * direction: +1 = next, -1 = prev
	 * @param {number} direction
	 */
	function animateNav(direction) {
		dotTweenObj.value = direction * DOT_SPACING_ANGLE;
		dotAngleOffset = dotTweenObj.value;
		gsap.to(dotTweenObj, {
			value: 0,
			duration: 0.6,
			ease: 'power2.out',
			overwrite: true,
			onUpdate() {
				dotAngleOffset = dotTweenObj.value;
			},
			onComplete() {
				dotAngleOffset = 0;
				dotTweenObj.value = 0;
			}
		});
	}

	// ─── Auto-play ────────────────────────────────────────────────────────────

	/** @type {ReturnType<typeof setInterval> | null} */
	let autoPlayTimer = null;

	function startTimer() {
		if (autoPlayTimer) clearInterval(autoPlayTimer);
		autoPlayTimer = setInterval(() => {
			activeIndex = (activeIndex + 1) % filteredAthletes.length;
			animateNav(1);
		}, 5000);
	}

	$effect(() => {
		startTimer();
		return () => { if (autoPlayTimer) clearInterval(autoPlayTimer); };
	});

	// ─── Navigation ───────────────────────────────────────────────────────────

	function next() {
		activeIndex = (activeIndex + 1) % filteredAthletes.length;
		animateNav(1);
		startTimer();
	}

	function prev() {
		activeIndex = (activeIndex - 1 + filteredAthletes.length) % filteredAthletes.length;
		animateNav(-1);
		startTimer();
	}

	/** @param {number} index */
	function selectIndex(index) {
		let diff = index - activeIndex;
		if (diff > filteredAthletes.length / 2) diff -= filteredAthletes.length;
		else if (diff < -filteredAthletes.length / 2) diff += filteredAthletes.length;
		activeIndex = index;
		animateNav(diff > 0 ? 1 : -1);
		startTimer();
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

	// ─── Custom drag cursor (fullscreen, attivo solo quando la sezione è visibile) ──

	let sectionActive = $state(false);
	let isOverCard = $state(false);
	let isDragging = $state(false);
	let dragLastX = 0;
	const DRAG_THRESHOLD = 80;

	/** @type {HTMLElement | null} */
	let trackRef = $state(null);

	// IntersectionObserver + listener globali window attivi quando la sezione è centrata
	$effect(() => {
		if (!trackRef) return;

		const observer = new IntersectionObserver(
			([entry]) => { sectionActive = entry.isIntersecting; },
			{ rootMargin: '-15% 0px -15% 0px', threshold: 0 }
		);
		observer.observe(trackRef);

		/** @param {MouseEvent} e */
		function onMove(e) {
			const t = /** @type {Element} */ (e.target);
			isOverCard = t.closest?.('.athlete-card-container') !== null ||
			             t.closest?.('.card-overlay') !== null;
			if (sectionActive) {
				if (isOverCard) {
					tooltip.show('Click', 'semplice', 'pointer');
				} else {
					tooltip.show('← • →', 'semplice', 'none');
				}
			}
			if (isDragging && !isOverCard) {
				const delta = e.clientX - dragLastX;
				if (Math.abs(delta) > DRAG_THRESHOLD) {
					delta < 0 ? next() : prev();
					dragLastX = e.clientX;
				}
			}
		}

		/** @param {MouseEvent} e */
		function onDown(e) {
			if (isOverCard || !sectionActive) return;
			isDragging = true;
			dragLastX = e.clientX;
		}

		function onUp() { isDragging = false; }

		window.addEventListener('mousemove', onMove);
		window.addEventListener('mousedown', onDown);
		window.addEventListener('mouseup', onUp);

		return () => {
			observer.disconnect();
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mousedown', onDown);
			window.removeEventListener('mouseup', onUp);
			isDragging = false;
		};
	});

	$effect(() => {
		if (!sectionActive) {
			tooltip.hide();
			isDragging = false;
		}
		return () => tooltip.hide();
	});
</script>

<div
	class="carousel-container"
	role="region"
	aria-label="Athlete Showcase Carousel"
>
	<div
		class="carousel-track"
		bind:this={trackRef}
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

			<!-- Pallini che seguono la curva dell'arco animando l'offset angolare -->
			{#each [-1, 0, 1] as diff}
				{@const a = (diff * DOT_SPACING_ANGLE + dotAngleOffset) * (Math.PI / 180)}
				<circle
					cx={cx_nav + R_nav * Math.sin(a)}
					cy={cy_nav - R_nav * Math.cos(a)}
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

	/* Ripristina il cursore sulle card: il click cursor è gestito dal tooltip */
	:global(.athlete-card-container) {
		cursor: pointer;
	}

	.carousel-navigation {
		width: 100%;
		overflow: visible;
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
