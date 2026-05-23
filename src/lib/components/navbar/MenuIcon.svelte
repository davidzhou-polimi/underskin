<script>
    // Cattura la funzione di click passata dal componente padre
    let { onclick } = $props();
</script>

<button type="button" class="menu-button" {onclick} aria-label="Apri menu">
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 32 32" 
        class="hamburger-svg"
    >
        <line x1="4" y1="8" x2="28" y2="8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        <line x1="4" y1="16" x2="28" y2="16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        <line x1="4" y1="24" x2="28" y2="24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
    </svg>
</button>

<style>
    .menu-button {
        background: none;
        border: none;
        padding: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--content-primary, #ffffff);
        transition: color 0.2s ease-in-out, transform 0.1s ease;
    }

    .hamburger-svg {
        width: 32px;
        height: 32px;
    }

    .menu-button:hover {
        color: var(--content-secondary, #cccccc);
    }

    .menu-button:active {
        transform: scale(0.95);
    }
</style>