<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import IntroTextSection from '$lib/components/sections/IntroTextSection.svelte';
	import FisicoMentaleQuiz from '$lib/components/sections/FisicoMentaleQuiz.svelte';
	import PerformanceSection from '$lib/components/sections/PerformanceSection.svelte';
	import GlassEffect from '$lib/components/ui/GlassEffect.svelte';
	import { layers } from '$lib/stores/layers.svelte.js';

	/** @type {any} */
	let st = null;
	let isLocked = $state(false);
	let quizExpanded = $state(false);

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		// ScrollTrigger per il layer container
		st = ScrollTrigger.create({
			trigger: '.layer-container',
			start: 'top top',
			end: '+=100%',
			pin: true,
			pinSpacing: true,
			scrub: 1,
			onUpdate: (self) => {
				// --- 核心拦截逻辑 ---
				// 0.35 是选择页出现的进度，如果到了选择页，但 quiz 还没完成，且用户还在试end
				if (self.progress > 0.85 && !layers.quizCompleted && self.direction > 0) {
					self.scroll(st.start + (st.end - st.start) * 0.85); // 强行把滚动位置卡在 0.35 的地方
					layers.progress = 0.35;
					return; // 拦截后续执行
				}

				// 正常更新进度
				layers.progress = self.progress;

				// Sblocca quando si torna all'inizio
				if (self.progress < 0.05 && isLocked) {
					isLocked = false;
				}
			}
		});

		return () => {
			if (st) st.kill();
		};
	});

	/**
	 * Previene lo scroll quando il quiz è attivo (ma non quando è espanso - deve ricevere gli eventi)
	 * @param {any} e
	 */
	function handlePreventScroll(e) {
		// Se il quiz è espanso, lascia passare gli eventi (sarà il quiz a gestirli)
		if (quizExpanded) return;

		if (isLocked && e.cancelable) {
			e.preventDefault();
		}
	}
</script>

<window
	onwheel={handlePreventScroll}
	ontouchmove={handlePreventScroll}
/>

<main class="layer-container">
	<IntroTextSection />
	<FisicoMentaleQuiz
		lockScroll={() => isLocked = true}
		unlockScroll={() => isLocked = false}
		onExpand={() => quizExpanded = true}
		onCollapse={() => quizExpanded = false}
	/>
	<PerformanceSection />
</main>

<section class="test-figma-bg hidden">
	<div class="background-huge-text">
		<span>Quindi</span><span class="orange-text">tale</span>smettendo di
	</div>

	<GlassEffect class="figma-glass-card">
		<p class="glass-text">
			Improvviso calo delle prestazioni in situazioni ad alta pressione.<br>
			L'ansia interferisce con l'esecuzione automatica di competenze consolidate.
		</p>
	</GlassEffect>
</section>

<style>
	.test-figma-bg.hidden {
		display: none;
	}

	.layer-container {
		position: relative;
		width: 100%;
		min-height: 100vh;
		overflow: hidden;
	}

	.test-figma-bg {
		position: relative;
		min-height: 800px;
		background-color: #f4f8fb;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
	}

	.background-huge-text {
		position: absolute;
		top: 40%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-family: system-ui, sans-serif;
		font-size: 8rem;
		font-weight: 500;
		color: #000000;
		white-space: nowrap;
		z-index: 1;
		letter-spacing: -0.05em;
	}

	.orange-text {
		color: #d88e73;
	}

	:global(.figma-glass-card) {
		position: relative;
		z-index: 10;
		max-width: 600px;
		border-radius: 24px;
		padding: 32px 40px;
		margin-top: 100px;
	}

	.glass-text {
		font-family: system-ui, sans-serif;
		color: #0c2137;
		font-size: 1.4rem;
		font-weight: 400;
		line-height: 1.5;
		margin: 0;
	}
</style>
