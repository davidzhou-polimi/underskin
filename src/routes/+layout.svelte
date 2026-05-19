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

    <!-- Font Rethink Sans via Bunny Fonts (GDPR-compliant) -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=rethink-sans:ital,wght@0,400..800;1,400..800&display=swap" rel="stylesheet" />
</svelte:head>

{@render children()}
