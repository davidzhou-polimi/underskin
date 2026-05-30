<script>
	import { onMount } from 'svelte';
	import { scroll } from '$lib/stores/scroll.svelte.js';

	let { hideThreshold = 15, showThreshold = 15 } = $props();

	let hidden = $state(false);
	let lastScrollY = 0;

	const logoLabel = 'UnderSkin';
	const links = [
		{ label: 'home', href: '/#home' },
		{ label: 'about', href: '/#about' },
		{ label: "l'insoddisfatto", href: '/#l-insoddisfatto' },
		{ label: 'il favorito', href: '/#il-favorito' },
		{ label: "l'infortunato", href: '/#l-infortunato' }
	];

	onMount(() => {
		lastScrollY = window.scrollY;

		const handleScroll = () => {
			const currentScrollY = window.scrollY;

			// Blocca visibile in prossimità del top della pagina
			if (currentScrollY <= 10) {
				hidden = false;
				lastScrollY = currentScrollY;
				return;
			}

			const delta = currentScrollY - lastScrollY;

			if (delta > hideThreshold) {
				hidden = true;
				lastScrollY = currentScrollY;
			} else if (delta < -showThreshold) {
				hidden = false;
				lastScrollY = currentScrollY;
			}
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

{#snippet logo()}
	<a class="logo-nav" href="/" aria-label="UnderSkin home">
		{logoLabel}
	</a>
{/snippet}

{#snippet menu()}
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
{/snippet}

<header class:hidden class="navbar">
	<nav class="navbar__inner" aria-label="Primary">
		{@render logo()}
		{@render menu()}
	</nav>
</header>

<style>
	.navbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 10;
		pointer-events: none;
		background: transparent;
		transform: translateY(0);
		transition: transform var(--transition-duration-normal) var(--transition-easing-default);
		will-change: transform;
	}

	.navbar.hidden {
		transform: translateY(-100%);
	}

	.navbar__inner {
		display: flex;
		align-items: flex-end;
		width: 100%;
		min-height: var(--spacing-7);
		padding-block-start: var(--spacing-3);
		padding-inline-start: var(--spacing-10);
		padding-inline-end: var(--spacing-10);
		pointer-events: auto;
	}

	/* Logo */
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

	/* Menu Links */
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