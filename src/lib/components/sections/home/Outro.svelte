<script>
	import { outroReveal } from '$lib/actions/home/outroReveal.js';

	let activeStage = $state(0);
	let displayedStage = $state(0);
	let isMobileStageFading = $state(false);
	let stageSwapTimeout = 0;
	const MOBILE_STAGE_FADE_MS = 180;

	const stages = [
		{ target: 34, lines: ['soffre di ansia o depressione'] },
		{ target: 45, lines: ['manifesta disturbi alimentari'] },
		{ target: 26, lines: ['sviluppa problemi mentali', 'gravi dopo il ritiro'] },
		{ target: 36, lines: ['soffre di disturbi del sonno'] },
		{ target: 53, lines: ['soffre di solitudine'] }
	];

	const arcRadius = 310;
	const arcCenterX = 195;
	const arcCenterY = 82 + Math.sqrt((arcRadius ** 2) - ((408 - (-18)) / 2) ** 2);
	const arcDotXPositions = [20, 108, 195, 283, 370];
	const dotPositions = arcDotXPositions.map((x) => {
		// Commento solo il PERCHÉ: usa la stessa geometria dell'arco SVG per garantire
		// che ogni pallino cada esattamente sul tracciato e non "a occhio".
		const y = arcCenterY - Math.sqrt((arcRadius ** 2) - ((x - arcCenterX) ** 2));
		return { x, y };
	});

	/** @param {number} nextStage */
	function selectMobileStage(nextStage) {
		const clampedStage = Math.max(0, Math.min(nextStage, stages.length - 1));

		if (clampedStage === activeStage && clampedStage === displayedStage) return;

		activeStage = clampedStage;
		isMobileStageFading = true;
		window.clearTimeout(stageSwapTimeout);
		stageSwapTimeout = window.setTimeout(() => {
			displayedStage = clampedStage;
			isMobileStageFading = false;
		}, MOBILE_STAGE_FADE_MS);
	}

	$effect(() => {
		return () => window.clearTimeout(stageSwapTimeout);
	});
</script>

<section
	id="outro"
	class="outro-scroll-container"
	use:outroReveal={{ stages }}
