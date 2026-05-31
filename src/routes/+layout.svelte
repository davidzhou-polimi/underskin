<script>
	import Navbar from '$lib/components/navbar/Navbar.svelte';
	import 'modern-normalize/modern-normalize.css';
	import '$lib/styles/tokens.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<title>UnderSkin</title>
	<meta name="description" content="UnderSkin — Digital project exploring the psychological dimensions of high-level athletic performance." />

	<link rel="icon" href={favicon} />

	<!-- Font Satoshi -->
	<link rel="preconnect" href="https://api.fontshare.com" />
	<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap" rel="stylesheet" />

	<!-- Font Rethink Sans -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Rethink+Sans:ital,wght@0,400..800;1,400..800&display=swap" rel="stylesheet" />
</svelte:head>

<Navbar />

<main class="global-layout">
	{@render children()}
</main>

<style>
	:global(html),
	:global(body) {
		margin: 0;
		padding: 0;
		width: 100%;
		min-height: 100vh;
		background-color: var(--background-primary, #f1fafd);
		color: var(--content-primary, #071e45);
		font-family: 'Rethink Sans', sans-serif;
		overflow-x: hidden;
		-webkit-font-smoothing: antialiased;
	}

	.global-layout {
		display: flex;
		flex-direction: column;
		width: 100%;
		min-height: 100vh;
		padding-top: 0;
		box-sizing: border-box;
	}
</style>
