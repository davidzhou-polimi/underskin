<script>
    import { onMount } from "svelte";
    import { scroll } from "$lib/stores/scroll.svelte.js";
    import { narrative } from "$lib/stores/narrative.svelte.js";

    let {
        hideThreshold = 50,
        showThreshold = 150,
        autoHideDelay = 3000,
        hideByDefault = false,
    } = $props();

    let hidden = $state(false);

    // Commento solo il PERCHÉ: Assicura che la barra si adegui immediatamente al comportamento richiesto dalla sezione corrente attiva.
    $effect(() => {
        hidden = hideByDefault;
    });

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

    const logoLabel = "UnderSkin";
    const links = [
        { label: "Home", sectionId: "hero" },
        { label: "About", sectionId: "about" },
        { label: "Favorito", sectionId: "favorito" },
        { label: "Insoddisfatto", sectionId: "insoddisfatto" },
        { label: "Infortunato", sectionId: "infortunato" },
    ];

    // Commento solo il PERCHÉ: Cambia la sezione attiva nello store narrative se la sezione fa parte dei rami
    // a bivi o della home (hero), altrimenti effettua lo scroll per le altre sezioni statiche.
    /** @param {string} sectionId */
    const handleNavClick = (sectionId) => {
        if (
            ["hero", "favorito", "insoddisfatto", "infortunato"].includes(
                sectionId,
            )
        ) {
            narrative.activeSection = sectionId;
        } else {
            const target = document.getElementById(sectionId);
            if (target) {
                target.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    // Commento solo il PERCHÉ: Consente di tornare alla Home (Hero) reimpostando lo stato attivo nello store.
    /** @param {MouseEvent} e */
    const handleLogoClick = (e) => {
        e.preventDefault();
        narrative.activeSection = "hero";
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

        startAutoHideTimer();

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("mousemove", handleMouseMove, {
            passive: true,
        });
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("mousemove", handleMouseMove);
            clearTimeout(scrollTimeout);
            clearTimeout(mouseRevealTimeout);
            clearTimeout(autoHideTimeout);
        };
    });
</script>

{#snippet logo()}
    <a
        class="logo-nav"
        href="/"
        onclick={handleLogoClick}
        aria-label="UnderSkin home"
    >
        {logoLabel}
    </a>
{/snippet}

{#snippet menu()}
    <div class="link-nav">
        {#each links as link}
            {@const isActive = narrative.activeSection === link.sectionId}
            <button
                type="button"
                class="link-nav__item"
                class:link-nav__item--active={isActive}
                onclick={() => handleNavClick(link.sectionId)}
            >
                {link.label}
            </button>
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
    onfocusin={(e) => {
        const target = e.target;
        if (target instanceof Element && target.matches(":focus-visible")) {
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
        transform: translateY(0);
        /* Transizione per l'ingresso (veloce) */
        transition: transform var(--transition-duration-normal)
            var(--easing-out);
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
        color: var(--content-light-primary);
        text-decoration: none;
        transition: color var(--transition-duration-fast) var(--easing-standard);
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
        font-size: var(--text-nav-size);
        font-weight: var(--text-nav-weight);
        color: var(--content-light-primary);
        text-decoration: none;
        transition: color var(--transition-duration-fast) var(--easing-standard);
    }

    .link-nav__item:hover,
    .link-nav__item:focus-visible {
        color: var(--content-light-secondary);
    }

    .link-nav__item--active {
        font-weight: var(--text-nav-active-weight);
    }
</style>
