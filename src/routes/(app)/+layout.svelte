<script>
	import Navbar from '$lib/components/ui/Navbar.svelte';
	import { narrative } from '$lib/stores/narrative.svelte.js';
	import { page } from '$app/state';

	let { children } = $props();

	// Commento solo il PERCHÉ: Sincronizza lo store narrative all'avvio o al cambio rotta per determinare il comportamento della Navbar.
	$effect(() => {
		const path = page.url.pathname;
		if (path === '/') {
			narrative.activeSection = 'hero';
		} else {
			const section = path.split('/')[1];
			if (['favorito', 'insoddisfatto', 'infortunato', 'about'].includes(section)) {
				narrative.activeSection = section;
			}
		}
	});
</script>

<!-- hideByDefault calcolato direttamente dall'URL: corretto sia in SSR che in hydration, evita flash visibile→nascosta sulle pagine archetipo -->
<Navbar hideByDefault={['favorito', 'insoddisfatto', 'infortunato'].some(s => page.url.pathname.startsWith('/' + s))} />

{@render children()}
