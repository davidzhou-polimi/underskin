<script>
    let { onclick } = $props();
</script>

<button type="button" class="menu-button" {onclick} aria-label="Apri menu">
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 22 17" 
        class="hamburger-svg"
    >
        <line x1="0" y1="2" x2="22" y2="2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        <line x1="0" y1="8.5" x2="22" y2="8.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        <line x1="0" y1="15" x2="22" y2="15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
    </svg>
</button>

<style>
    .menu-button {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--content-primary);
        transition: color 0.2s ease-in-out;
        width: 22px;
        height: 17px;
    }

    .hamburger-svg {
        width: 22px;
        height: 17px;
    }

    .menu-button:hover,
    .menu-button:focus-visible {
        color: var(--content-secondary);
    }
</style>