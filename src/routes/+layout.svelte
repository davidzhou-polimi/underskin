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

    <!-- Font Satoshi -->
    <link rel="preconnect" href="https://api.fontshare.com" />
    <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap" rel="stylesheet" />
</svelte:head>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
	:global(*) {
		box-sizing: border-box;
	}
</style>

{@render children()}
