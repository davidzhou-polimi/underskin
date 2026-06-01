<script>
    import 'modern-normalize/modern-normalize.css';
    import '$lib/styles/tokens.css';
    import favicon from '$lib/assets/favicon.svg';

    let { children } = $props();
</script>

<svelte:head>
	<title>UnderSkin</title>
	<meta name="description" content="Descrizione" />

	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}