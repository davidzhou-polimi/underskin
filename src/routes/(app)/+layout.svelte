<script>
	import Navbar from '$lib/components/navbar/Navbar.svelte';
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

<Navbar hideByDefault={['favorito', 'insoddisfatto', 'infortunato'].includes(narrative.activeSection)} />

{@render children()}
