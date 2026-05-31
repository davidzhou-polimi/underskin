<script>
	import Navbar from '$lib/components/navbar/Navbar.svelte';
	import { narrative } from '$lib/stores/narrative.svelte.js';

	let { children } = $props();
</script>

<Navbar hideByDefault={['favorito', 'insoddisfatto', 'infortunato'].includes(narrative.activeSection)} />

{@render children()}
