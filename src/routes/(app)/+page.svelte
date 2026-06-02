<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import IntroTextSection from '$lib/components/sections/IntroTextSection.svelte';
	import FisicoMentaleQuiz from '$lib/components/sections/FisicoMentaleQuiz.svelte';
	import OutroSection from '$lib/components/sections/OutroSection.svelte';
	import PerformanceSection from '$lib/components/sections/PerformanceSection.svelte';
	import Cards from '$lib/components/sections/Cards.svelte';
	import FinaleSection from '$lib/components/sections/FinaleSection.svelte';

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
	<OutroSection />
	<PerformanceSection />
	<Cards />
	<FinaleSection />
</main>

<style>
	.page-flow {
		width: 100%;
		min-height: 100vh;
		background-color: var(--background-primary);
	}

	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>