>
	<div class="scene">
		<h2 class="podium-title">
			Questo è ciò che non si vede sul podio:
		</h2>

		<div class="circle-stage">
			<svg
				class="dotted-circle"
				viewBox="0 0 471 471"
				preserveAspectRatio="xMidYMid meet"
				width="100%"
				height="100%"
				role="presentation"
				focusable="false"
			>
				<defs>
					<linearGradient id="outro-circle-gradient" x1="0%" y1="100%" x2="100%" y2="0%" gradientUnits="objectBoundingBox">
						<animateTransform
							attributeName="gradientTransform"
							type="translate"
							from="-1 0"
							to="1 0"
							dur="6s"
							repeatCount="indefinite"
						/>
						<stop offset="0%" stop-color="var(--archetipi-insoddisfatto)" />
						<stop offset="50%" stop-color="var(--azzurro-500)" />
						<stop offset="100%" stop-color="var(--arancione-500)" />
					</linearGradient>
				</defs>

				<!-- Cerchio di sfondo a puntini -->
				<circle
					cx="235.5"
					cy="235.5"
					r="230"
					fill="none"
					stroke="var(--content-primary)"
					stroke-width="4"
					stroke-linecap="round"
					stroke-dasharray="0 18.06"
				/>

				<!-- Cerchio di avanzamento colorato -->
				<circle
					class="reveal-circle"
					cx="235.5"
					cy="235.5"
					r="230"
					fill="none"
					stroke="url(#outro-circle-gradient)"
					stroke-width="6"
					stroke-linecap="round"
					pathLength="100"
					stroke-dasharray="0 100"
					transform="rotate(-90 235.5 235.5)"
				/>

				<!-- Percentuale centrale -->
				<text
					class="circle-percentage"
					x="235.5"
					y="225"
					text-anchor="middle"
					dominant-baseline="middle"
				>0%</text>

				<!-- Commento solo il PERCHÉ: genera tutte le descrizioni nel DOM per consentire a GSAP
				     di gestire il fade in/out tramite opacità in modo nativo e performante durante lo scrub dello scroll -->
				{#each stages as stage, i}
					<text
						class="circle-description circle-description-{i}"
						x="235.5"
						y="300"
						text-anchor="middle"
						style="opacity: 0; pointer-events: none;"
					>
						{#each stage.lines as line, lineIdx}
							<tspan
								x="235.5"
								dy={lineIdx === 0 ? '0' : '1.3em'}
							>{line}</tspan>
						{/each}
					</text>
				{/each}
			</svg>
		</div>
	</div>

	<!-- Mobile scene: navigazione a tap, nascosta su desktop -->
	<div class="mobile-section">
		<h2 class="mobile-heading">
			Non tutto si vede<br>sul podio
		</h2>

		<!-- Arco puntinato con indicatori di stage tappabili -->
		<svg
			class="arc-svg"
			viewBox="-20 -10 430 110"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-label="Indicatore progressione statistiche"
		>
			<!-- stesso stile visivo del cerchio desktop: stroke-dasharray per i pallini -->
			<path
				class="arc-dotted"
				d="M -18 82 A 310 310 0 0 1 408 82"
			/>
			<!-- Commento solo il PERCHÉ: r reattivo cambia dimensione in base allo stage attivo
			     per rendere chiaramente tappabile la posizione corrente -->
			{#each dotPositions as pos, i}
				<circle
					class="arc-dot"
					cx={pos.x}
					cy={pos.y}
					r={i === activeStage ? 8 : 5}
					onclick={() => selectMobileStage(i)}
					role="button"
					tabindex="0"
					aria-label={`Statistica ${i + 1}`}
					onkeydown={(e) => e.key === 'Enter' && selectMobileStage(i)}
				/>
			{/each}
		</svg>

		<p class="mobile-stat-number" class:is-fading={isMobileStageFading}>{stages[displayedStage].target}%</p>

		<p class="mobile-stat-desc" class:is-fading={isMobileStageFading}>{stages[displayedStage].lines.join(' ')}</p>

		{#if activeStage < stages.length - 1}
			<button
				class="mobile-next glass-effect"
				onclick={() => selectMobileStage(activeStage + 1)}
			>
				Successivo
			</button>
		{/if}
	</div>
</section>

<style>
	/* Altezza sufficiente a garantire uno scrollytelling fluido per le 5 statistiche */
	.outro-scroll-container {
		position: relative;
		height: 800vh;
		background-color: transparent;
		width: 100%;
	}

	/* La scena è sticky durante tutta la fase di scroll e click */
	.scene {
		position: sticky;
		top: 0;
		height: 100vh;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-8);
		padding: var(--spacing-11) var(--spacing-4) var(--spacing-10);
		box-sizing: border-box;
		overflow: hidden;
	}

	.podium-title {
		font-family: var(--font-family-base);
		font-size: var(--text-important-size);
		font-weight: var(--text-important-weight);
		line-height: 1.25;
		color: var(--content-primary);
		margin: 0;
		text-align: center;
	}

	.circle-stage {
		width: min(80vw, 50vh, 470px);
		height: min(80vw, 50vh, 470px);
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: none;
		padding: 0;
	}

	.dotted-circle {
		display: block;
		width: 100%;
		height: 100%;
		overflow: visible;
		flex: none;
	}

	.circle-percentage {
		font-family: var(--font-family-base);
		font-size: var(--text-title-size);
		font-weight: var(--text-title-weight);
		fill: var(--content-primary);
	}

	.circle-description {
		font-family: var(--font-family-base);
		font-size: var(--text-caption-size);
		font-weight: 700;
		fill: var(--content-primary);
	}

	/* Mobile section: nascosta su desktop */
	.mobile-section {
		display: none;
	}

	@media (max-width: 768px) {
		.outro-scroll-container {
			height: 100svh;
		}

		.scene {
			display: none;
		}

		.mobile-section {
			display: flex;
			flex-direction: column;
			align-items: center;
			/* flex-start mantiene le posizioni fisse al cambio di stage */
			justify-content: flex-start;
			height: 100svh;
			padding: var(--spacing-11) var(--spacing-4) var(--spacing-4);
			box-sizing: border-box;
			overflow: hidden;
		}

		.mobile-heading {
			font-family: var(--font-family-base);
			/* 40px — nessun token mobile arriva a 40px; --text-l diventa 24px su mobile */
			font-size: 2.5rem;
			font-weight: var(--text-bold);
			line-height: 1.2;
			color: var(--content-primary);
			margin: 0;
			text-align: center;
			/* 7.5rem = 120px — --spacing-11 diventa 64px su mobile; nessun token mobile copre 120px */
			margin-bottom: 7.5rem;
			flex-shrink: 0;
		}

		.arc-svg {
			/* Commento solo il PERCHÉ: allarga l'arco oltre il padding mobile della sezione
			   per farlo toccare i bordi visivi dello schermo */
			width: calc(100% + (2 * var(--spacing-4)));
			margin-inline: calc(var(--spacing-4) * -1);
			overflow: visible;
			flex-shrink: 0;
			/* Commento solo il PERCHÉ: sfuma leggermente i bordi dell'arco per un ingresso/uscita visiva più morbida */
			-webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
			mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
		}

		.arc-dotted {
			fill: none;
			stroke: var(--content-primary);
			stroke-width: 4;
			stroke-linecap: round;
			/* 0 = dot, 16 = gap — stessa densità visiva del cerchio desktop */
			stroke-dasharray: 0 16;
		}

		.arc-dot {
			fill: var(--content-primary);
			cursor: pointer;
			touch-action: manipulation;
		}

		.mobile-stat-number {
			font-family: var(--font-family-base);
			/* 8rem / 128px — Figma: --unit/128; --text-2xl è overridato a 56px su mobile */
			font-size: 8rem;
			font-weight: var(--text-extrabold);
			line-height: 1;
			color: var(--content-primary);
			margin: 0;
			margin-top: var(--spacing-2);
			text-align: center;
			flex-shrink: 0;
			transition: opacity var(--transition-duration-normal) var(--easing-standard);
			will-change: opacity;
		}

		.mobile-stat-desc {
			font-family: var(--font-family-base);
			/* var(--spacing-3) = 1.5rem / 24px — Figma: Spacing/3; --spacing-3 non viene overridato su mobile */
			font-size: var(--spacing-3);
			font-weight: var(--text-medium);
			line-height: 1.3;
			color: var(--content-primary);
			margin: 0;
			margin-top: var(--spacing-2);
			text-align: center;
			max-width: 20rem;
			/* min-height fissa previene il reflow quando lo stage 3 va su 2 righe */
			min-height: 4rem;
			flex-shrink: 0;
			transition: opacity var(--transition-duration-normal) var(--easing-standard);
			will-change: opacity;
		}

		.mobile-stat-number.is-fading,
		.mobile-stat-desc.is-fading {
			opacity: 0;
		}

		.mobile-next {
			font-family: var(--font-family-base);
			/* 1rem / 16px — Figma: --unit/16; --text-2xs diventa 14px su mobile */
			font-size: 1rem;
			font-weight: var(--text-regular);
			color: var(--content-primary);
			padding: var(--spacing-2) var(--spacing-4);
			border-radius: var(--radius-l);
			cursor: pointer;
			touch-action: manipulation;
			/* 4rem = 64px — --spacing-8 diventa 40px su mobile; nessun token mobile copre 64px */
			margin-top: 4rem;
			flex-shrink: 0;
			/* background-color, backdrop-filter, border: forniti interamente da .glass-effect */
		}
	}
</style>
