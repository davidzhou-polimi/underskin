<script>
	import Navbar from '$lib/components/navbar/Navbar.svelte';
    import InteractiveGradient from '$lib/components/ui/InteractiveGradient.svelte';

	let { children } = $props();
</script>

<Navbar />
<InteractiveGradient />

{@render children()}
