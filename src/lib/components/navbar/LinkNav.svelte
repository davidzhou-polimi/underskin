<script>
	const links = [
		{ label: 'home', href: '/#home' },
		{ label: 'about', href: '/#about' },
		{ label: "l'insoddisfatto", href: '/#l-insoddisfatto' },
		{ label: 'il favorito', href: '/#il-favorito' },
		{ label: "l'infortunato", href: '/#l-infortunato' }
	];
</script>

<nav class="link-nav" aria-label="Section links">
	{#each links as link}
		<a class="link-nav__item" href={link.href}>
			{link.label}
		</a>
	{/each}
</nav>

<style>
	.link-nav {
		display: flex;
		align-items: flex-end;
		gap: var(--spacing-3);
		margin-inline-start: auto;
	}

	.link-nav__item {
		display: inline-flex;
		align-items: flex-end;
		font-size: var(--text-xs);
		font-weight: var(--text-intro-card-weight);
		color: var(--content-primary);
		text-decoration: none;
		transition: color 160ms ease;
	}

	.link-nav__item:hover,
	.link-nav__item:focus-visible {
		color: var(--content-secondary);
	}

	.link-nav__item:focus-visible {
		outline: none;
	}
</style>