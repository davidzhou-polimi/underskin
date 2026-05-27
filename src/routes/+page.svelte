<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import IntroTextSection from '$lib/components/sections/IntroTextSection.svelte';
	// import PerformanceSection from '$lib/components/sections/PerformanceSection.svelte';
	import CerchiQuiz from '$lib/components/ui/CerchiQuiz.svelte';
	import { layers } from '$lib/stores/layers.svelte.js';

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		const st = ScrollTrigger.create({
			trigger: '.layer-container',
			start: 'top top',
			end: '+=300%',
			pin: true,
			pinSpacing: true,
			scrub: 1,
			onUpdate: (self) => {
				layers.progress = self.progress;
			}
		});

		return () => {
			st.kill();
		};
	});
</script>

<main class="layer-container">
	<IntroTextSection />
	<CerchiQuiz />
</main>

<style>
	.layer-container {
		position: relative;
		width: 100%;
		height: 100vh;
		overflow: hidden;
	}
</style>
