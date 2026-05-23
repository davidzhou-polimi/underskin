<script>
    // Se cliccato, riporta alla home di default
    let { href = "/" } = $props();
</script>

<a {href} class="nav-logo">
    UnderSkin
</a>

<style>
    .nav-logo {
        font-family: 'Rethink Sans', var(--font-family-base), sans-serif;
        font-size: 42.952px;
        font-style: normal;
        font-weight: 800; /* Bold / ExtraBold */
        line-height: normal;
        color: var(--content-primary, #ffffff);
        text-decoration: none;
        cursor: pointer;
        user-select: none;
        transition: color 0.2s ease-in-out;
    }

    .nav-logo:hover {
        color: var(--content-secondary, #cccccc);
    }
</style>