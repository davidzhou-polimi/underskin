<script>
    import { goto } from '$app/navigation';

    /**
     * SVELTE 5 - COMPONENTE PULSANTE RIUTILIZZABILE (UI)
     * Assunzioni:
     * 1. Utilizza sempre un tag <button> per evitare l'anteprima dell'URL nativa nei browser.
     * 2. Se viene fornito un `href`, la navigazione viene effettuata programmaticamente tramite `goto()`.
     * 3. Integra l'effetto vetro globale tramite la classe `.glass-effect`.
     */

    /**
     * @typedef {Object} Props
     * @property {string} [href] - URL di destinazione per la navigazione programmatica
     * @property {'button' | 'submit' | 'reset'} [type] - Tipo del pulsante (default 'button')
     * @property {string} [ariaLabel] - Descrizione accessibile del pulsante
     * @property {import('svelte/elements').MouseEventHandler<HTMLButtonElement>} [onclick] - Callback per l'evento click
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

    /**
     * Gestisce il click sul pulsante eseguendo la navigazione se href è definito
     * @param {any} event
     */
    const handleClick = async (event) => {
        // Commento solo il PERCHÉ: eseguiamo prima il gestore onclick passato come prop, consentendogli di annullare la navigazione se necessario, poi procediamo con goto().
        onclick(event);
        if (href && !event.defaultPrevented) {
            await goto(href);
        }
    };
</script>

<button 
    {type} 
    class="glass-effect pill-button" 
    aria-label={ariaLabel}
    onclick={handleClick}
>
    {#if children}
        {@render children()}
    {/if}
</button>

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
        /* Commento solo il perché: garantisce consistenza visiva dell'altezza rispetto ai tooltip che hanno la stessa altezza di riga */
        line-height: 1.4;
        border: none;
        border-radius: 9999px;
        padding: var(--spacing-2) var(--spacing-6);
        cursor: pointer;
        /* Transizione fluida limitata al colore di sfondo per evitare oscillazioni verticali indesiderate dell'elemento */
        transition: background-color var(--transition-duration-fast) var(--easing-out);
    }

    .pill-button:hover {
        background-color: rgb(from var(--neutral-100) r g b / 0.95);
    }
</style>

