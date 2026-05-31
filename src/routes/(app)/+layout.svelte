<script>
	import Navbar from '$lib/components/navbar/Navbar.svelte';
    import InteractiveGradient from '$lib/components/ui/InteractiveGradient.svelte';

	let { children } = $props();
</script>

<Navbar />
<InteractiveGradient config={{ coverage: 0.3, maskClamp: [0.0, 0.7] }} />

{@render children()}
