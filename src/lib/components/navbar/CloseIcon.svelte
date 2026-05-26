<script>
    export let onclick = () => {};
</script>

<button type="button" class="close-button" on:click={onclick} aria-label="Chiudi menu">
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 16.5 16.5" 
        class="close-svg"
    >
        <line x1="1.5" y1="1.5" x2="15" y2="15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        <line x1="15" y1="1.5" x2="1.5" y2="15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
    </svg>
</button>

<style>
    .close-button {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--content-primary);
        transition: color 0.2s ease-in-out;
        width: 16.5px;
        height: 16.5px;
    }

    .close-svg {
        width: 16.5px;
        height: 16.5px;
    }

    .close-button:hover,
    .close-button:focus-visible {
        color: var(--content-secondary);
    }
</style>