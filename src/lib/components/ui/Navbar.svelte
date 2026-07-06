<script>
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { navbarSlide } from '$lib/actions/navbarSlide.js';
	import { getLenis, lockScroll, unlockScroll } from '$lib/stores/lenis.svelte.js';
	import { media } from '$lib/stores/mediaQuery.svelte.js';

	/**
	 * Scroll morbido via Lenis con fallback nativo (reduced-motion non istanzia Lenis).
	 * Accetta un ID stringa (grezzo, senza '#'), un HTMLElement, o un numero (posizione Y).
	 * @param {number | string | HTMLElement} target
	 */
	function smoothScrollTo(target) {
		const lenis = getLenis();
		// Risolve l'ID grezzo prima di passarlo a Lenis, che accetta solo selettori CSS (es. '#hero')
		const element = typeof target === 'string'
			? document.getElementById(target)
			: target;

		if (lenis) {
			lenis.scrollTo(element ?? 0);
		} else if (element instanceof HTMLElement) {
			element.scrollIntoView({ behavior: 'smooth' });
		} else {
			window.scrollTo({ top: typeof target === 'number' ? target : 0, behavior: 'smooth' });
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
	// Commento solo il PERCHÉ: mentre la barra sta scorrendo, i tocchi sull'hamburger vanno ignorati, così
	// non si apre il menu con la navbar a metà slide (che mostrerebbe l'overlay "scendere" con l'header).
	let isNavbarSliding = $state(false);

	// Commento solo il PERCHÉ: stato iniziale = hideByDefault su ogni piattaforma; mobile e desktop
	// condividono lo stesso comportamento di auto-hide (nessuna eccezione che tenga la barra visibile).
	$effect(() => {
		hidden = hideByDefault;
	});

	// Commento solo il PERCHÉ: rileva il passaggio da mobile a desktop (es. ridimensionando la finestra)
	// e chiude automaticamente il menu mobile se aperto, per evitare che rimanga un overlay orfano.
	$effect(() => {
		if (!media.isMobile && isMenuOpen) {
			isMenuOpen = false;
		}
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

	// Commento solo il PERCHÉ: unico punto che nasconde la barra, così l'invariante "a menu aperto non si
	// nasconde" vive in un solo posto invece che sparsa tra timer e scroll handler.
	const requestHide = () => {
		if (!isMenuOpen) hidden = true;
	};

	/**
	 * Avvia il timer per nascondere automaticamente la navbar dopo un periodo di inattività
	 */
	const startAutoHideTimer = () => {
		clearTimeout(autoHideTimeout);
		/* Evita di nascondere la barra se il menu è aperto, se l'utente la sta sorvolando col mouse o la sta navigando con la tastiera */
		if (
			autoHideDelay <= 0 ||
			isMenuOpen ||
			window.scrollY <= 10 ||
			isHovered ||
			isFocused
		)
			return;
		autoHideTimeout = setTimeout(requestHide, autoHideDelay);
	};

	// Commento solo il PERCHÉ: a menu aperto blocca lo scroll di sfondo (Lenis) e ferma ogni hide in coda;
	// alla chiusura riprende l'auto-hide, così la barra torna a nascondersi come su desktop.
	$effect(() => {
		if (isMenuOpen) {
			lockScroll();
			clearTimeout(autoHideTimeout);
		} else {
			unlockScroll();
			startAutoHideTimer();
		}
		return () => unlockScroll();
	});

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
			smoothScrollTo(link.sectionId);
		} else {
			await goto(link.path);
		}
	};

	/**
	 * Apre/chiude il menu mobile. Durante lo slide della barra ignora solo l'apertura (per non aprire il
	 * menu a metà slide), mai la chiusura. Il lock scroll e il riavvio dell'auto-hide sono gestiti
	 * dall'$effect su isMenuOpen.
	 */
	const toggleMenu = () => {
		if (!isMenuOpen && isNavbarSliding) return;
		isMenuOpen = !isMenuOpen;
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
			smoothScrollTo('hero');
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
		// Garantisce che la navbar sia visibile se la pagina si apre già in cima, indipendentemente da hideByDefault.
		if (window.scrollY <= 10) hidden = false;
		/** @type {ReturnType<typeof setTimeout> | undefined} */
		let scrollTimeout;
		let isMouseNearTop = false;
		/** @type {ReturnType<typeof setTimeout> | undefined} */
		let mouseRevealTimeout;
		// Throttle dello scroll tramite rAF: al massimo un'esecuzione per frame di rendering,
		// senza valori arbitrari — la frequenza si adatta automaticamente al refresh rate del display.
		let scrollRafId = 0;

		const handleScroll = () => {
			if (scrollRafId) return;
			scrollRafId = requestAnimationFrame(() => {
				scrollRafId = 0;
				const currentScrollY = window.scrollY;

				// Commento solo il PERCHÉ: in cima alla pagina la navbar rimane sempre visibile, su qualunque dispositivo.
				if (currentScrollY <= 10) {
					hidden = false;
					lastScrollY = currentScrollY;
					clearTimeout(autoHideTimeout);
					return;
				}

				const delta = currentScrollY - lastScrollY;

				if (delta > hideThreshold) {
					requestHide();
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
			});
		};

		/** @param {MouseEvent} e */
		const handleMouseMove = (e) => {
			// Commento solo il PERCHÉ: il reveal col mouse vicino al bordo è un'affordance desktop; su mobile
			// il tap emula un mousemove che altrimenti falserebbe lo stato di prossimità al bordo.
			if (media.isMobile) return;
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

		// Commento solo il PERCHÉ: swipe verso il basso dal bordo superiore per far riapparire la navbar
		// nascosta a metà pagina. Serve un listener in capture non-passive: è la sola via per rilevare e
		// insieme sopprimere lo scroll di un gesto discreto (le helper direzionali dello store bloccano la
		// direzione opposta). stopPropagation batte Lenis, che ascolta in fase bubble.
		const EDGE_BAND = 40; // px dal bordo superiore in cui il gesto è valido
		const REVEAL_DELTA = 30; // px di trascinamento giù per far scattare il reveal
		let touchStartY = 0;
		let edgePull = false;

		/** @param {TouchEvent} e */
		const handleTouchStart = (e) => {
			if (!media.isMobile) return;
			touchStartY = e.touches[0].clientY;
			edgePull = touchStartY <= EDGE_BAND && hidden;
		};

		/** @param {TouchEvent} e */
		const handleTouchMove = (e) => {
			if (!edgePull) return;
			const dy = e.touches[0].clientY - touchStartY;
			if (dy > 0) {
				e.preventDefault();
				e.stopPropagation();
			}
			if (dy > REVEAL_DELTA && hidden) {
				hidden = false;
				startAutoHideTimer();
			}
		};

		const handleTouchEnd = () => {
			edgePull = false;
		};

		// Commento solo il PERCHÉ: l'auto-hide iniziale è già avviato dall'$effect su isMenuOpen al mount.

		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('mousemove', handleMouseMove, { passive: true });
		window.addEventListener('wheel', handleWheel, { passive: true });
		window.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
		window.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
		window.addEventListener('touchend', handleTouchEnd, { passive: true, capture: true });

		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('wheel', handleWheel);
			window.removeEventListener('touchstart', handleTouchStart, { capture: true });
			window.removeEventListener('touchmove', handleTouchMove, { capture: true });
			window.removeEventListener('touchend', handleTouchEnd, { capture: true });
			cancelAnimationFrame(scrollRafId);
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
	use:navbarSlide={{ hidden, onAnimating: (v) => (isNavbarSliding = v) }}
	role="banner"
	onmouseenter={() => {
		// Commento solo il PERCHÉ: su mobile il tap emula mouseenter e terrebbe isHovered=true (bloccando
		// l'auto-hide) finché non si tocca altrove; l'hover-hold è un comportamento solo desktop.
		if (media.isMobile) return;
		isHovered = true;
		clearTimeout(autoHideTimeout);
	}}
	onmouseleave={() => {
		if (media.isMobile) return;
		isHovered = false;
		if (!hidden) {
			startAutoHideTimer();
		}
	}}
	onfocusin={(e) => {
		// Commento solo il PERCHÉ: su mobile non c'è motivo di sostare sulla navbar (le voci sono nel
		// menu a parte), quindi l'hold da focus vale solo desktop; su mobile la barra torna a nascondersi.
		if (media.isMobile) return;
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
			onclick={toggleMenu}
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
