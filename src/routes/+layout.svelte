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
    

    <!-- Font Rethink sans-->
<link rel="preconnect" href="https://fonts.bunny.net/">
<link rel="preconnect" href="https://fonts.bunny.net/" crossorigin>
<link href="https://fonts.bunny.net//css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Literata:ital,opsz,wght@0,7..72,200..900;1,7..72,200..900&family=Manrope:wght@200..800&family=Rethink+Sans:ital,wght@0,400..800;1,400..800&display=swap" rel="stylesheet">
</svelte:head>

{@render children()}
