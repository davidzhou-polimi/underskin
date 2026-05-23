<script>
    // Definiamo le proprietà in ingresso usando le Rune di Svelte 5
    let { href = "#", label = "Link" } = $props();
</script>

<a {href} class="nav-link">
    {label}
</a>

<style>
    .nav-link {
        font-family: 'Rethink Sans', var(--font-family-base), sans-serif;
        font-size: 24px;
        font-style: normal;
        font-weight: 600; /* SemiBold */
        line-height: normal;
        color: var(--content-primary, #ffffff);
        text-decoration: none;
        position: relative;
        cursor: pointer;
        transition: color 0.2s ease-in-out;
    }

    .nav-link:hover {
        color: var(--content-secondary, #cccccc);
    }
</style>