<script>
    let { href = "/" } = $props();
</script>

<a {href} class="nav-logo">
    UnderSkin
</a>

<style>
    .nav-logo {
        font-family: 'Rethink Sans', sans-serif;
        font-size: 43px;
        font-style: normal;
        font-weight: 800; /* ExtraBold */
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