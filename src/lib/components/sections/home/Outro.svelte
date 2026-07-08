<script>
	import { outroReveal } from '$lib/actions/home/outroReveal.js';
	import { outroCarouselMobile } from '$lib/actions/home/outroCarouselMobile.js';
	import Button from '$lib/components/ui/Button.svelte';

	const stages = [
		{ target: 34, lines: ['soffre di ansia o depressione'] },
		{ target: 45, lines: ['manifesta disturbi alimentari'] },
		{ target: 26, lines: ['sviluppa problemi mentali', 'gravi dopo il ritiro'] },
		{ target: 36, lines: ['soffre di disturbi del sonno'] },
		{ target: 53, lines: ['soffre di solitudine'] }
	];

	// ─── Carosello mobile (pilotato dal pulsante, non dallo scroll) ───────────

	let mobileIndex = $state(0);
	// Commento solo il PERCHÉ: il pulsante inverte la direzione ai capi del carosello:
	// arrivati all'ultima statistica diventa "Precedente" e riporta fino alla prima.
	let direction = $state(1);

	function handleStep() {
		mobileIndex = Math.max(0, Math.min(stages.length - 1, mobileIndex + direction));
		if (mobileIndex === stages.length - 1) direction = -1;
		else if (mobileIndex === 0) direction = 1;
	}

	// ─── Geometria dell'arco puntinato (stesso linguaggio visivo di AthleteCarousel) ───

	const ARC_HEIGHT = 120; // px

	let arcWidth = $state(375);

	const arcRadius = $derived(arcWidth * 0.8);
	const arcCx = $derived(arcWidth / 2);
	// L'apice dell'arco resta vicino al bordo superiore dell'SVG, come nell'arco del carosello atleti
	const arcCy = $derived(ARC_HEIGHT * 0.17 + arcRadius);
	const arcPath = $derived(
		`M ${arcCx - arcRadius},${arcCy} A ${arcRadius},${arcRadius} 0 0 1 ${arcCx + arcRadius},${arcCy}`
	);

	// Commento solo il PERCHÉ: l'angolo dei pallini è ricavato dalla larghezza (spread ±35% del
	// viewport) invece che da un passo fisso in gradi, così i 5 punti restano sempre a schermo.
	const dotMaxAngle = $derived(Math.asin(Math.min(1, (arcWidth * 0.35) / arcRadius)));
	const dotHalfSpan = (stages.length - 1) / 2;
	const dotPositions = $derived(
		stages.map((_, i) => {
			const angle = ((i - dotHalfSpan) / dotHalfSpan) * dotMaxAngle;
			return {
				x: arcCx + arcRadius * Math.sin(angle),
				y: arcCy - arcRadius * Math.cos(angle)
			};
		})
	);
</script>

