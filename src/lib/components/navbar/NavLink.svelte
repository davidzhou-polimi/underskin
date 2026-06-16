<script>
    let { href = "#", label = "Link" } = $props();
</script>

<a {href} class="nav-link">
    {label}
</a>

<style>
    .nav-link {
        font-family: 'Rethink Sans', sans-serif;
        /* Commento solo il PERCHÉ: utilizza il token di dimensione standard per la barra di navigazione */
        font-size: var(--text-nav-size);
        font-style: normal;
        /* Commento solo il PERCHÉ: utilizza il token specifico per la barra di navigazione */
        font-weight: var(--text-nav-weight);
        line-height: 1.5;
        letter-spacing: -0.264px;
        color: var(--content-primary);
        text-decoration: none;
        cursor: pointer;
        transition: color 0.2s ease-in-out;
        white-space: nowrap;
    }

    .nav-link:hover,
    .nav-link:focus-visible {
        color: var(--content-secondary);
    }
</style>