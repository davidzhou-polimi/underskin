<script>
    import 'modern-normalize/modern-normalize.css';
	import '$lib/styles/tokens.css';
	import favicon from '$lib/assets/favicon.svg';
    import Navbar from '$lib/components/navbar/Navbar.svelte';
    import InteractiveGradient from '$lib/components/ui/InteractiveGradient.svelte';

	let { children } = $props();
</script>

<svelte:head>
    <title>UnderSkin</title>
    <meta name="description" content="Descrizione" />

    <link rel="icon" href={favicon} />
</svelte:head>

<InteractiveGradient />

<Navbar />

{@render children()}
