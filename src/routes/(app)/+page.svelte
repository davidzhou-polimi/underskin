<script>
	// Commento solo il PERCHÉ: Importa le sezioni e lo store di narrazione per orchestrare 
	// la visualizzazione condizionale della sezione corrente attiva sulla pagina singola.
	import HeroSection from '$lib/components/sections/HeroSection.svelte';
	import FavoritoSection from '$lib/components/sections/FavoritoSection.svelte';
	import InsoddisfattoSection from '$lib/components/sections/InsoddisfattoSection.svelte';
	import InfortunatoSection from '$lib/components/sections/InfortunatoSection.svelte';
	import { narrative } from '$lib/stores/narrative.svelte.js';
	import { trackScrollProgress } from '$lib/actions/trackScrollProgress.js';
</script>

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
