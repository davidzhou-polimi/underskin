<script>
	import { onMount } from 'svelte';
	import { scroll } from '$lib/stores/scroll.svelte.js';

	let { hideThreshold = 50, showThreshold = 150, autoHideDelay = 5000 } = $props();

	let hidden = $state(false);
	let lastScrollY = 0;
	let isHovered = $state(false);
	let isFocused = $state(false);


	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let autoHideTimeout;

	/**
	 * Avvia il timer per nascondere automaticamente la navbar dopo un periodo di inattività
	 */
	const startAutoHideTimer = () => {
		clearTimeout(autoHideTimeout);
		/* Evita di nascondere la barra se l'utente la sta sorvolando con il mouse o la sta navigando con la tastiera */
		if (autoHideDelay <= 0 || window.scrollY <= 10 || isHovered || isFocused) return;
		autoHideTimeout = setTimeout(() => {
			hidden = true;
		}, autoHideDelay);
	};

	const logoLabel = 'UnderSkin';
	const links = [
		{ label: 'Home', sectionId: 'hero' },
		{ label: 'About', sectionId: 'about' },
		{ label: "L'insoddisfatto", sectionId: 'insoddisfatto' },
		{ label: 'Il favorito', sectionId: 'favorito' },
		{ label: "L'infortunato", sectionId: 'infortunato' }
	];

	/**
	 * Gestione dello scorrimento programmatico senza alterare l'URL
	 * @param {MouseEvent} e
	 * @param {string} sectionId
	 */
	const handleNavClick = (e, sectionId) => {
		e.preventDefault();
		const target = document.getElementById(sectionId);
		if (target) {
			target.scrollIntoView({ behavior: 'smooth' });
		}
	};

	onMount(() => {
		lastScrollY = window.scrollY;
		/** @type {ReturnType<typeof setTimeout> | undefined} */
		let scrollTimeout;

		const handleScroll = () => {
			const currentScrollY = window.scrollY;

			// Blocca visibile in prossimità del top della pagina
			if (currentScrollY <= 10) {
				hidden = false;
				lastScrollY = currentScrollY;
				clearTimeout(autoHideTimeout);
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

			if (!hidden) {
				startAutoHideTimer();
			} else {
				clearTimeout(autoHideTimeout);
			}

			clearTimeout(scrollTimeout);
			/* Evita l'accumulo di scroll parziali quando l'utente interrompe il movimento senza superare la soglia */
			scrollTimeout = setTimeout(() => {
				lastScrollY = window.scrollY;
			}, 150);
		};

		startAutoHideTimer();

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', handleScroll);
			clearTimeout(scrollTimeout);
			clearTimeout(autoHideTimeout);
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
			{@const isActive = scroll.activeSection === link.sectionId}
			<a 
				class="link-nav__item" 
				class:link-nav__item--active={isActive}
				href={`#${link.sectionId}`}
				onclick={(e) => handleNavClick(e, link.sectionId)}
			>
				{link.label}
			</a>
		{/each}
	</div>
{/snippet}

<!-- svelte-ignore a11y_no_redundant_roles -->
<header 
	class:hidden 
	class="navbar"
	role="banner"
	onmouseenter={() => {
		isHovered = true;
		clearTimeout(autoHideTimeout);
	}}
	onmouseleave={() => {
		isHovered = false;
		if (!hidden) {
			startAutoHideTimer();
		}
	}}
	onfocusin={() => {
		isFocused = true;
		hidden = false;
		clearTimeout(autoHideTimeout);
	}}
	onfocusout={() => {
		isFocused = false;
		if (!hidden) {
			startAutoHideTimer();
		}
	}}
>
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
		/* Transizione per l'ingresso (veloce) */
		transition: transform var(--transition-duration-normal) var(--easing-out);
		will-change: transform;
	}

	.navbar.hidden {
		/* Transizione per l'uscita (lenta) */
		transition-duration: var(--transition-duration-slow);
		transition-timing-function: var(--easing-in);
		transform: translateY(-100%);
	}

	.navbar__inner {
		display: flex;
		align-items: center;
		width: 100%;
		min-height: var(--spacing-7);
		padding-block: var(--spacing-3);
		padding-inline: var(--spacing-6);
		pointer-events: auto;
	}

	/* Logo */
	.logo-nav {
		display: inline-flex;
		align-items: center;
		justify-content: flex-start;
		height: var(--spacing-7);
		font-size: var(--text-logo-size);
		font-weight: var(--text-logo-weight);
		color: var(--content-primary);
		text-decoration: none;
		transition: color var(--transition-duration-fast) var(--easing-standard);
	}

	.logo-nav:hover,
	.logo-nav:focus-visible {
		color: var(--content-secondary);
	}

	/* Menu Links */
	.link-nav {
		display: flex;
		align-items: center;
		gap: var(--spacing-4);
		margin-inline-start: auto;
	}

	.link-nav__item {
		display: inline-flex;
		align-items: center;
		font-size: var(--text-nav-size);
		font-weight: var(--text-nav-weight);
		color: var(--content-primary);
		text-decoration: none;
		transition: color var(--transition-duration-fast) var(--easing-standard);
	}

	.link-nav__item:hover,
	.link-nav__item:focus-visible {
		color: var(--content-secondary);
	}

	.link-nav__item--active {
		font-weight: var(--text-nav-active-weight);
	}
</style>