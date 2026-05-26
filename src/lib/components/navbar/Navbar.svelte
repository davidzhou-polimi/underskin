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
        top: -10px;
        left: 0;
        width: 100%;
        display: flex;
        justify-content: center;
        gap: 880px;
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
        width: 194px; /* fissa la larghezza del contenitore logo per evitare shift quando il menu cambia */
    }

    .nav-right {
        justify-content: center;
        position: relative;
        width: 22px; /* fissa l'area dell'hamburger/x per mantenere la posizione invariata */
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
        left: 50%;
        /* posiziona il bordo destro in modo che la X (right:21px) coincida con il centro dell'area dell'hamburger */
        transform: translateX(-520px); /* allarga il rettangolo di 11px per lato senza spostare i contenuti */
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
        margin-right: 45px;
    }

    .close-inside {
        position: absolute;
        right: 32px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 5;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>