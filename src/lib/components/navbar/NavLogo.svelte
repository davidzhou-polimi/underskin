<script>
    let { href = "/" } = $props();
</script>

<a {href} class="nav-logo">
    UnderSkin
</a>

<style>
    .nav-logo {
        font-family: 'Rethink Sans', sans-serif;
        /* Commento solo il PERCHÉ: utilizza il token di dimensione standard per il logo della barra di navigazione */
        font-size: var(--text-logo-size);
        font-style: normal;
        /* Commento solo il PERCHÉ: allinea il peso del logo con il token tipografico del brand */
        font-weight: var(--text-logo-weight);
        line-height: normal;
        color: var(--content-primary);
        text-decoration: none;
        cursor: pointer;
        user-select: none;
        transition: color 0.2s ease-in-out;
    }

    .nav-logo:hover,
    .nav-logo:focus-visible {
        color: var(--content-secondary);
    }
</style>