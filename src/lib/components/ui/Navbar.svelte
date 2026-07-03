<script>
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { navbarSlide } from '$lib/actions/navbarSlide.js';
	import { getLenis, lockScroll, unlockScroll } from '$lib/stores/lenis.svelte.js';
	import { media } from '$lib/stores/mediaQuery.svelte.js';

	/**
	 * Scroll morbido via Lenis con fallback nativo (reduced-motion non istanzia Lenis).
	 * @param {number | HTMLElement} target
	 */
	function smoothScrollTo(target) {
		const lenis = getLenis();
		if (lenis) {
			lenis.scrollTo(target);
		} else if (typeof target === 'number') {
			window.scrollTo({ top: target, behavior: 'smooth' });
		} else {
			target.scrollIntoView({ behavior: 'smooth' });
		}
	}
	let {
		hideThreshold = 50,
		showThreshold = 150,
		autoHideDelay = 2000,
		hideByDefault = false
	} = $props();

	let hidden = $state(false);
	let isMenuOpen = $state(false);

	// Commento solo il PERCHÉ: Resetta hidden a hideByDefault ad ogni cambio rotta,
	// ma su mobile forza la navbar visibile all'avvio (hidden = false) per preservarne la visibilità in cima
	$effect(() => {
		if (media.isMobile) {
			hidden = false;
		} else {
			hidden = hideByDefault;
		}
	});

	// Commento solo il PERCHÉ: blocca o sblocca lo scorrimento della pagina di sfondo (Lenis)
	// a seconda che l'overlay del menu mobile sia aperto o chiuso, garantendo un'interazione pulita.
	$effect(() => {
		if (isMenuOpen) {
			lockScroll();
		} else {
			unlockScroll();
		}
		return () => {
			unlockScroll();
		};
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
			((media.isMobile || !hideByDefault) && window.scrollY <= 10) ||
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
				smoothScrollTo(target);
			} else {
				smoothScrollTo(0);
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
		isMenuOpen = false; // Chiude il menu mobile se l'utente clicca sul logo
		const currentPath = page.url.pathname;
		if (currentPath === '/') {
			e.preventDefault();
			const target = document.getElementById('hero');
			if (target) {
				smoothScrollTo(target);
			} else {
				smoothScrollTo(0);
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
		// Commento solo il PERCHÉ: la navigazione è per-pagina, quindi l'evidenziazione segue la rotta corrente.
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

			// Commento solo il PERCHÉ: su mobile o quando hideByDefault è disattivo,
			// forza la navbar visibile quando si è vicini alla cima dello schermo (scrollY <= 10)
			if (currentScrollY <= 10 && (media.isMobile || !hideByDefault)) {
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
		
		<div class="desktop-menu-wrapper">
			{@render menu()}
		</div>

		<button
			class="menu-toggle-btn"
			onclick={() => isMenuOpen = !isMenuOpen}
			aria-expanded={isMenuOpen}
			aria-label={isMenuOpen ? "Chiudi menu" : "Apri menu"}
		>
			<svg class:is-active={!isMenuOpen} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
				<line x1="3" y1="6" x2="21" y2="6"></line>
				<line x1="3" y1="12" x2="21" y2="12"></line>
				<line x1="3" y1="18" x2="21" y2="18"></line>
			</svg>
			<svg class:is-active={isMenuOpen} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		</button>
	</nav>

	<!-- Commento solo il PERCHÉ: overlay a tutto schermo per ospitare la navigazione verticale mobile 
	     in linea con lo stile grafico mostrato nello screenshot -->
	<div class="mobile-menu-overlay" class:is-open={isMenuOpen} aria-hidden={!isMenuOpen}>
		<div class="mobile-menu-header"></div>
		<div class="mobile-menu-links fade-reveal" class:is-active={isMenuOpen}>
			{#each links as link}
				{@const isActive = getIsActive(link)}
				<button
					class="mobile-nav-item"
					class:mobile-nav-item--active={isActive}
					onclick={(e) => {
						isMenuOpen = false;
						handleNavClick(e, link);
					}}
				>
					{link.label}
				</button>
			{/each}
		</div>
	</div>
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
		/* Commento solo il PERCHÉ: mantiene logo e pulsante di toggle in primo piano rispetto 
		   all'overlay del menu mobile (che ha z-index 999), garantendo interattività e visibilità */
		position: relative;
		z-index: 1000;
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

	/* Commento solo il PERCHÉ: display:contents dissolve il box del wrapper su desktop, così
	   .link-nav torna figlio diretto della flex-row .navbar__inner e il suo margin-inline-start:auto
	   riprende a spingere il menu a destra. Su mobile il @media lo porta a display:none. */
	.desktop-menu-wrapper {
		display: contents;
	}

	/* Pulsante Menu Mobile */
	.menu-toggle-btn {
		display: none;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		place-items: center;
		width: 32px;
		height: 32px;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0;
		z-index: 5;
		color: var(--content-light-primary);
	}

	/* Commento solo il PERCHÉ: sovrappone i due SVG (hamburger e close) nella stessa cella del CSS Grid 
	   e ne gestisce la visibilità reciproca con un semplice effetto di dissolvenza incrociata (cross-fade) */
	.menu-toggle-btn svg {
		grid-column: 1;
		grid-row: 1;
		opacity: 0;
		transition: opacity var(--transition-duration-normal) var(--easing-standard);
	}

	.menu-toggle-btn svg.is-active {
		opacity: 1;
	}

	/* Overlay Mobile */
	.mobile-menu-overlay {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		/* Commento solo il PERCHÉ: imposta l'effetto ghiaccio semitrasparente azzurrato del brand */
		background-color: rgb(from var(--background-primary) r g b / 0.85);
		backdrop-filter: blur(12px);
		z-index: 999;
		display: flex;
		flex-direction: column;
		/* Commento solo il PERCHÉ: allinea il padding orizzontale a spacing-6 e verticale a spacing-3, 
		   esattamente identico a quello della navbar chiusa per eliminare ogni layout shift */
		padding: var(--spacing-3) var(--spacing-6) var(--spacing-10);
		box-sizing: border-box;
		opacity: 0;
		visibility: hidden;
		transition:
			opacity var(--transition-duration-slow) var(--easing-standard),
			visibility var(--transition-duration-slow) var(--easing-standard);
		pointer-events: none;
	}

	.mobile-menu-overlay.is-open {
		opacity: 1;
		visibility: visible;
		pointer-events: auto;
	}

	.mobile-menu-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		min-height: var(--spacing-7);
		/* Commento solo il PERCHÉ: distanzia maggiormente il blocco dei link dall'header 
		   dando respiro al layout verticale come richiesto dallo screenshot */
		margin-bottom: var(--spacing-12);
	}


	.mobile-menu-links {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		/* Commento solo il PERCHÉ: crea un'ampia spaziatura verticale tra le varie voci 
		   di menu per garantire leggibilità ed evitare click accidentali su mobile */
		gap: var(--spacing-6);
		width: 100%;
		/* Commento solo il PERCHÉ: azzera il padding orizzontale per far sì che i link 
		   siano perfettamente allineati in verticale con il logo in alto, come nel mockup */
		padding-inline-start: 0;
		/* Commento solo il PERCHÉ: personalizza i parametri della transizione fade-reveal per coordinare 
		   la velocità dell'animazione con quella dell'overlay e intensificare la sfocatura delle voci */
		--fade-duration: var(--transition-duration-slow);
		--fade-blur: 8px;
	}

	.mobile-nav-item {
		background: transparent;
		border: none;
		font-family: var(--font-family-base);
		/* Commento solo il PERCHÉ: adotta un carattere molto grande (36px) e peso 
		   standard (500) del menu come da comportamento desktop */
		font-size: var(--text-xl);
		font-weight: var(--text-nav-weight);
		color: var(--content-light-primary);
		text-align: left;
		padding: 0;
		cursor: pointer;
	}

	.mobile-nav-item--active {
		/* Commento solo il PERCHÉ: cambia unicamente di peso (700) nello stato attivo 
		   corrispondente al comportamento di selezione del menu desktop */
		font-weight: var(--text-nav-active-weight);
	}

	@media (max-width: 768px) {
		.navbar__inner {
			/* Commento solo il PERCHÉ: su mobile la navbar chiusa ha lo sfondo trasparente 
			   e non ha bordi, lasciando visibili i contenuti retrostanti come richiesto */
			padding-block: var(--spacing-3);
		    padding-inline: var(--spacing-6);
			justify-content: space-between;
			background-color: transparent;
			border-bottom: none;
			backdrop-filter: none;
		}

		.desktop-menu-wrapper {
			display: none;
		}

		.menu-toggle-btn {
			display: grid;
			color: var(--content-light-primary);
		}

		.logo-nav {
			/* Commento solo il PERCHÉ: imposta la dimensione a 24px ed il colore tramite token */
			font-size: var(--text-l);
			color: var(--content-light-primary);
		}
	}
</style>
