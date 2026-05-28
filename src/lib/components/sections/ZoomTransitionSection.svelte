<script>
    import { zoomTextTransition } from '$lib/actions/zoomTextTransition.js';
    import { trackSection } from '$lib/actions/trackSection.js';
</script>

<section id="zoom-transition" class="zoom-section" use:trackSection use:zoomTextTransition>
    
    <div class="intro-container">
        <span class="first-text">Alcuni casi a</span>
        
        <h1 class="zoom-text">
            Milano Cortina
            <span class="break-line">
                2<span class="target-digit">0</span>26
            </span>
        </h1>
    </div>

    <div class="next-section-content">
        <div class="content-wrapper">
            <h2>Nuova Sezione</h2>
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
        background-color: var(--background-primary);
        font-family: var(--font-family-base);
        
        /* MODIFICA: Sposta la sezione verso l'alto di un terzo del viewport */
        margin-top: -30vh; 
        
        /* Garantisce che lo sfondo della sezione zoom copra lo spazio vuoto della precedente */
        z-index: 5;
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
        text-align: center;
        z-index: 1;
        padding: var(--spacing-4);
    }

    .first-text {
        font-size: var(--text-caption-size);
        font-weight: var(--text-caption-weight);
        color: var(--content-primary);
        margin-bottom: var(--spacing-4);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .zoom-text {
        font-size: var(--text-footer-size);
        font-weight: var(--text-footer-weight);
        color: var(--azzurro-600); 
        margin: var(--spacing-0);
        line-height: 1.1;
        text-align: center;
        
        /* AGGIUNGI QUESTA PROPRIETÀ: Impedisce la rasterizzazione a bassa risoluzione */
        transform: translateZ(0); 
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
    
    will-change: transform;
    }

    .break-line {
        display: block;
    }

    .target-digit {
        display: inline-block;
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
        background-color: var(--azzurro-600); 
    }

    .content-wrapper {
        text-align: center;
        color: var(--background-primary);
        padding: var(--spacing-4);
    }

    .content-wrapper h2 {
        font-size: var(--text-xl);
        margin-bottom: var(--spacing-2);
    }
</style>