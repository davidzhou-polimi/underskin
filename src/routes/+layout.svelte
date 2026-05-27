<script>
    import 'modern-normalize/modern-normalize.css';
    import '$lib/styles/tokens.css';
	import favicon from '$lib/assets/favicon.svg';

    import PerformanceSection from '$lib/components/sections/PerformanceSection.svelte';


	let { children } = $props();
</script>

<PerformanceSection />

<svelte:head>
    <title>UnderSkin</title>
    <meta name="description" content="Descrizione" />

    <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
