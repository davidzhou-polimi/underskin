<script>
	import AboutSection from '$lib/components/sections/about/About.svelte';
	import TeamSection from '$lib/components/sections/team/TeamSection.svelte';
	import Footer from '$lib/components/sections/home/Footer.svelte';
	import InteractiveGradient from '$lib/components/ui/InteractiveGradient.svelte';
	import { trackScrollProgress } from '$lib/actions/trackScrollProgress.js';
	import { createFullPageGradientConfig } from '$lib/stores/scrollGradient.svelte.js';

	const gradient = createFullPageGradientConfig();
</script>

<svelte:window bind:scrollY={gradient.scrollY} bind:innerHeight={gradient.innerHeight} />

<InteractiveGradient config={gradient.activeConfig} />

<main id="about" use:trackScrollProgress>
	<AboutSection />
	<TeamSection />
	<Footer />
</main>

<style>
	#about {
		position: relative;
		width: 100%;
		min-height: 100vh;
		/* Mantiene lo sfondo trasparente esponendo il canvas fixed */
		background: transparent;
	}

	#about :global(.hero-footer) {
		/* Annulla il margine negativo globale del footer per distanziare in modo pulito la sezione team dall'elemento di chiusura */
		margin-top: var(--spacing-11);
	}
</style>
