<script>
    let {
        visible = false,
        text = '',
        type = 'semplice',
        x = 0,
        y = 0,
        centered = false
    } = $props();
</script>

<div
    class="cursor-tooltip-wrapper"
    class:is-visible={visible}
    class:mod-paragrafo={type === 'paragrafo'}
    class:mod-semplice={type === 'semplice'}
    class:mod-centered={centered}
    style="--x: {x}px; --y: {y}px"
>
    <div class="glass-effect tooltip-glass-override">
        <span class="tooltip-text-content">{@html text}</span>
    </div>
</div>

<style>
    .cursor-tooltip-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        /* Default: tooltip accanto al cursore, offset di 16px */
        transform: translate(calc(var(--x) + 16px), calc(var(--y) + 16px));
        pointer-events: none;
        z-index: 9999;
        will-change: transform;
        width: max-content;
    }

    /* Centered: il centro geometrico del tooltip coincide con il cursore */
    .cursor-tooltip-wrapper.mod-centered {
        transform: translate(calc(var(--x) - 50%), calc(var(--y) - 50%));
    }

    .mod-semplice {
        max-width: 260px;
    }

    .mod-paragrafo {
        max-width: 400px;
    }

    .tooltip-glass-override {
        width: 100% !important;
        height: auto !important;
        padding: var(--spacing-2) var(--spacing-4) !important;
        border-radius: var(--radius-s) !important;
        box-shadow: 0 4px 20px rgba(7, 30, 69, 0.04), 0 12px 30px rgba(7, 30, 69, 0.08) !important;
        opacity: 0;
        transition: opacity var(--transition-duration-fast) var(--easing-in);
    }

    .cursor-tooltip-wrapper.is-visible .tooltip-glass-override {
        opacity: 1;
        transition: opacity var(--transition-duration-fast) var(--easing-out);
    }

    .mod-semplice .tooltip-glass-override {
        border-radius: var(--radius-l) !important;
    }

    .tooltip-text-content {
        display: block;
        font-family: var(--font-family-base);
        font-size: var(--text-service-size);
        font-weight: var(--text-service-weight);
        color: var(--content-primary, #ffffff);
        line-height: 1.4;
        white-space: pre-line;
    }
</style>
