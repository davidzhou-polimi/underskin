<script>
	// Commento solo il PERCHÉ: Importa le sezioni e lo store di narrazione per orchestrare 
	// la visualizzazione condizionale della sezione corrente attiva sulla pagina singola.
	import HeroSection from '$lib/components/sections/HeroSection.svelte';
	import FavoritoSection from '$lib/components/sections/FavoritoSection.svelte';
	import InsoddisfattoSection from '$lib/components/sections/InsoddisfattoSection.svelte';
	import InfortunatoSection from '$lib/components/sections/InfortunatoSection.svelte';
	import InteractiveGradient from '$lib/components/ui/InteractiveGradient.svelte';
	import { narrative } from '$lib/stores/narrative.svelte.js';
	import { trackScrollProgress } from '$lib/actions/trackScrollProgress.js';

	// Commento solo il PERCHÉ: Associa a ciascuna sezione narrativa i relativi parametri del
	// gradiente per pilotare l'animazione fluida dell'unico canvas di sfondo globale.
	/** @type {Record<string, any>} */
	const SECTION_CONFIGS = {
		hero: {
			coverage: 0.3,
			maskClamp: [0.0, 0.7],
			grainIntensity: 0.1,
			colors: null
		},
		favorito: {
			colors: ['var(--azzurro-200)', 'var(--archetipi-favorito)', 'var(--azzurro-600)'],
			coverage: 1.0,
			maskClamp: [0.0, 1.0],
			grainIntensity: 0.05
		},
		insoddisfatto: {
			colors: ['var(--viola-200)', 'var(--archetipi-insoddisfatto)', 'var(--viola-600)'],
			coverage: 1.0,
			maskClamp: [0.0, 1.0],
			grainIntensity: 0.025
		},
		infortunato: {
			colors: ['var(--arancione-200)', 'var(--archetipi-infortunato)', 'var(--arancione-600)'],
			coverage: 1.0,
			maskClamp: [0.0, 1.0],
			grainIntensity: 0.05
		}
	};

	let activeConfig = $derived(SECTION_CONFIGS[narrative.activeSection] || SECTION_CONFIGS.hero);
</script>

<InteractiveGradient config={activeConfig} />

<main use:trackScrollProgress>
	{#if narrative.activeSection === 'hero'}
		<HeroSection />
		<section class="scroll-spacer" aria-hidden="true"></section>
	{:else if narrative.activeSection === 'favorito'}
		<FavoritoSection />
		<section class="scroll-spacer" aria-hidden="true"></section>
	{:else if narrative.activeSection === 'insoddisfatto'}
		<InsoddisfattoSection />
		<section class="scroll-spacer" aria-hidden="true"></section>
	{:else if narrative.activeSection === 'infortunato'}
		<InfortunatoSection />
		<section class="scroll-spacer" aria-hidden="true"></section>
	{/if}
</main>

<style>
	main {
		background: transparent;
	}

	.scroll-spacer {
		min-height: 300vh;
	}
</style>
