<script>
    /**
     * SVELTE 5 - COMPONENTE PULSANTE RIUTILIZZABILE (UI)
     * Assunzioni:
     * 1. Supporta la navigazione diretta (tag <a>) se viene fornita la proprietà `href`.
     * 2. Altrimenti, renderizza un tag <button> standard.
     * 3. Integra l'effetto vetro globale tramite la classe `.glass-effect`.
     */

    /**
     * @typedef {Object} Props
     * @property {string} [href] - URL di destinazione (se presente, renderizza un tag <a>)
     * @property {'button' | 'submit' | 'reset'} [type] - Tipo del pulsante (default 'button')
     * @property {string} [ariaLabel] - Descrizione accessibile del pulsante
     * @property {import('svelte/elements').MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>} [onclick] - Callback per l'evento click
     * @property {import('svelte').Snippet} [children] - Elementi figli per il testo o icone
     */

    /** @type {Props} */
    let {
        href = '',
        type = 'button',
        ariaLabel = '',
        onclick = () => {},
        children
    } = $props();
</script>

{#if href}
    <a 
        {href} 
        class="glass-effect pill-button" 
        aria-label={ariaLabel}
        {onclick}
    >
        {#if children}
            {@render children()}
        {/if}
    </a>
{:else}
    <button 
        {type} 
        class="glass-effect pill-button" 
        aria-label={ariaLabel}
        {onclick}
    >
        {#if children}
            {@render children()}
        {/if}
    </button>
{/if}

<style>
    /* Commento solo il PERCHÉ: Applica lo stile traslucido del design di UnderSkin ereditando la classe globale .glass-effect */
    .pill-button {
        display: inline-block;
        text-align: center;
        text-decoration: none;
        color: var(--content-primary);
        font-family: inherit;
        font-size: var(--text-button-size);
        font-weight: var(--text-button-weight);
        border: none;
        border-radius: 9999px;
        padding: var(--spacing-2) var(--spacing-6);
        cursor: pointer;
        transition: background-color var(--transition-duration-normal) var(--easing-standard),
                    transform var(--transition-duration-normal) var(--easing-standard);
    }

    .pill-button:hover {
        background-color: rgb(from var(--neutral-100) r g b / 0.8);
        transform: translateY(-1px);
    }

    .pill-button:active {
        transform: translateY(0);
    }
</style>
