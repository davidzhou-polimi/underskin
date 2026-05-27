<script>
    import GlassEffect from '$lib/components/ui/GlassEffect.svelte';

    // Riceve le proprietà reattive dallo store globale di Lucrezia
    let { 
        visible = false, 
        text = '', 
        type = 'semplice', 
        x = 0, 
        y = 0 
    } = $props();

    // Offset per distanziare la card satinata dalla punta del mouse
    const OFFSET_X = 16; 
    const OFFSET_Y = 16;
</script>

<div 
    class="cursor-tooltip-wrapper" 
    class:mod-paragrafo={type === 'paragrafo'}
    class:mod-semplice={type === 'semplice'}
    style:left="{x + OFFSET_X}px"
    style:top="{y + OFFSET_Y}px"
>
    <GlassEffect class="tooltip-glass-override">
        <span class="tooltip-text-content">{text}</span>
    </GlassEffect>
</div>

<style>
    .cursor-tooltip-wrapper {
        position: fixed;
        pointer-events: none; /* Impedisce sfarfallii al movimento del mouse */
        z-index: 9999; /* Sta sopra a tutto il resto del sito */
        will-change: left, top; /* Ottimizza le performance di spostamento */
        width: max-content
    }

    /* Variante 1: Cursore in modalità Semplice */
    .mod-semplice {
        max-width: 260px;
    }

    /* Variante 2: Cursore in modalità Paragrafo (usato nella tua sezione) */
    .mod-paragrafo {
        max-width: 400px; /* Diamo il giusto spazio alla spiegazione clinica */
    }

    /* Forza il componente di Chiara ad adattarsi perfettamente alle dimensioni del Tooltip */
    :global(.tooltip-glass-override) {
        width: 100% !important;
        height: auto !important;
        padding: var(--spacing-2) var(--spacing-3) !important;
        border-radius: var(--radius-s) !important;
        
        /* Ombra morbida a doppia diffusione che simula una luce naturale e premium */
        box-shadow: 0 4px 20px rgba(7, 30, 69, 0.04), 0 12px 30px rgba(7, 30, 69, 0.08) !important;
    }

    .tooltip-text-content {
        display: block;
        font-family: var(--font-family-base);
        font-size: var(--text-service-size);
        font-weight: var(--text-service-weight);
        color: var(--content-primary, #ffffff);
        line-height: 1.4;
        white-space: pre-line; /* Riconosce gli andata a capo (\n) nei testi */
    }
</style>