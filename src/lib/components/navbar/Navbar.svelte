<script>
	import LogoNav from './LogoNav.svelte';
</script>

<header class="navbar">
	<nav class="navbar__inner" aria-label="Primary">
		<LogoNav />
	</nav>
</header>

<style>
	.navbar {
		position: absolute;
		inset: 0 0 auto 0;
		z-index: 10;
		pointer-events: none;
	}

	.navbar__inner {
		display: flex;
		align-items: center;
		min-height: var(--spacing-7);
		padding-block-start: var(--spacing-3);
		padding-inline-start: var(--spacing-10);
		padding-inline-end: var(--spacing-2);
		pointer-events: auto;
	}
</style>