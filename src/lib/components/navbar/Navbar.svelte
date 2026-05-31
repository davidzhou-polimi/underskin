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
                <div class="close-inside">
                    <CloseIcon onclick={toggleMenu} />
                </div>
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
        padding: var(--spacing-4, 32px) 80px;
        z-index: 100;
		background-color: var(--background-primary, #F1FAFD);
        box-sizing: border-box;
    }

    .nav-left, .nav-right {
        display: flex;
        align-items: center;
    }

    .nav-left {
        justify-content: flex-start;
    }

    .nav-right {
        justify-content: center;
        position: relative;
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
        position: absolute;
        right: 0;
        top: 50%;
        transform: translate(21px, -50%);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 557px;
        height: 68px;
        gap: 24px;
        background-color: rgba(241, 250, 253, 0.5);
        border-radius: 32px;
        padding: 8px 32px;
        box-shadow: 2px 2px 4px 0 rgba(0, 0, 0, 0.23);
        box-sizing: border-box;
    }

    /* Gruppo interno dei link con Spacing-3 (24px) richiesto */
    .links-group {
        display: flex;
        align-items: center;
        gap: 24px;
        /* mantiene la distanza tra l'ultimo link e la X senza spostare i contenuti */
        margin-right: 24px;
    }

    .close-inside {
        position: absolute;
        right: 21px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 5;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>