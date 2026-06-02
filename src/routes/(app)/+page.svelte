<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import Intro from '$lib/components/sections/home/Intro.svelte';
	import Quiz from '$lib/components/sections/home/Quiz.svelte';
	import Performance from '$lib/components/sections/home/Performance.svelte';
	import Cards from '$lib/components/sections/home/Cards.svelte';
	import Outro from '$lib/components/sections/home/Outro.svelte';
	import Burnout from '$lib/components/sections/home/Burnout.svelte';
	import Final from '$lib/components/sections/home/Final.svelte';
	import Footer from '$lib/components/sections/home/Footer.svelte';

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
	<Intro />
	<Quiz
		lockScroll={() => isLocked = true}
		unlockScroll={() => isLocked = false}
		onExpand={() => quizExpanded = true}
		onCollapse={() => quizExpanded = false}
	/>
	<Performance />
	<Cards />
	<Outro />
	<Burnout />
	<Final />
	<Footer />
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
