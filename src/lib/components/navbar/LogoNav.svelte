<script>
	const label = 'UnderSkin';
</script>

<a class="logo-nav" href="/" aria-label="UnderSkin home">
	{label}
</a>

<style>
	.logo-nav {
		display: inline-flex;
		align-items: flex-end;
		justify-content: flex-start;
		height: var(--spacing-7);
		font-size: var(--text-l);
		font-weight: var(--text-footer-weight);
		color: var(--content-primary);
		text-decoration: none;
		transition: color 160ms ease;
	}

	.logo-nav:hover,
	.logo-nav:focus-visible {
		color: var(--content-secondary);
	}
</style>