<section
	id="outro"
	class="outro-scroll-container"
	use:outroReveal={{ stages }}
	use:outroCarouselMobile={{ stages, activeIndex: mobileIndex }}
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

	<div class="mobile-carousel">
		<h2 class="mobile-title">Non tutto si vede<br />sul podio</h2>

		<div class="mobile-arc" bind:clientWidth={arcWidth}>
			<svg
				viewBox="0 0 {arcWidth} {ARC_HEIGHT}"
				preserveAspectRatio="xMidYMid meet"
				role="presentation"
				focusable="false"
			>
				<defs>
					<linearGradient
						id="outro-arc-fade"
						x1="0"
						y1={ARC_HEIGHT * 0.17}
						x2="0"
						y2={ARC_HEIGHT * 1.8}
						gradientUnits="userSpaceOnUse"
					>
						<stop offset="0%" stop-color="var(--content-primary)" stop-opacity="0.7" />
						<stop offset="100%" stop-color="var(--content-primary)" stop-opacity="0" />
					</linearGradient>
				</defs>

				<path
					d={arcPath}
					stroke="url(#outro-arc-fade)"
					stroke-width="2"
					stroke-linecap="round"
					stroke-dasharray="0.1 8"
					fill="none"
				/>

				{#each dotPositions as pos, i}
					<circle
						class="arc-dot"
						class:active={i === mobileIndex}
						cx={pos.x}
						cy={pos.y}
						r="4"
					/>
				{/each}
			</svg>
		</div>

		<div class="mobile-stat" aria-live="polite">
			<span class="mobile-percentage">{stages[0].target}%</span>
			<div class="mobile-captions">
				{#each stages as stage}
					<p class="mobile-caption">{stage.lines.join(' ')}</p>
				{/each}
			</div>
		</div>

		<Button
			ariaLabel={direction === 1 ? 'Statistica successiva' : 'Statistica precedente'}
			onclick={handleStep}
		>
			{direction === 1 ? 'Successivo' : 'Precedente'}
		</Button>
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

	/* Su desktop esiste solo lo scrollytelling: il carosello mobile non occupa spazio */
	.mobile-carousel {
		display: none;
	}

	@media (max-width: 768px) {
		/* Commento solo il PERCHÉ: su mobile la sezione è un carosello a pulsante, non uno
		   scrollytelling. La schermata extra (200svh) serve al pin: il carosello resta
		   incollato per un viewport di scroll, così anche chi scorre veloce non lo attraversa
		   senza vederlo — un semplice snap programmatico perdeva contro l'inerzia del touch. */
		.outro-scroll-container {
			height: 100svh;
			position: relative;
			box-sizing: border-box;
		}

		.scene {
			display: none;
		}

		.mobile-carousel {
			display: flex;
			/* Commento solo il PERCHÉ: il pinning è delegato interamente a GSAP tramite 
			   outroCarouselMobile, rendendo il comportamento e lo spazio fluidi ed omogenei. */
			position: relative;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			/* Commento solo il PERCHÉ: ridotto a 24px per recuperare spazio verticale 
			   dato che il titolo mobile ora si sviluppa su due righe. */
			gap: var(--spacing-5);
			height: 100svh;
			/* Commento solo il PERCHÉ: aumentato il padding superiore a var(--spacing-9) (48px) per 
			   spingere il titolo e il contenuto verso il basso, lontano dalla Dynamic Island. */
			padding: var(--spacing-9) var(--spacing-4) var(--spacing-5);
			box-sizing: border-box;
			overflow: hidden;
		}

		/* Commento solo il PERCHÉ: i rem sono hardcodati a un valore mobile intermedio (28px) 
		   anziché scalare sui token globali per garantire leggibilità ed evitare sovrapposizioni 
		   con gli elementi dell'interfaccia di sistema nativa (es. Dynamic Island). */
		.mobile-title {
			font-family: var(--font-family-base);
			font-size: 2.25rem;
			font-weight: var(--text-important-weight);
			/* Commento solo il PERCHÉ: line-height ridotto a 1.2 per rendere il titolo a due righe
			   visivamente compatto ed elegante. */
			line-height: 1.2;
			color: var(--content-primary);
			margin: 0;
			text-align: center;
		}

		.mobile-arc {
			width: 100%;
			height: 120px;
			flex: none;
			/* Commento solo il PERCHÉ: aggiunto margine superiore per distanziare 
			   l'arco dal titolo sovrastante ed evitare sovrapposizioni visive. */
			margin-top: var(--spacing-3);
		}

		.mobile-arc svg {
			display: block;
			width: 100%;
			height: 100%;
			/* L'arco prosegue oltre il box SVG: è il contenitore (overflow hidden) a tagliarlo
			   al bordo, per un effetto full-bleed come nell'arco del carosello atleti */
			overflow: visible;
		}

		.arc-dot {
			fill: var(--content-primary);
			transform-box: fill-box;
			transform-origin: center;
			transition: transform var(--transition-duration-fast) var(--easing-out);
		}

		/* Il pallino della statistica attiva raddoppia rispetto agli altri */
		.arc-dot.active {
			transform: scale(2);
		}

		.mobile-stat {
			display: flex;
			flex-direction: column;
			align-items: center;
			/* Commento solo il PERCHÉ: gap ridotto a var(--spacing-2) (16px) per legare 
			   maggiormente la percentuale e la sua didascalia. */
			gap: var(--spacing-2);
			width: 100%;
		}

		.mobile-percentage {
			font-family: var(--font-family-base);
			/* Commento solo il PERCHÉ: valore mobile intermedio (88px) hardcodato per ridurre 
			   l'altezza del blocco ed evitare spinte distorsive sul resto del layout. */
			font-size: 7rem;
			font-weight: var(--text-title-weight);
			line-height: 1;
			color: var(--content-primary);
			margin-top: -20px;
		}

		.mobile-captions {
			position: relative;
			width: 100%;
			/* Commento solo il PERCHÉ: l'altezza minima previene spostamenti improvvisi 
			   del layout durante il cross-fade, tarata su 2.8 volte la dimensione del font (20px). */
			min-height: calc(3 * 1.25rem);
		}

		.mobile-caption {
			position: absolute;
			inset-inline: 0;
			top: 0;
			margin: 0;
			font-family: var(--font-family-base);
			/* Commento solo il PERCHÉ: valore intermedio (20px) per differenziare la didascalia 
			   dalla percentuale centrale migliorando la leggibilità. */
			font-size: 1.25rem;
			font-weight: 700;
			line-height: 1.4;
			color: var(--content-primary);
			text-align: center;
			/* Stato iniziale del cross-fade: è l'action a rendere visibile la didascalia attiva */
			opacity: 0;
		}
	}
</style>