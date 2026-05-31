<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import IntroTextSection from '$lib/components/sections/IntroTextSection.svelte';
	import CerchiQuiz from '$lib/components/ui/CerchiQuiz.svelte';
	import PerformanceSection from '$lib/components/sections/PerformanceSection.svelte';
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
		end: '+=100%',
		pin: true,
		pinSpacing: true,
		scrub: 1,
		onUpdate: (self) => {
			// --- 核心拦截逻辑 ---
			// 0.35 是选择页出现的进度，如果到了选择页，但 quiz 还没完成，且用户还在试着往下滚
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
	<PerformanceSection />
</main>

<style>
	.layer-container {
		position: relative;
		width: 100%;
		min-height: 100vh;
		overflow: hidden;
	}
</style>
