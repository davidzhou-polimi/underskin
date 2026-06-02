<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import IntroTextSection from '$lib/components/sections/IntroTextSection.svelte';
	import FisicoMentaleQuiz from '$lib/components/sections/FisicoMentaleQuiz.svelte';
	import PerformanceSection from '$lib/components/sections/PerformanceSection.svelte';
	import Cards from '$lib/components/sections/Cards.svelte';
	import GlassEffect from '$lib/components/ui/GlassEffect.svelte';

	let isLocked = $state(false);
	let quizExpanded = $state(false);

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);
	});

	/**
	 * Impedisce lo scroll wheel/touch quando il quiz è attivo, a meno che il quiz non sia espanso a schermo intero
	 * @param {any} e - L'evento di scroll wheel o touch
	 */
	function handlePreventScroll(e) {
		// Se il quiz è espanso, lascia passare gli eventi interni
		if (quizExpanded) return;

		if (isLocked && e.cancelable) {
			e.preventDefault();
		}
	}
</script>

<svelte:window
	onwheel={handlePreventScroll}
	ontouchmove={handlePreventScroll}
/>

<main class="page-flow">
	<IntroTextSection />
	<FisicoMentaleQuiz
		lockScroll={() => isLocked = true}
		unlockScroll={() => isLocked = false}
		onExpand={() => quizExpanded = true}
		onCollapse={() => quizExpanded = false}
	/>
	<PerformanceSection />
	<Cards />
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

	.page-flow {
		width: 100%;
		min-height: 100vh;
		background-color: var(--background-primary);
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
