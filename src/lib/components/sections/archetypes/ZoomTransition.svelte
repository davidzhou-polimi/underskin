<script>
    import { zoomTextTransition } from '$lib/actions/archetypes/zoomTextTransition.js';
    import { trackSection } from '$lib/actions/trackSection.js';

    /**
     * @typedef {Object} Props
     * @property {'favorito' | 'infortunato' | 'insoddisfatto'} [theme] - Il tema cromatico dell'archetipo
     * @property {string} [nextTitle] - Il titolo della sezione successiva
     * @property {import('svelte').Snippet} [children] - Frammento Svelte per iniettare contenuti personalizzati
     */

    /** @type {Props} */
    let { 
        theme = 'favorito', 
        nextTitle = 'Nuova Sezione',
        children = undefined 
    } = $props();

    /** @type {Record<string, string>} */
    const themeColors = {
        favorito: 'var(--azzurro-600)',
        infortunato: 'var(--arancione-600)',
        insoddisfatto: 'var(--viola-500)'
    };

    let textColor = $derived(themeColors[theme] || 'var(--azzurro-600)');
</script>

<section id="zoom-transition" class="zoom-section" use:trackSection use:zoomTextTransition>
    
    <div class="intro-container">
        <p class="first-text">Alcuni casi a</p>
        
        <svg class="zoom-svg" viewBox="0 0 1000 400" width="100%" height="100%">
            <g class="zoom-content">
                <text class="zoom-text" x="500" text-anchor="middle" style:fill={textColor}><tspan x="500" dy="180">Milano Cortina</tspan><tspan x="500" dy="220" class="year-text">2026</tspan></text>
            </g>
        </svg>
    </div>

    <div class="next-section-content">
        <div class="content-wrapper">
            {#if children}
                {@render children()}
            {:else}
                <h3>{nextTitle}</h3>
            {/if}
        </div>
    </div>

</section>

<style>
    .zoom-section {
        --placeholder-color: var(--content-primary, #111111);
        position: relative;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
        background-color: transparent;
        font-family: var(--font-family-base);
        z-index: 5;
        /* Avvicina la sezione a quella precedente sovrapponendo i margini vuoti in modo trasparente per migliorare la fluidità visiva dello scroll */
        margin-top: -25vh;
    }

    .intro-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 1;
        padding: var(--spacing-4);
    }

    .first-text {
        font-size: var(--text-caption-size);
        font-weight: var(--text-caption-weight);
        color: var(--content-primary);
        margin-bottom: var(--spacing-4);
    }

    /* Stili per l'SVG e il testo vettoriale */
    .zoom-svg {
        max-width: 900px;
        max-height: 350px;
        overflow: visible;
    }

    .zoom-text {
        font-size: var(--text-3xl); /* Dimensione calibrata sul viewBox dell'SVG */
        /* Commento solo il PERCHÉ: allinea il testo zoom dell'SVG con il peso massimo (black) definito globalmente */
        font-weight: var(--text-black);
        line-height: 1.1;
    }

    .next-section-content {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
        background-color: var(--background-primary);
        overflow: visible;
        /* Rende la sezione e tutti i suoi figli invisibili e non interattivi finché non inizia la dissolvenza */
        visibility: hidden;
    }
</style>