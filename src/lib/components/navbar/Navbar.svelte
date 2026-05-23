<script>
    import { fade } from 'svelte/transition';
    import NavLogo from './NavLogo.svelte';
    import NavLink from './NavLink.svelte';
    import MenuIcon from './MenuIcon.svelte';
    import CloseIcon from './CloseIcon.svelte';

    // Stato reattivo di Svelte 5 per l'apertura del menù
    let isMenuOpen = $state(false);

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
    }
</script>

<nav class="navbar">
    <div class="nav-left">
        {#if !isMenuOpen}
            <div class="icon-wrapper" transition:fade={{ duration: 150 }}>
                <MenuIcon onclick={toggleMenu} />
            </div>
        {:else}
            <div class="menu-expanded-box" transition:fade={{ duration: 180 }}>
                <div class="links-group">
                    <NavLink href="#home" label="Home" />
                    <NavLink href="#progetto" label="Progetto" />
                    <NavLink href="#archetipi" label="Archetipi" />
                    <NavLink href="#about" label="About" />
                </div>
                
                <CloseIcon onclick={toggleMenu} />
            </div>
        {/if}
    </div>

    <div class="nav-right">
        <NavLogo />
    </div>
</nav>

<style>
    /* Struttura principale della Navbar della Viewport */
    .navbar {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        /* Padding laterale simmetrico usando i token di progetto */
        padding: var(--spacing-4, 32px) var(--spacing-5, 40px);
        z-index: 100;
        pointer-events: none; /* Permette lo scroll nativo sotto la barra nei punti vuoti */
    }

    /* Riattiva i puntatori sui blocchi interattivi interni */
    .nav-left, .nav-right {
        pointer-events: auto;
        display: flex;
        align-items: center;
    }

    /* Icona singola nello stato chiuso */
    .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* IL RETTANGOLO ARROTONDATO: Contenitore ad hoc per lo stato aperto */
    .menu-expanded-box {
        display: flex;
        align-items: center;
        /* Distanza tra l'ultimo link e la X di chiusura */
        gap: var(--spacing-5, 40px); 
        background-color: var(--background-secondary, #121212);
        border: 1px solid rgba(255, 255, 255, 0.08);
        /* Bordi arrotondati come richiesto da Figma */
        border-radius: var(--radius-md, 20px); 
        padding: var(--spacing-2, 16px) var(--spacing-4, 32px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
    }

    /* Gruppo interno dei link di navigazione */
    .links-group {
        display: flex;
        align-items: center;
        /* Spaziatura orizzontale coerente tra i vari link del sito */
        gap: var(--spacing-4, 32px);
    }

    /* Contenitore destro per il logo */
    .nav-right {
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }
</style>