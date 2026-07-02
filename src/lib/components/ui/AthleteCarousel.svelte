<script>
	import AthleteCard from '$lib/components/ui/AthleteCard.svelte';
	import { carousel } from '$lib/actions/carousel.js';
	import { carouselDots } from '$lib/actions/carouselDots.js';
	import { AthleteCarouselMotion } from '$lib/actions/archetypes/athleteCarouselMotion.svelte.js';
	import athletesData from '$lib/data/athletes.json';
	import { tooltip } from '$lib/stores/tooltipState.svelte.js';
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

	let filteredAthletes = $derived(
		/** @type {any} */ (athletesData.filter(athlete => athlete.type === type))
	);

	// Il motore GSAP (autoplay, interpolazione, inerzia, navigazione) vive nel controller.
	const motion = new AthleteCarouselMotion(() => filteredAthletes.length);

	// Stato di UI locale al componente (il movimento è di motion)
	let isFlipped = $state(false);
	/** @type {number | null} */
	let hoveredIndex = $state(null);

	// Indice attivo derivato dall'indice mostrato arrotondato (memoizzato: cambia solo allo scatto di card)
	const activeIndex = $derived(
		filteredAthletes.length > 0
			? ((Math.round(motion.displayedIndex) % filteredAthletes.length) + filteredAthletes.length) % filteredAthletes.length
			: 0
	);

	const isMoving = $derived(
		motion.isDragging || motion.inertiaVelocity !== 0 || Math.abs(motion.displayedIndex - motion.targetIndex) > 0.001
	);

	// Reset flip state when user slides to another athlete
	$effect(() => {
		if (activeIndex !== undefined) {
			isFlipped = false;
		}
	});

	// Stato per tracciare se il mouse è posizionato all'interno della zona di drag
	let isMouseOverDragZone = $state(false);

	// Commento solo il PERCHÉ: l'$effect gestisce solo lo stato interno hoveredIndex.
	// Il ciclo di vita del tooltip è completamente delegato agli handler mouse
	// (handleNavMouseEnter/Leave, onWindowMouseUp) — nessuna chiamata a tooltip qui
	// evita interferenze con tooltip aperti da altri componenti durante l'autoplay.
	$effect(() => {
		if (isMoving) hoveredIndex = null;
	});

	// ─── Autoplay ─────────────────────────────────────────────────────────────

	onMount(() => motion.start());

	// Pausa/ripresa dell'autoplay in base ad hover e drag
	$effect(() => {
		if (hoveredIndex !== null || motion.isDragging) {
			motion.pauseAutoplay();
		} else {
			motion.resumeAutoplay();
		}
	});

	// Restart dell'autoplay ogni volta che il carosello termina un movimento (drag, inerzia o navigazione)
	$effect(() => {
		if (!isMoving) {
			motion.restartAutoplay();
			// Commento solo il PERCHÉ: fermiamo l'autoplay se l'utente è in hover sulla card stabilizzata
			if (hoveredIndex !== null) motion.pauseAutoplay();
		}
	});

	// Commento solo il PERCHÉ: registriamo un mousemove temporaneo sul window solo quando la card è girata e in hover.
	// Questo risolve i bug nativi del browser che perde/invia falsi eventi di mouseleave durante le rotazioni 3D.
	$effect(() => {
		if (isFlipped && hoveredIndex !== null) {
			// L'elemento è risolto una volta all'attivazione dell'effect (hoveredIndex è fisso
			// per tutta la sua vita: al cambio l'effect si ri-esegue): niente querySelectorAll per evento
			const hoveredCardEl = document.querySelectorAll('.carousel-item')[hoveredIndex];
			if (!hoveredCardEl) return;

			/** @param {MouseEvent} e */
			const onWindowMouseMove = (e) => {
				const rect = hoveredCardEl.getBoundingClientRect();
				const isInside = (
					e.clientX >= rect.left &&
					e.clientX <= rect.right &&
					e.clientY >= rect.top &&
					e.clientY <= rect.bottom
				);
				if (!isInside) {
					hoveredIndex = null;
				}
			};
			window.addEventListener('mousemove', onWindowMouseMove);
			return () => window.removeEventListener('mousemove', onWindowMouseMove);
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

	// ─── Navigation ───────────────────────────────────────────────────────────

	/** @param {number} index */
	const selectIndex = (index) => motion.selectIndex(index);

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
			dx > 0 ? motion.prev() : motion.next();
		}
	}

	// ─── Drag (area arco SVG) ─────────────────────────────────────────────────

	// Il drag è attivo solo sull'area di navigazione sotto l'arco; il calcolo del movimento
	// (inerzia, velocità, clamp) è in motion. Qui restano il wiring degli eventi e il tooltip.

	/** @param {MouseEvent} e */
	function handleNavMouseEnter(e) {
		isMouseOverDragZone = true;
		// Commento solo il perché: aggiorniamo la posizione all'istante dell'enter per evitare glitch grafici con coordinate obsolete
		tooltip.updatePosition(e.clientX, e.clientY);
		tooltip.show('← • →', 'semplice', 'none', true);
	}

	function handleNavMouseLeave() {
		isMouseOverDragZone = false;
		if (!motion.isDragging) tooltip.hide();
	}

	/** @param {MouseEvent} e */
	function handleNavMouseDown(e) {
		motion.startDrag(e.clientX);
	}

	// mousemove e mouseup sono sul window: il drag continua anche se il puntatore
	// esce dall'area durante il gesto, senza perdere il tracking.
	$effect(() => {
		/** @param {MouseEvent} e */
		function onWindowMouseMove(e) {
			if (!motion.isDragging) return;
			motion.drag(e.clientX);
			tooltip.updatePosition(e.clientX, e.clientY);
		}

		function onWindowMouseUp() {
			if (!motion.isDragging) return;
			motion.endDrag();
			
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
		use:carousel={{ activeIndex: motion.displayedIndex, itemsCount: filteredAthletes.length, hoveredIndex, isDragging: motion.isDragging }}
		ontouchstart={handleTouchStart}
		ontouchend={handleTouchEnd}
		role="group"
		aria-label="Carousel Track"
	>
		{#each filteredAthletes as athlete, i (athlete.name)}
			<div
				class="carousel-item"
				onmouseenter={!isMoving ? (i === activeIndex && !isFlipped ? (e) => { tooltip.updatePosition(e.clientX, e.clientY); tooltip.show("Scopri", "semplice", "pointer"); hoveredIndex = i; } : () => { hoveredIndex = i; }) : null}
				onmouseleave={() => {
					if (!motion.isDragging) tooltip.hide();
					// Commento solo il PERCHÉ: quando la card è girata deleghiamo la rimozione dell'hover al mousemove sul window per prevenire i bug di rotazione 3D
					if (isFlipped) return;
					hoveredIndex = null;
				}}
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
			use:carouselDots={{ activeIndex: motion.displayedIndex, itemsCount: filteredAthletes.length, cx: cx_nav, cy: cy_nav, radius: R_nav, hoveredIndex, isDragging: motion.isDragging }}
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
