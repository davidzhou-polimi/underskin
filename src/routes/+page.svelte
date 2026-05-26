<script>

    import GlassEffect from '$lib/components/ui/GlassEffect.svelte';
    import ShatterGlass from '$lib/components/sections/ShatterGlass.svelte';

</script>

<main>

    <section class="test-figma-bg">
        <div class="background-huge-text">
            <span>Quindi</span><span class="orange-text">tale</span>smettendo di
        </div>

        <GlassEffect class="figma-glass-card">
            <p class="glass-text">
                Improvviso calo delle prestazioni in situazioni ad alta pressione.<br>
                L’ansia interferisce con l’esecuzione automatica di competenze consolidate.
            </p>
        </GlassEffect>
    </section>

    <section class="shatter-section-wrapper">
        <ShatterGlass />
    </section>

    <section class="filler-section">
    </section>
</main>

<style>
    /* --- Stili esistenti per la prima sezione (immutati) --- */
    .test-figma-bg {
        position: relative;
        min-height: 800px;
        background-color: #f4f8fb; 
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
    }

    .background-huge-text {
        position: absolute;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: system-ui, sans-serif;
        font-size: 8rem;
        font-weight: 500;
        color: #000000;
        white-space: nowrap;
        z-index: 1;
        letter-spacing: -0.05em;
    }

    .orange-text {
        color: #d88e73; 
    }

    :global(.figma-glass-card) {
        position: relative;
        z-index: 10;
        max-width: 600px;
        border-radius: 24px;
        padding: 32px 40px;
        margin-top: 100px; 
    }

    .glass-text {
        font-family: system-ui, sans-serif;
        color: #0c2137;
        font-size: 1.4rem;
        font-weight: 400;
        line-height: 1.5;
        margin: 0;
    }

    /* --- Nuovi stili per il testing del Glass Shatter --- */
    
    /* Contenitore per isolare la sezione dell'animazione */
    .shatter-section-wrapper {
        width: 100%;
        background-color: #f4f8fb;
    }

    /* Sezione finale di riempimento per testare la fine dello scroll */
    .filler-section {
        min-height: 100vh;
        background-color: #0c2137;
        color: #ffffff;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-family: system-ui, sans-serif;
    }

</style>