<script>
	import AthleteCard from '$lib/components/ui/AthleteCard.svelte';
	import { carousel } from '$lib/actions/carousel.js';
	import { carouselDots } from '$lib/actions/carouselDots.js';
	import athletesData from '$lib/data/athletes.json';
	import { tooltip } from '$lib/stores/tooltipState.svelte.js';
	import { gsap } from 'gsap';
	import { onMount } from 'svelte';

	/**
	 * @type {{
	 *   type?: 'favorito' | 'infortunato' | 'insoddisfatto'
	 * }}
	 */
	let { type = 'favorito' } = $props();

	const PLURAL_TYPES = {
		favorito: 'favoriti',
		infortunato: 'infortunati',
		insoddisfatto: 'insoddisfatti'
	};

	let displayedIndex = $state(0);
	let targetIndex = $state(0);
	let isFlipped = $state(false);
	/** @type {number | null} */
	let hoveredIndex = $state(null);
	let isDragging = $state(false);

	let dragVelocity = 0;
	let lastDragTime = 0;
	let lastDragIndex = 0;
	let inertiaVelocity = $state(0);

	let filteredAthletes = $derived(
		/** @type {any} */ (athletesData.filter(athlete => athlete.type === type))
	);

	// Derived active index based on rounded displayed index
	const activeIndex = $derived(
		filteredAthletes.length > 0
			? ((Math.round(displayedIndex) % filteredAthletes.length) + filteredAthletes.length) % filteredAthletes.length
			: 0
	);

	const isMoving = $derived(
		isDragging || inertiaVelocity !== 0 || Math.abs(displayedIndex - targetIndex) > 0.001
	);

	// Reset flip state when user slides to another athlete
	$effect(() => {
		if (activeIndex !== undefined) {
			isFlipped = false;
		}
	});

	// Stato per tracciare se il mouse è posizionato all'interno della zona di drag
	let isMouseOverDragZone = $state(false);

	// Commento solo il PERCHÉ: azzeriamo l'hover al movimento del carosello, ma nascondiamo il tooltip solo se non siamo nella dragzone e non stiamo trascinando
	$effect(() => {
		if (isMoving) {
			hoveredIndex = null;
			if (!isDragging && !isMouseOverDragZone) {
				tooltip.hide();
			}
		}
	});

	// ─── Autoplay ─────────────────────────────────────────────────────────────

	/* Sincronizzato con l'intervallo di 3.5s di TeamCarousel per coerenza visiva globale */
	const AUTOPLAY_INTERVAL = 3500; // ms

	/** @type {gsap.core.Tween | null} */
	let autoplayTween = null;

	// Max speed of carousel movement (index units per frame)
	const MAX_VELOCITY = 0.08;

	onMount(() => {
		// GSAP sospende i tween basati su rAF quando la tab va in background,
		// riprendendo esattamente dal punto di pausa al ritorno — nessun tick accumulato.
		autoplayTween = gsap.to({}, {
			duration: AUTOPLAY_INTERVAL / 1000,
			repeat: -1,
			ease: 'none',
			onRepeat: () => next()
		});

		// Interpolation loop to smoothly move displayedIndex to targetIndex with max velocity capping
		const tickHandler = () => {
			const len = filteredAthletes.length;
			
			if (isDragging) {
				// State 1: Active dragging. displayedIndex follows targetIndex (mouse) responsively
				let diff = targetIndex - displayedIndex;
				if (len > 0) {
					const halfLen = len / 2;
					if (diff > halfLen) {
						displayedIndex += len;
						diff -= len;
					} else if (diff < -halfLen) {
						displayedIndex -= len;
						diff += len;
					}
				}

				// Use a responsive lerp factor to follow mouse direction changes instantly
				displayedIndex += diff * 0.35;
			} else if (Math.abs(inertiaVelocity) > 0.005) {
				// State 2: Inertia coasting. Slide index based on release velocity with decay/friction
				displayedIndex += inertiaVelocity;
				inertiaVelocity *= 0.65; // decay friction

				if (len > 0) {
					displayedIndex = ((displayedIndex % len) + len) % len;
				}

				// Synchronize targetIndex during slide to avoid jumps when slide ends
				targetIndex = displayedIndex;
			} else {
				// State 3: Settling / Static state. Snap targetIndex to nearest card using GSAP settling transition
				if (inertiaVelocity !== 0) {
					inertiaVelocity = 0;
					const snapTarget = wrapIndex(Math.round(displayedIndex), len);
					navigateTo(snapTarget);
				}
			}
		};

		gsap.ticker.add(tickHandler);

		return () => {
			autoplayTween?.kill();
			gsap.ticker.remove(tickHandler);
		};
	});

	// Pausa/ripresa del tween in base all'hover e drag
	$effect(() => {
		if (!autoplayTween) return;
		if (hoveredIndex !== null || isDragging) {
			autoplayTween.pause();
		} else {
			autoplayTween.play();
		}
	});

	// Reset del timer solo in caso di navigazione manuale (click dot / frecce)
	$effect(() => {
		// Registriamo activeIndex come dipendenza reattiva
		// eslint-disable-next-line no-unused-expressions
		activeIndex;
		if (autoplayTween && !isDragging) {
			autoplayTween.restart();
			// Se l'utente naviga manualmente mentre è in hover, teniamo la pausa
			if (hoveredIndex !== null) autoplayTween.pause();
		}
	});



	// ─── Navigation arc geometry ──────────────────────────────────────────────

	const NAV_HEIGHT = 120; // px

	// navWidth = full viewport width (SVG is positioned full-bleed via CSS transform)
	let navWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 800);
	// We bind to the container width to match the card positioning radius exactly
	let containerWidth = $state(800);

	$effect(() => {
		const onResize = () => { navWidth = window.innerWidth; };
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});

	// The arc radius for navigation dots must match the cards' rotation radius for horizontal alignment
	const R_card = $derived(containerWidth * (containerWidth < 768 ? 0.8 : 1.4));
	// Subtracting the vertical offset between card centers and dots to align their circle centers
	const R_nav = $derived(Math.max(80, R_card - 288));
	const cx_nav = $derived(navWidth / 2);
	const cy_nav = $derived(NAV_HEIGHT * 0.17 + R_nav);

	// Upper semicircle: sweep=1 goes through the top of the circle (lower y values)
	const arcPath = $derived(
		`M ${cx_nav - R_nav},${cy_nav} A ${R_nav},${R_nav} 0 0 1 ${cx_nav + R_nav},${cy_nav}`
	);

	// Tracciato che delimita l'intera area interattiva sottostante l'arco per consentire il drag,
	// con un gap di 20px rispetto all'arco per separare visivamente e funzionalmente i controlli.
	const dragZonePath = $derived(
		`M ${cx_nav - R_nav},${cy_nav + 20} ` +
		`A ${R_nav},${R_nav} 0 0 1 ${cx_nav + R_nav},${cy_nav + 20} ` +
		`L ${navWidth},400 ` +
		`L 0,400 Z`
	);

	const svgViewBox = $derived(`0 0 ${navWidth} ${NAV_HEIGHT}`);

	/** @type {gsap.core.Tween | null} */
	let navigationTween = null;

	/**
	 * Helper to handle negative modulo correctly
	 * @param {number} val
	 * @param {number} max
	 */
	function wrapIndex(val, max) {
		return ((val % max) + max) % max;
	}

	/** @param {number} target */
	function navigateTo(target) {
		if (autoplayTween) autoplayTween.pause();

		const len = filteredAthletes.length;
		if (len === 0) return;

		// Commento solo il PERCHÉ: allineiamo gli indici sul percorso circolare più breve per evitare rotazioni inverse complete
		let diff = target - displayedIndex;
		const halfLen = len / 2;
		if (diff > halfLen) {
			displayedIndex += len;
		} else if (diff < -halfLen) {
			displayedIndex -= len;
		}

		navigationTween?.kill();

		const proxy = { val: displayedIndex };
		navigationTween = gsap.to(proxy, {
			val: target,
			duration: 0.6,
			ease: 'power2.out',
			onUpdate: () => {
				displayedIndex = proxy.val;
			},
			onComplete: () => {
				displayedIndex = wrapIndex(displayedIndex, len);
				targetIndex = displayedIndex;
				navigationTween = null;
				if (autoplayTween && hoveredIndex === null) {
					autoplayTween.play();
				}
			}
		});
	}

	// ─── Navigation ───────────────────────────────────────────────────────────

	function next() {
		navigateTo(wrapIndex(targetIndex + 1, filteredAthletes.length));
	}

	function prev() {
		navigateTo(wrapIndex(targetIndex - 1, filteredAthletes.length));
	}

	/** @param {number} index */
	function selectIndex(index) {
		navigateTo(index);
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

	// ─── Drag (area arco SVG) ─────────────────────────────────────────────────

	// Il drag è attivo solo sull'area di navigazione sotto l'arco.
	// Le card mantengono le proprie interazioni di click/hover invariate.
	const DRAG_RESISTANCE = 1.0; // smorzamento: rimosso per un feedback 1-a-1 più pronto
	const PIXELS_PER_INDEX = 180; // ridotto per far muovere più card a parità di movimento del mouse

	let dragStartX = 0;
	let dragStartTarget = 0;

	/** @param {MouseEvent} e */
	function handleNavMouseEnter(e) {
		isMouseOverDragZone = true;
		// Commento solo il perché: aggiorniamo la posizione all'istante dell'enter per evitare glitch grafici con coordinate obsolete
		tooltip.updatePosition(e.clientX, e.clientY);
		tooltip.show('← • →', 'semplice', 'none', true);
	}

	function handleNavMouseLeave() {
		isMouseOverDragZone = false;
		if (!isDragging) tooltip.hide();
	}

	/** @param {MouseEvent} e */
	function handleNavMouseDown(e) {
		isDragging = true;
		navigationTween?.kill();
		navigationTween = null;
		dragStartX = e.clientX;
		dragStartTarget = targetIndex;
		dragVelocity = 0;
		lastDragIndex = targetIndex;
		lastDragTime = performance.now();
		inertiaVelocity = 0;
		autoplayTween?.pause();
	}

	// mousemove e mouseup sono sul window: il drag continua anche se il puntatore
	// esce dall'area durante il gesto, senza perdere il tracking.
	$effect(() => {
		/** @param {MouseEvent} e */
		function onWindowMouseMove(e) {
			if (!isDragging) return;
			const deltaX = (e.clientX - dragStartX) * DRAG_RESISTANCE;
			let newTarget = dragStartTarget - deltaX / PIXELS_PER_INDEX;

			// Limit the swipe to at most 5 cards to control the drag span
			const MAX_CARDS_PER_DRAG = 4.5;
			const offset = newTarget - dragStartTarget;
			if (Math.abs(offset) > MAX_CARDS_PER_DRAG) {
				newTarget = dragStartTarget + Math.sign(offset) * MAX_CARDS_PER_DRAG;
			}

			const now = performance.now();
			const dt = now - lastDragTime;
			if (dt > 0) {
				const instantV = (newTarget - lastDragIndex) / dt; // indices per ms
				dragVelocity = dragVelocity * 0.4 + instantV * 0.6; // smooth running average
			}

			targetIndex = newTarget;
			lastDragIndex = newTarget;
			lastDragTime = now;
			tooltip.updatePosition(e.clientX, e.clientY);
		}

		function onWindowMouseUp() {
			if (!isDragging) return;
			isDragging = false;

			// Convert indices/ms to indices/frame (assuming 60fps -> 16.67ms per frame)
			let velocityPerFrame = dragVelocity * 16.67;
			// Clamp inertia velocity to prevent extreme swipe speeds
			const MAX_INERTIA_SPEED = 0.35;
			if (Math.abs(velocityPerFrame) > MAX_INERTIA_SPEED) {
				velocityPerFrame = Math.sign(velocityPerFrame) * MAX_INERTIA_SPEED;
			}
			inertiaVelocity = velocityPerFrame;

			// Commento solo il PERCHÉ: se la velocità di rilascio è sotto soglia, agganciamo immediatamente la card più vicina usando la transizione fluida navigateTo
			if (Math.abs(inertiaVelocity) <= 0.005) {
				const len = filteredAthletes.length;
				navigateTo(wrapIndex(Math.round(displayedIndex), len));
			}

			// Restart autoplay timer fresh after drag is completed
			autoplayTween?.restart();
			if (hoveredIndex !== null) autoplayTween?.pause();
			
			// Commento solo il PERCHÉ: nascondiamo il tooltip al mouseup solo se l'utente ha rilasciato il mouse all'esterno della drag zone
			if (!isMouseOverDragZone) {
				tooltip.hide();
			}
		}

		window.addEventListener('mousemove', onWindowMouseMove);
		window.addEventListener('mouseup', onWindowMouseUp);
		return () => {
			window.removeEventListener('mousemove', onWindowMouseMove);
			window.removeEventListener('mouseup', onWindowMouseUp);
		};
	});
</script>

<div
	class="carousel-container"
	bind:clientWidth={containerWidth}
	role="region"
	aria-label="Visualizzatore atleti {PLURAL_TYPES[type] ?? ''}"
>
	<div
		class="carousel-track"
		use:carousel={{ activeIndex: displayedIndex, itemsCount: filteredAthletes.length, hoveredIndex, isDragging }}
		ontouchstart={handleTouchStart}
		ontouchend={handleTouchEnd}
		role="group"
		aria-label="Carousel Track"
	>
		{#each filteredAthletes as athlete, i (athlete.name)}
			<div
				class="carousel-item"
				onmouseenter={!isMoving ? (i === activeIndex && !isFlipped ? (e) => { tooltip.updatePosition(e.clientX, e.clientY); tooltip.show("Scopri", "semplice", "pointer"); hoveredIndex = i; } : () => { hoveredIndex = i; }) : null}
				onmouseleave={() => { if (!isDragging) tooltip.hide(); hoveredIndex = null; }}
				onclick={i === activeIndex && !isMoving ? () => {
					isFlipped = !isFlipped;
					if (isFlipped) {
						tooltip.hide();
					}
				} : null}
				role="none"
			>
				<AthleteCard
					name={athlete.name}
					imageSrc={athlete.imageSrc}
					context={athlete.context}
					quote={athlete.quote}
					type={athlete.type}
					number={"0" + (i + 1)}
					active={i === activeIndex && !isMoving}
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
			use:carouselDots={{ activeIndex: displayedIndex, itemsCount: filteredAthletes.length, cx: cx_nav, cy: cy_nav, radius: R_nav, hoveredIndex, isDragging }}
		>
			<defs>
				<!-- Gradiente verticale per sfumare l'arco man mano che scende verso il fondo del viewport -->
				<linearGradient id="arc-fade-gradient" x1="0" y1="20" x2="0" y2="250" gradientUnits="userSpaceOnUse">
					<stop offset="0%" stop-color="var(--content-primary)" stop-opacity="0.7" />
					<stop offset="100%" stop-color="var(--content-primary)" stop-opacity="0" />
				</linearGradient>
			</defs>

			<!-- Area interattiva di drag posizionata prima dei pallini nel DOM dell'SVG per non coprirli -->
			<path
				d={dragZonePath}
				class="svg-drag-path"
				onmouseenter={handleNavMouseEnter}
				onmouseleave={handleNavMouseLeave}
				onmousedown={handleNavMouseDown}
				role="slider"
				aria-label="Trascina per navigare gli atleti"
				aria-valuenow={activeIndex + 1}
				aria-valuemin={1}
				aria-valuemax={filteredAthletes.length}
				tabindex="-1"
			/>

			<!-- Dotted arc path — equator points are off-screen, arc exits container on both sides -->
			<path
				d={arcPath}
				stroke="url(#arc-fade-gradient)"
				stroke-width="2"
				stroke-linecap="round"
				stroke-dasharray="0.1 8"
				fill="none"
				style="pointer-events: none;"
			/>

			<!-- One dot per card — positioned and animated by carouselDots action -->
			{#each filteredAthletes as athlete, i (athlete.name)}
				<circle
					class="carousel-dot"
					cx={cx_nav}
					cy={cy_nav}
					r="6"
					fill="var(--content-primary)"
					style="cursor: pointer;"
					onclick={() => selectIndex(i)}
					onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectIndex(i); }}
					onmouseenter={() => { hoveredIndex = i; }}
					onmouseleave={() => { hoveredIndex = null; }}
					role="button"
					tabindex="0"
					aria-label="Vai all'atleta {athlete.name}"
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
		/* position relative consente al drag-zone di estendersi in absolute fino al fondo */
		position: relative;
		overflow: visible;
		padding: var(--spacing-2) 0;
		outline: none;
		/* flex: 1 assicura che il container occupi tutto lo spazio verticale disponibile nella sezione */
		flex: 1;
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
		/* overflow visible consente al tracciato dell'arco e dei dot di uscire dal box se necessario */
		overflow: visible;
		margin-top: var(--spacing-1);
		position: relative;
		height: 120px;
	}

	.svg-drag-path {
		fill: transparent;
		cursor: none;
		pointer-events: auto;
		outline: none;
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

	/* Remove browser focus ring from SVG dots — they have a custom hover highlight */
	:global(.carousel-dot:focus) {
		outline: none;
	}
</style>
