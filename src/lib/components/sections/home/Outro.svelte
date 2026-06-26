<script>
	import { outroReveal } from '$lib/actions/home/outroReveal.js';

	const stages = [
		{ target: 34, lines: ['soffre di ansia o depressione'] },
		{ target: 45, lines: ['manifesta disturbi alimentari'] },
		{ target: 26, lines: ['sviluppa problemi mentali', 'gravi dopo il ritiro'] },
		{ target: 36, lines: ['soffre di disturbi del sonno'] },
		{ target: 53, lines: ['soffre di solitudine'] }
	];
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

		<div
			class="circle-stage"
			role="button"
			tabindex="0"
			aria-label="Avanza alla statistica successiva"
		>
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

				<!-- Descrizione sotto la percentuale -->
				<text
					class="circle-description"
					x="235.5"
					y="300"
					text-anchor="middle"
				></text>
			</svg>
		</div>
	</div>
</section>

<style>
	/* 1vh extra: tutta per la fase click (lo scroll 0→34% avviene prima che la sticky scatti) */
	.outro-scroll-container {
		position: relative;
		height: calc(100vh * 2);
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
</style>