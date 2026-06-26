<script>
	import Navbar from '$lib/components/ui/Navbar.svelte';

	let { children } = $props();
</script>

<!-- hideByDefault impostato a true per nascondere di default la navbar su tutte le pagine -->
<Navbar hideByDefault={true} />

{@render children()}
