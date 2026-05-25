<script>
    let { 
        visible = false, 
        text = '', 
        type = 'semplice', 
        x = 0, 
        y = 0 
    } = $props();

    const OFFSET_X = 12; 
    const OFFSET_Y = 18;
</script>

<div 
    class="cursor-tooltip" 
    class:mod-paragrafo={type === 'paragrafo'}
    class:mod-semplice={type === 'semplice'}
    style:left="{x + OFFSET_X}px"
    style:top="{y + OFFSET_Y}px"
>
    {text}
</div>

<style>
    .cursor-tooltip {
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        
        font-size: var(--text-caption-size);
        font-weight: var(--text-caption-weight);
        color: var(--content-primary);
        background-color: var(--neutral-200);
        
        padding: var(--spacing-2) var(--spacing-3);
        
        white-space: pre-line;
        will-change: left, top;
        box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08);
    }

    .mod-semplice {
        border-radius: var(--radius-l);
        max-width: 250px;
    }

    .mod-paragrafo {
        border-radius: var(--radius-s);
        max-width: 320px;
        line-height: 1.4;
    }
</style>