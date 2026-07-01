<section class="finale-section" aria-label="Chiusura della storia">
    <div class="finale-content">
        <h3 class="finale-phrase">La sfida più grande non è sul cronometro, ma…</h3>
    </div>
</section>

<style>
    /* Centra verticalmente la frase finale e occupa l'intero schermo per dare respiro prima del footer */
    .finale-section {
        min-height: 100vh;
        padding: var(--spacing-4) var(--spacing-2);
        margin-top: -15vh;
        background-color: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
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
    }

    .finale-phrase {
        margin: 0;
        line-height: 1.25;
        text-align: center;
    }
</style>
