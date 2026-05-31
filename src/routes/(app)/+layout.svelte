<script>
	import Navbar from '$lib/components/navbar/Navbar.svelte';

	let { children } = $props();
</script>

<Navbar />

{@render children()}
