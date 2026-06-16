<script>
    let {
        visible = false,
        text = '',
        type = 'semplice',
        x = 0,
        y = 0
    } = $props();

    const OFFSET_X = 16;
    const OFFSET_Y = 16;
</script>

<div
    class="cursor-tooltip-wrapper"
    class:is-visible={visible}
    class:mod-paragrafo={type === 'paragrafo'}
    class:mod-semplice={type === 'semplice'}
    style="--x: {x + OFFSET_X}px; --y: {y + OFFSET_Y}px"
>
    <div class="glass-effect tooltip-glass-override">
        <span class="tooltip-text-content">{text}</span>
    </div>
</div>

<style>
    .cursor-tooltip-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        transform: translate(var(--x), var(--y));
        pointer-events: none;
        z-index: 9999;
        will-change: transform;
        width: max-content;
        opacity: 0;
        transition: opacity var(--transition-duration-fast) var(--easing-in);
    }

    .cursor-tooltip-wrapper.is-visible {
        opacity: 1;
        transition: opacity var(--transition-duration-fast) var(--easing-out);
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
        padding: var(--spacing-2) var(--spacing-3) !important;
        border-radius: var(--radius-s) !important;
        box-shadow: 0 4px 20px rgba(7, 30, 69, 0.04), 0 12px 30px rgba(7, 30, 69, 0.08) !important;
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
