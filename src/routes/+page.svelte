<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import IntroTextSection from '$lib/components/sections/IntroTextSection.svelte';
	import CerchiQuiz from '$lib/components/ui/CerchiQuiz.svelte';
	import PerformanceSection from '$lib/components/sections/PerformanceSection.svelte';
	import GlassEffect from '$lib/components/ui/GlassEffect.svelte';
	import { layers } from '$lib/stores/layers.svelte.js';

	let st = null;
	let isLocked = $state(false);
	let quizExpanded = $state(false);

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

			// ScrollTrigger per il layer container
		st = ScrollTrigger.create({
			trigger: '.layer-container',
			start: 'top top',
			// 500% = abbastanza spazio perché scrollReveal (200%) finisca con ampio margine
			// l'utente può leggere "Tutto per soli..." e continuare a scrollare oltre
			end: '+=900%',
			pin: true,
			pinSpacing: true,
			scrub: 1,
			onUpdate: (self) => {
				// 退出动画期间跳过，让 CerchiQuiz 手动控制 layers.progress
				if (layers.suppressOnUpdate) return;
				if (self.progress > 0.85 && !layers.quizCompleted) {
					// 关键点：不要强制改滚动条位置 (self.scroll)
					// 而是将 ScrollTrigger 锁定在当前状态
					
					// 可选：将当前的 progress 保持在 0.85，防止用户继续往下滚
					// 这样不会引起“弹回”感，而是让滚动感觉“到头了”
					if (self.progress > 0.85) {
						layers.progress = 0.85; 
					}
					return; 
				}

				// 正常更新进度
				layers.progress = self.progress;

				// Sblocca quando si torna all'inizio
				if (self.progress < 0.05 && isLocked) {
					isLocked = false;
				}
			}
		});

		layers.scrollTrigger = st;

		return () => {
			if (st) st.kill();
		};
	});

	// Previene lo scroll quando il quiz è attivo (ma non quando è espanso - deve ricevere gli eventi)
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
	<CerchiQuiz
		lockScroll={() => isLocked = true}
		unlockScroll={() => isLocked = false}
		onExpand={() => quizExpanded = true}
		onCollapse={() => quizExpanded = false}
	/>
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
