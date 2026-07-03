<script>
    import { scrollReveal } from "$lib/actions/scrollReveal.js";
    import { prefacePin } from "$lib/actions/home/prefacePin.js";

    // L'animazione delle scie circolari (trailCanvas) è stata rimossa: era già
    // disattivata ma il suo rAF continuava a girare a vuoto. Recuperabile da git
    // se andrà ripristinata (andrà riscritta con noise a tile e gradienti cachati).
</script>

<section
    id="preface-text"
    class="preface-section"
    use:prefacePin={{ end: "+=550%" }}
>
    <div class="text-container" use:scrollReveal={{ end: "+=500%" }}>
        <p class="reveal-line">Milano-Cortina 2026</p>
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
        /* Commento solo il PERCHÉ: applica un margine negativo per spostare verticalmente la sezione preface verso l'alto rispetto alla viewport su richiesta esplicita dell'utente */
        margin-top: -20vh;
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

    @media (max-width: 768px) {
        .preface-section {
            /* Commento solo il PERCHÉ: azzera il margine superiore negativo su mobile 
               per evitare che la sezione si sovrapponga visivamente con l'IntroSection */
            margin-top: 0;
        }

        .reveal-line {
            /* Commento solo il PERCHÉ: adotta una taglia di testo inferiore su mobile 
               per evitare che frasi medie/lunghe vadano a capo in troppe righe spezzando il ritmo */
            font-size: var(--text-l);
        }
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
