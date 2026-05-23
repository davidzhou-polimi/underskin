<script>
    import { fade } from 'svelte/transition';
    import NavLogo from './NavLogo.svelte';
    import NavLink from './NavLink.svelte';
    import MenuIcon from './MenuIcon.svelte';
    import CloseIcon from './CloseIcon.svelte';

    let isMenuOpen = $state(false);

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
    }
</script>

<nav class="navbar">
    <div class="nav-left">
        <NavLogo />
    </div>

    <div class="nav-right">
        {#if !isMenuOpen}
            <div class="icon-wrapper" transition:fade={{ duration: 120 }}>
                <MenuIcon onclick={toggleMenu} />
            </div>
        {:else}
            <div class="menu-expanded-box" transition:fade={{ duration: 150 }}>
                <div class="links-group">
                    <NavLink href="#home" label="Home" />
                    <NavLink href="#about" label="About" />
                    <NavLink href="#favorito" label="Il Favorito" />
                    <NavLink href="#insoddisfatto" label="L'Insoddisfatto" />
                    <NavLink href="#infortunato" label="L'Infortunato" />
                </div>
                
                <CloseIcon onclick={toggleMenu} />
            </div>
        {/if}
    </div>
</nav>

<style>
    .navbar {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-4, 32px) var(--spacing-5, 40px);
        z-index: 100;
        background-color: var(--background-primary, #F1FAFD); /* Sfondo primario del brand */
    }

    .nav-left, .nav-right {
        display: flex;
        align-items: center;
    }

    .nav-left {
        justify-content: flex-start;
    }

    .nav-right {
        justify-content: flex-end;
        height: 68px; /* Allinea l'altezza massima con la box per evitare scatti */
    }

    .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
    }

    /* LA BOX COMPLESSA DA FIGMA: Dimensioni 710px x 68px */
    .menu-expanded-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 710px;
        height: 68px;
        /* Internamente usa lo sfondo primario o una variante trasparente pulita */
        background-color: var(--background-primary, #F1FAFD);
        border: 1px solid rgba(7, 30, 69, 0.12); /* Tratto sottile usando il content-primary */
        border-radius: var(--radius-md, 20px);
        padding: 0 var(--spacing-4, 32px);
        box-shadow: 0 10px 30px rgba(7, 30, 69, 0.08);
        box-sizing: border-box;
    }

    /* Gruppo interno dei link con Spacing-3 (24px) richiesto */
    .links-group {
        display: flex;
        align-items: center;
        gap: var(--spacing-3, 24px); /* <--- Spacing a 24px tra un link e l'altro */
    }
</style>