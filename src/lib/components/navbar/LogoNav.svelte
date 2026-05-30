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
		font-size: var(--text-logo-size);
		font-weight: var(--text-logo-weight);
		color: var(--content-primary);
		text-decoration: none;
		transition: color var(--transition-duration-fast) var(--transition-easing-default);
	}

	.logo-nav:hover,
	.logo-nav:focus-visible {
		color: var(--content-secondary);
	}
</style>