<script>
    // Cattura la funzione di chiusura passata dal componente padre
    let { onclick } = $props();
</script>

<button type="button" class="close-button" {onclick} aria-label="Chiudi menu">
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 32 32" 
        class="close-svg"
    >
        <line x1="6" y1="6" x2="26" y2="26" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        <line x1="26" y1="6" x2="6" y2="26" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
    </svg>
</button>

<style>
    .close-button {
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

    .close-svg {
        width: 32px;
        height: 32px;
    }

    .close-button:hover {
        color: var(--content-secondary, #cccccc);
    }

    .close-button:active {
        transform: scale(0.95);
    }
</style>