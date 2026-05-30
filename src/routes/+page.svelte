<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import IntroTextSection from '$lib/components/sections/IntroTextSection.svelte';
	import CerchiQuiz from '$lib/components/ui/CerchiQuiz.svelte';
	import { layers } from '$lib/stores/layers.svelte.js';

	let st = null;
	let isLocked = $state(false);

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		// ScrollTrigger per il layer container
		st = ScrollTrigger.create({
			trigger: '.layer-container',
			start: 'top top',
			end: '+=300%',
			pin: true,
			pinSpacing: true,
			scrub: 1,
			onUpdate: (self) => {
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

	// Previene lo scroll quando il quiz è attivo
	function handlePreventScroll(e) {
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
	/>
</main>

<style>
	.layer-container {
		position: relative;
		width: 100%;
		min-height: 100vh;
		overflow: hidden;
	}
</style>
