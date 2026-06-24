<script>
    /**
     * Assunzioni per questo componente unificato:
     * 1. Sostituisce i tre file Hero specifici in un unico componente riutilizzabile.
     * 2. Gestisce reattivamente sfondi e testi tramite le rune di Svelte 5.
     * 3. Tutte le animazioni GSAP e ScrollTrigger sono isolate in Svelte Actions dedicate.
     */

    import { trackSection } from '$lib/actions/trackSection.js';
    import { heroParallax } from '$lib/actions/archetypes/heroParallax.js';

    /**
     * @typedef {Object} Props
     * @property {string} [title] - Il titolo principale dell'intestazione
     * @property {string} [sectionId] - L'ID univoco per lo scrollytelling
     * @property {string} [textShadow] - Effetto ombra per il testo
     * @property {'favorito' | 'infortunato' | 'insoddisfatto'} [theme] - Il tema per le impostazioni delle animazioni
     */

    /** @type {Props} */
    let {
        title = 'IL FAVORITO',
        sectionId = 'favorito-hero',
        textShadow = 'none',
        theme = 'favorito'
    } = $props();

    /** @type {HTMLElement | null} */
    let sectionRef = $state(null);
</script>

<section 
    id={sectionId} 
    class="blob-section" 
    class:mod-insoddisfatto={theme === 'insoddisfatto'} 
    bind:this={sectionRef} 
    use:trackSection={{ id: sectionId }}
>
    <div class="sticky-viewport">
        <div class="text-container">
            {#if sectionRef}
                <h1 use:heroParallax={{ trigger: sectionRef }} class="blob-text" style:text-shadow={textShadow}>
                    {title}
                </h1>
            {/if}
        </div>
    </div>
</section>

<style>
    .blob-section {
        position: relative;
        width: 100%;
        height: 100vh;
        /* Sfondo trasparente per far passare il gradiente interattivo globale */
        background-color: transparent; 
    }
    .sticky-viewport {
        position: sticky;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        overflow: hidden;
    }
    .text-container {
        position: absolute;
        inset: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10;
        padding: 0 2rem;
        pointer-events: none;
    }
    .blob-text {
        text-align: center;
        margin: 0;
        white-space: normal;
        word-wrap: break-word;
        max-width: 100%;
        color: var(--content-dark-primary); 
        line-height: 1.1;
    }
</style>