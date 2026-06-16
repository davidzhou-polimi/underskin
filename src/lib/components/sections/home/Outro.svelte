<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import { trackSection } from '$lib/actions/trackSection.js';
	import { tooltip } from '$lib/stores/tooltipState.svelte.js';

	const stages = [
		{ target: 34, lines: ['soffre di ansia o depressione'] },
		{ target: 45, lines: ['manifesta disturbi alimentari'] },
		{ target: 26, lines: ['sviluppa problemi mentali', 'gravi dopo il ritiro'] },
		{ target: 36, lines: ['soffre di disturbi del sonno'] },
		{ target: 53, lines: ['soffre di solitudine'] }
	];

	/** @type {SVGCircleElement | null} */
	let revealCircleEl = null;
	/** @type {SVGTextElement | null} */
	let percentageTextEl = null;
	/** @type {SVGTextElement | null} */
	let descriptionTextEl = null;
	/** @type {HTMLElement | null} */
	let sectionEl = null;

	// Reactive flags — drive tooltip/click eligibility in the template
	let scrollPhaseComplete = $state(false);
	let currentIndex = $state(-1);

	let isAnimating = false;
	let currentValue = 0;

	// True only while there are still click-stages left
	const hasMoreStages = $derived(scrollPhaseComplete && currentIndex < stages.length - 1);

	/** @param {string[]} lines */
	function updateDescription(lines) {
		if (!descriptionTextEl) return;
		descriptionTextEl.innerHTML = '';
		lines.forEach((line, i) => {
			const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
			tspan.setAttribute('x', '235.5');
			tspan.setAttribute('dy', i === 0 ? '0' : '1.3em');
			tspan.textContent = line;
			descriptionTextEl?.appendChild(tspan);
		});
	}

	/** Snap bar to stage-0 target, reveal description, enable click mode */
	function activateScrollStage() {
		const t = stages[0].target;
		if (percentageTextEl) percentageTextEl.textContent = `${t}%`;
		if (revealCircleEl) revealCircleEl.setAttribute('stroke-dasharray', `${t} ${100 - t}`);
		currentValue = t;
		currentIndex = 0;
		scrollPhaseComplete = true;
		updateDescription(stages[0].lines);
		if (descriptionTextEl) gsap.to(descriptionTextEl, { opacity: 1, duration: 0.3 });
	}

	/** User scrolled back — hand control back to the scrub tween */
	function resetScrollStage() {
		scrollPhaseComplete = false;
		currentIndex = -1;
		currentValue = 0;
		if (descriptionTextEl) gsap.set(descriptionTextEl, { opacity: 0 });
		tooltip.hide();
	}

	/** @param {number} stageIndex */
	function animateToStage(stageIndex) {
		if (isAnimating) return;
		isAnimating = true;

		const stage = stages[stageIndex];
		const fromValue = currentValue;

		gsap.to(descriptionTextEl, {
			opacity: 0,
			duration: 0.3,
			onComplete: () => {
				updateDescription(stage.lines);
				if (descriptionTextEl) gsap.to(descriptionTextEl, { opacity: 1, duration: 0.3 });
			}
		});

		const obj = { value: fromValue };
		gsap.to(obj, {
			value: stage.target,
			duration: 1.2,
			ease: 'power1.out',
			onUpdate() {
				if (percentageTextEl) percentageTextEl.textContent = `${Math.round(obj.value)}%`;
				if (revealCircleEl) {
					revealCircleEl.setAttribute(
						'stroke-dasharray',
						`${obj.value.toFixed(2)} ${(100 - obj.value).toFixed(2)}`
					);
				}
			},
			onComplete() {
				currentValue = stage.target;
				currentIndex = stageIndex;
				isAnimating = false;
				// Ultimo stadio: rimuovi cursore e tooltip immediatamente
				if (stageIndex === stages.length - 1) tooltip.hide();
			}
		});
	}

	function handleClick() {
		if (!hasMoreStages || isAnimating) return;
		animateToStage(currentIndex + 1);
	}

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		if (percentageTextEl) percentageTextEl.textContent = '0%';
		if (revealCircleEl) revealCircleEl.setAttribute('stroke-dasharray', '0 100');
		if (descriptionTextEl) gsap.set(descriptionTextEl, { opacity: 0 });

		// Object whose .value is scrubbed by scroll from 0 → stages[0].target
		const scrollObj = { value: 0 };

		const scrollAnimation = gsap.to(scrollObj, {
			value: stages[0].target,
			ease: 'none',
			onUpdate() {
				const v = scrollObj.value;
				if (percentageTextEl) percentageTextEl.textContent = `${Math.round(v)}%`;
				if (revealCircleEl) {
					revealCircleEl.setAttribute(
						'stroke-dasharray',
						`${v.toFixed(2)} ${(100 - v).toFixed(2)}`
					);
				}
			},
			scrollTrigger: {
				trigger: sectionEl,
				start: 'top bottom', // animazione parte appena la sezione entra dal basso
				end: 'top top',      // finisce quando il cerchio è al centro = scene sticky
				scrub: 0.8,
				onLeave: activateScrollStage,
				onEnterBack: resetScrollStage
			}
		});

		return () => {
			if (scrollAnimation.scrollTrigger) scrollAnimation.scrollTrigger.kill();
			scrollAnimation.kill();
		};
	});
</script>

<section
	bind:this={sectionEl}
	id="outro"
	class="outro-scroll-container"
	use:trackSection={{ id: 'outro' }}
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
			onclick={handleClick}
			onkeydown={(e) => e.key === 'Enter' && handleClick()}
			onmouseenter={() => { if (hasMoreStages) tooltip.show('Click', 'semplice', 'pointer'); }}
			onmouseleave={() => tooltip.hide()}
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
					bind:this={revealCircleEl}
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
					bind:this={percentageTextEl}
					class="circle-percentage"
					x="235.5"
					y="225"
					text-anchor="middle"
					dominant-baseline="middle"
				>0%</text>

				<!-- Descrizione sotto la percentuale -->
				<text
					bind:this={descriptionTextEl}
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
