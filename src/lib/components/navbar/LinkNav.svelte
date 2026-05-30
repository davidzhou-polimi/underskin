<script>
	import { scroll } from '$lib/stores/scroll.svelte.js';

	const links = [
		{ label: 'home', href: '/#home' },
		{ label: 'about', href: '/#about' },
		{ label: "l'insoddisfatto", href: '/#l-insoddisfatto' },
		{ label: 'il favorito', href: '/#il-favorito' },
		{ label: "l'infortunato", href: '/#l-infortunato' }
	];
</script>

<div class="link-nav">
	{#each links as link}
		{@const isActive = link.href.includes('#') ? scroll.activeSection === link.href.split('#')[1] : false}
		<a 
			class="link-nav__item" 
			class:link-nav__item--active={isActive}
			href={link.href}
		>
			{link.label}
		</a>
	{/each}
</div>

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
		font-size: var(--text-nav-size);
		font-weight: var(--text-nav-weight);
		color: var(--content-primary);
		text-decoration: none;
		transition: color var(--transition-duration-fast) var(--transition-easing-default);
	}

	.link-nav__item:hover,
	.link-nav__item:focus-visible {
		color: var(--content-secondary);
	}

	.link-nav__item--active {
		font-weight: var(--text-nav-active-weight);
	}
</style>