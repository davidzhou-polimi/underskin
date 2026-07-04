<script>
	import AboutHero from '$lib/components/sections/about/AboutHero.svelte';
	import AboutTextSwap from '$lib/components/sections/about/AboutTextSwap.svelte';
	import AboutStatement from '$lib/components/sections/about/AboutStatement.svelte';
	import TeamSection from '$lib/components/sections/about/TeamSection.svelte';
	import Footer from '$lib/components/sections/Footer.svelte';
	import { trackScrollProgress } from '$lib/actions/trackScrollProgress.js';
	import { createFullPageGradientConfig } from '$lib/stores/scrollGradient.svelte.js';
	import { gradientConfig } from '$lib/stores/gradientConfig.svelte.js';

	const gradient = createFullPageGradientConfig();

	// Propaga la config scroll-driven al canvas unico del layout (app).
	$effect(() => { gradientConfig.config = gradient.activeConfig; });
</script>

<svelte:window bind:scrollY={gradient.scrollY} bind:innerHeight={gradient.innerHeight} />

<main id="about" use:trackScrollProgress>
	<AboutHero />
	<AboutTextSwap />
	<AboutStatement />
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
