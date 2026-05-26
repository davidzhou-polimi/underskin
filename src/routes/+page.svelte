<script>

	// Importa qui in sequenza le macro-sezioni dalla cartella components/sections/
    import PerfectionGame from '$lib/components/sections/PerfectionGame.svelte';
    import GlassEffect from '$lib/components/ui/GlassEffect.svelte';

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

     <PerfectionGame />

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

</main>

<style>
    /* 1. Lo sfondo chiaro della sezione (simile a F1FAFD) */
    .test-figma-bg {
        position: relative;
        min-height: 800px;
        background-color: #f4f8fb; 
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
    }

    /* 2. Le scritte giganti che staranno DIETRO al vetro */
    .background-huge-text {
        position: absolute;
        top: 40%; /* Posizionato per essere tagliato a metà dal vetro */
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: system-ui, sans-serif;
        font-size: 8rem; /* Testo enorme */
        font-weight: 500;
        color: #000000;
        white-space: nowrap;
        z-index: 1; /* Sta sotto la card */
        letter-spacing: -0.05em;
    }

    /* Il colore salmone/arancio della parola "tale" nel tuo screen */
    .orange-text {
        color: #d88e73; 
    }

    /* 3. La forma specifica della TUA card in questo contesto */
    :global(.figma-glass-card) {
        position: relative;
        z-index: 10; /* Sta sopra le scritte */
        max-width: 600px;
        border-radius: 24px;
        padding: 32px 40px;
        /* Sposto un po' la card per sovrapporla bene alle scritte di sfondo */
        margin-top: 100px; 
    }

    /* 4. Il testo dentro al vetro */
    .glass-text {
        font-family: system-ui, sans-serif;
        color: #0c2137;
        font-size: 1.4rem;
        font-weight: 400;
        line-height: 1.5;
        margin: 0;
    }
</style>