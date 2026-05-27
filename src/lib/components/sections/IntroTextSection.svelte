<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { trailCanvas } from '$lib/actions/trailCanvas.js';
	import { trackSection } from '$lib/actions/trackSection.js';
	import { layers } from '$lib/stores/layers.svelte.js';

	let textContainer;
	let lines = [];
	let currentIndex = $state(0);
	let animating = false;
	let initialized = false;
	let canvasStarted = false;
	let shouldLoop = false;
	
	let canvasAction = null;
	let rotationStarted = false;
	
	// 跟踪上一次显示的行索引
	let lastTargetIndex = -1;

	let opacity = $derived.by(() => {
		return layers.getLayerOpacity(0);
	});

	function bindLine(node, index) {
		lines[index] = node;
		return {};
	}
	
	// Bind canvas to get the action instance
	function bindCanvas(node) {
		canvasAction = trailCanvas(node);
		// 页面加载时播放一次入场动画（不循环）
		canvasAction.startLoop(false);
		return {
			destroy() {
				if (canvasAction) {
					canvasAction.destroy();
					canvasAction = null;
				}
			}
		};
	}

	$effect(() => {
		const globalProgress = layers.progress;

		const maxProgress = 0.35;
		const layerProgress = Math.min(globalProgress / maxProgress, 1);

		const totalLines = 5;
		const targetIndex = Math.min(Math.floor(layerProgress * totalLines), totalLines - 1);

		if (!initialized && lines.length === 5) {
			initialized = true;
			currentIndex = 0;
			lines.forEach((line, i) => {
				if (line) {
					if (i === 0) {
						gsap.set(line, { opacity: 1, filter: 'blur(0px)', y: 0 });
					} else {
						gsap.set(line, { opacity: 0, filter: 'blur(15px)', y: 20 });
					}
				}
			});
		}

		if (targetIndex !== currentIndex && !animating && lines.length === 5) {
			animating = true;
			const oldIndex = currentIndex;
			currentIndex = targetIndex;

			if (lines[oldIndex]) {
				gsap.to(lines[oldIndex], {
					opacity: 0,
					filter: 'blur(15px)',
					y: -20,
					duration: 0.4,
					ease: 'power2.inOut'
				});
			}

			if (lines[currentIndex]) {
				gsap.to(lines[currentIndex], {
					opacity: 1,
					filter: 'blur(0px)',
					y: 0,
					duration: 0.4,
					ease: 'power2.inOut',
					onComplete: () => {
						animating = false;
						// 当显示最后一行时，从暂停位置继续旋转
						if (currentIndex === 4 && canvasAction && !rotationStarted) {
							rotationStarted = true;
							canvasAction.continueRotation();
						}
					}
				});
			}
		}
		
		// 如果滚动到其他行又回来，不再触发 rotation
		lastTargetIndex = targetIndex;
	});
</script>

<section id="intro-text" class="intro-section" style:opacity={opacity} use:trackSection>
	<div class="canvas-layer">
		<canvas use:bindCanvas></canvas>
	</div>
	<div class="text-container" bind:this={textContainer}>
		<p class="reveal-line" use:bindLine={0}>Milano-Cortina 2026</p>
		<p class="reveal-line" use:bindLine={1}>2.900 atleti</p>
		<p class="reveal-line" use:bindLine={2}>1 vita di sacrifici</p>
		<p class="reveal-line" use:bindLine={3}>4 anni di preparazione</p>
		<div class="reveal-line final-phrase" use:bindLine={4}>
			<span>Tutto per soli</span>
			<span class="break-line gradient-text animate-gradient-text my-archetypes-color">120 secondi di performance</span>
		</div>
	</div>
</section>

<style>
	.intro-section {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background-color: var(--background-primary);
		will-change: opacity;
	}

	.canvas-layer {
		position: absolute;
		inset: 0;
		z-index: 0;
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
		filter: blur(60px) saturate(1);
		will-change: filter;
	}

	.text-container {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		align-items: center;
		justify-items: center;
		text-align: center;
		width: 100%;
		padding: var(--spacing-4);
	}

	.reveal-line {
		grid-area: 1 / 1 / 2 / 2;
		margin: var(--spacing-0);

		font-size: var(--text-important-size);
		font-weight: var(--text-important-weight);
		color: var(--content-primary);

		font-family: var(--font-family-base);
		line-height: 1.4;
	}

	.final-phrase {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.break-line {
		display: block;
		margin-top: var(--spacing-1);
	}

	.my-archetypes-color {
		--gradient-c1: var(--archetipi-favorito);
		--gradient-c2: var(--archetipi-insoddisfatto);
		--gradient-c3: var(--archetipi-infortunato);
	}
</style>
