<script>
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { navbarSlide } from '$lib/actions/navbarSlide.js';
	let {
		hideThreshold = 50,
		showThreshold = 150,
		autoHideDelay = 2000,
		hideByDefault = false
	} = $props();

	let hidden = $state(false);

	// Commento solo il PERCHÉ: Resetta hidden a hideByDefault ad ogni cambio rotta (hideByDefault cambia quando page.url.pathname cambia nel layout).
	$effect(() => {
		hidden = hideByDefault;
	});

	let lastScrollY = 0;
	let isHovered = $state(false);
	let isFocused = $state(false);

	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let autoHideTimeout;

	const logoLabel = 'UnderSkin';

	// Rotte e ancore reali configurate per una navigazione cross-page fluida
	const links = [
		{ label: 'Home', sectionId: 'hero', path: '/' },
		{ label: 'About', sectionId: 'about', path: '/about' },
		{ label: 'Favorito', sectionId: 'favorito-profile-page', path: '/favorito' },
		{ label: 'Infortunato', sectionId: 'infortunato-profile-page', path: '/infortunato' },
		{ label: 'Insoddisfatto', sectionId: 'insoddisfatto-hero', path: '/insoddisfatto' },
	];

	/**
	 * Avvia il timer per nascondere automaticamente la navbar dopo un periodo di inattività
	 */
	const startAutoHideTimer = () => {
		clearTimeout(autoHideTimeout);
		/* Evita di nascondere la barra se l'utente la sta sorvolando con il mouse o la sta navigando con la tastiera */
		if (
			autoHideDelay <= 0 ||
			(!hideByDefault && window.scrollY <= 10) ||
			isHovered ||
			isFocused
		)
			return;
		autoHideTimeout = setTimeout(() => {
			hidden = true;
		}, autoHideDelay);
	};

	/**
	 * Gestione della navigazione o dello scorrimento dinamico in base alla pagina corrente
	 * @param {MouseEvent} event
	 * @param {{ label: string, sectionId: string, path: string }} link
	 */
	const handleNavClick = async (event, link) => {
		event.preventDefault();
		const currentPath = page.url.pathname;
		const isHome = currentPath === '/';

		// Intercetta e gestisce lo scorrimento se l'utente si trova già nella pagina corretta,
		// altrimenti esegue una navigazione client-side sicura tramite goto()
		if (currentPath === link.path || (link.path === '/' && isHome) || (link.path.startsWith('/#') && isHome)) {
			const target = document.getElementById(link.sectionId);
			if (target) {
				target.scrollIntoView({ behavior: 'smooth' });
			} else {
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}
		} else {
			await goto(link.path);
		}
	};

	/**
	 * Gestione dello scorrimento programmatico o navigazione per il logo (torna a inizio pagina se siamo sulla home, altrimenti naviga su /)
	 * @param {MouseEvent} e
	 */
	const handleLogoClick = async (e) => {
		const currentPath = page.url.pathname;
		if (currentPath === '/') {
			e.preventDefault();
			const target = document.getElementById('hero');
			if (target) {
				target.scrollIntoView({ behavior: 'smooth' });
			} else {
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}
		} else {
			await goto('/');
		}
	};

	/**
	 * Determina reattivamente se un link debba essere evidenziato come attivo
	 * @param {{ label: string, sectionId: string, path: string }} link
	 * @returns {boolean}
	 */
	const getIsActive = (link) => {
		// Commento solo il PERCHÉ: l'evidenziazione segue la rotta corrente. La home non traccia sotto-sezioni,
		// quindi non deve dipendere da scroll.activeSection, che resta valorizzato (e stantio) dalle pagine
		// con trackSection e provocherebbe un'evidenziazione errata al rientro nella home.
		return page.url.pathname === link.path;
	};

	onMount(() => {
		lastScrollY = window.scrollY;
		/** @type {ReturnType<typeof setTimeout> | undefined} */
		let scrollTimeout;
		let isMouseNearTop = false;
		/** @type {ReturnType<typeof setTimeout> | undefined} */
		let mouseRevealTimeout;

		const handleScroll = () => {
			const currentScrollY = window.scrollY;

			// Blocca visibile in prossimità del top della pagina a meno che non sia richiesto di nasconderla di default
			if (currentScrollY <= 10 && !hideByDefault) {
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

		/** @param {MouseEvent} e */
		const handleMouseMove = (e) => {
			const nearTop = e.clientY <= 30;
			if (nearTop) {
				if (!isMouseNearTop) {
					isMouseNearTop = true;
					clearTimeout(mouseRevealTimeout);
					if (hidden) {
						/* Richiede che il mouse stazioni vicino al bordo superiore prima di mostrare la navbar */
						mouseRevealTimeout = setTimeout(() => {
							hidden = false;
						}, 300);
					}
				}
			} else {
				if (isMouseNearTop) {
					isMouseNearTop = false;
					clearTimeout(mouseRevealTimeout);
					if (!hidden) {
						startAutoHideTimer();
					}
				}
			}
		};

		/** @param {WheelEvent} e */
		const handleWheel = (e) => {
			// Commento solo il PERCHÉ: Mostra la navbar se l'utente tenta di scrollare verso l'alto quando si trova già in cima alla pagina.
			if (window.scrollY <= 10 && e.deltaY < 0 && hidden) {
				hidden = false;
				startAutoHideTimer();
			}
		};

		let touchStartY = 0;
		/** @param {TouchEvent} e */
		const handleTouchStart = (e) => {
			touchStartY = e.touches[0].clientY;
		};

		/** @param {TouchEvent} e */
		const handleTouchMove = (e) => {
			// Commento solo il PERCHÉ: Rileva lo swipe verso il basso (scroll verso l'alto) quando la pagina è già al limite superiore.
			if (window.scrollY <= 10 && hidden) {
				const touchY = e.touches[0].clientY;
				if (touchY - touchStartY > 30) {
					hidden = false;
					startAutoHideTimer();
				}
			}
		};

		startAutoHideTimer();

		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('mousemove', handleMouseMove, { passive: true });
		window.addEventListener('wheel', handleWheel, { passive: true });
		window.addEventListener('touchstart', handleTouchStart, { passive: true });
		window.addEventListener('touchmove', handleTouchMove, { passive: true });

		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('wheel', handleWheel);
			window.removeEventListener('touchstart', handleTouchStart);
			window.removeEventListener('touchmove', handleTouchMove);
			clearTimeout(scrollTimeout);
			clearTimeout(mouseRevealTimeout);
			clearTimeout(autoHideTimeout);
		};
	});
</script>

{#snippet logo()}
	<button class="logo-nav" onclick={handleLogoClick} aria-label="UnderSkin home">
		{logoLabel}
	</button>
{/snippet}

{#snippet menu()}
	<div class="link-nav">
		{#each links as link}
			{@const isActive = getIsActive(link)}
			<button
				class="link-nav__item"
				class:link-nav__item--active={isActive}
				onclick={(e) => handleNavClick(e, link)}
			>
				{link.label}
			</button>
		{/each}
	</div>
{/snippet}

<!-- svelte-ignore a11y_no_redundant_roles -->
<header
	class="navbar"
	use:navbarSlide={{ hidden }}
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
	onfocusin={(e) => {
		const target = e.target;
		if (target instanceof Element && target.matches(':focus-visible')) {
			isFocused = true;
			hidden = false;
			clearTimeout(autoHideTimeout);
		}
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
		will-change: transform;
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
		color: var(--content-light-primary);
		text-decoration: none;
		transition: color var(--transition-duration-fast) var(--easing-standard);
		/* Commento solo il PERCHÉ: Applica il reset visivo per i pulsanti nativi mantenendo l'aspetto del logo originale */
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
		font-family: inherit;
		text-align: inherit;
	}

	.logo-nav:hover,
	.logo-nav:focus-visible {
		color: var(--content-light-secondary);
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
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
		font-family: inherit;
		font-weight: var(--text-nav-weight);
		color: var(--content-light-primary);
		text-decoration: none;
		transition:
			color var(--transition-duration-fast) var(--easing-standard),
			font-weight var(--transition-duration-fast) var(--easing-standard);
	}

	.link-nav__item:hover,
	.link-nav__item:focus-visible {
		color: var(--content-light-secondary);
	}

	.link-nav__item--active {
		font-weight: var(--text-nav-active-weight);
	}
</style>
