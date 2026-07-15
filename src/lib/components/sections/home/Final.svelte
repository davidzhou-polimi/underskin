<script>
    import { scrollSection } from '$lib/actions/scrollytelling/scrollSection.js';
</script>

<section
    class="finale-section"
    use:scrollSection={{
        id: "final",
        pin: { length: "medium", scrub: "auto" },
        reveal: { preset: "fadeInOut", target: ".finale-phrase", dwell: "short" }
    }}
    aria-label="Chiusura della storia"
>
    <div class="finale-content">
        <h3 class="finale-phrase">La sfida più grande non è sul cronometro, ma…</h3>
    </div>
</section>

<style>
    /* Commento solo il PERCHÉ: imposta la sezione a 100vh per occupare l'intero viewport
       ed esporre la frase in modo isolato (da sola). */
    .finale-section {
        position: relative;
        width: 100%;
        height: 100vh;
        background-color: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        overflow: hidden;
    }

    @media (max-width: 768px) {
        .finale-section {
            /* Commento solo il PERCHÉ: azzera il margine superiore negativo su mobile 
               per evitare conflitti con la sezione precedente (Burnout) */
            margin-top: 0;
            padding: var(--spacing-8) var(--spacing-2);
        }
    }

    .finale-content {
        width: 100%;
        max-width: 90rem;
        display: flex;
        justify-content: center;
        padding-inline: var(--spacing-4);
    }

    .finale-phrase {
        margin: 0;
        line-height: 1.25;
        text-align: center;
        /* Commento solo il PERCHÉ: imposta lo stato iniziale dell'animazione (sfocato, trasparente e traslato verso il basso) 
           in modo che GSAP lo possa rivelare durante lo scroll senza flash visivi. */
        opacity: 0;
        filter: blur(15px);
        transform: translateY(30px);
        will-change: transform, opacity, filter;
    }
</style>

