<script>
    import { trailCanvas } from "$lib/actions/home/trailCanvas.js";
    import { scrollReveal } from "$lib/actions/scrollReveal.js";
    import { prefacePin } from "$lib/actions/home/prefacePin.js";

    /** @type {any} */
    let canvasAction = null;

    /**
     * Gestisce l'inizializzazione del canvas di sfondo.
     * @param {HTMLCanvasElement} node
     */
    function bindCanvas(node) {
        canvasAction = trailCanvas(node);

        /* IL LOOP DEL CANVAS È STATO COMMENTATO TEMPORANEAMENTE SU RICHIESTA DELL'UTENTE
			PER RIMUOVERE L'ANIMAZIONE GRAFICA CIRCOLARE SULLO SFONDO:

			if (canvasAction) {
				canvasAction.startLoop(false);
			}
		*/
        return {
            destroy() {
                if (canvasAction) {
                    canvasAction.destroy();
                    canvasAction = null;
                }
            },
        };
    }
</script>

<section
    id="preface-text"
    class="preface-section"
    use:prefacePin={{ end: "+=1000%" }}
>
    <div class="canvas-layer">
        <canvas use:bindCanvas></canvas>
    </div>

    <div class="text-container" use:scrollReveal={{ end: "+=800%" }}>
        <p class="reveal-line">Milano–Cortina 2026</p>
        <p class="reveal-line">2.900 atleti</p>
        <p class="reveal-line">1 vita di sacrifici</p>
        <p class="reveal-line">4 anni di preparazione</p>
        <div class="reveal-line final-phrase">
            <span>Tutto per soli</span>
            <span
                class="gradient-text animate-gradient-text dynamic-archetypes"
            >
                120 secondi di performance
            </span>
        </div>
    </div>
</section>

<style>
    .preface-section {
        position: relative;
        width: 100%;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background-color: transparent;
    }

    .canvas-layer {
        position: absolute;
        inset: 0;
        z-index: 0;
    }

    canvas {
        display: block;
        width: 100%;
        height: 100%;
    }

    .text-container {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
        align-items: center;
        justify-items: center;
        text-align: center;
        width: 100%;
        padding: var(--spacing-4);
    }

    .reveal-line {
        grid-area: 1 / 1 / 2 / 2;
        margin: var(--spacing-0);
        font-size: var(--text-important-size);
        font-weight: var(--text-important-weight);
        color: var(--content-primary);
        font-family: var(--font-family-base);
        line-height: 1.4;
    }

    /* Commento solo il PERCHÉ: nasconde le scritte successive alla prima a livello CSS statico, evitando che si sovrappongano all'avvio prima del caricamento di JS/GSAP */
    .reveal-line:not(:first-child) {
        opacity: 0;
        filter: blur(15px);
        transform: translateY(20px);
    }

    .final-phrase {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    /* Consuma i token senza dichiarare o sovrascrivere variabili CSS locali */
    .dynamic-archetypes {
        background: linear-gradient(
            135deg,
            var(--archetipi-favorito),
            var(--archetipi-insoddisfatto),
            var(--archetipi-infortunato)
        );
        background-clip: text;
        color: var(--archetipi-favorito);
        -webkit-text-fill-color: transparent;
    }

    :global(.reveal-hidden) {
        opacity: 0;
        filter: blur(15px);
        transform: translateY(20px);
    }

    :global(.reveal-visible) {
        opacity: 1;
        filter: blur(0px);
        transform: translateY(0);
    }
</style>
