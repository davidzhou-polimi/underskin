<section class="finale-section" aria-label="Chiusura della storia">
    <div class="finale-content">
        <p class="finale-phrase">La sfida più grande non è sul cronometro, ma…</p>
    </div>
</section>

<style>
    /* Centra verticalmente la frase finale e occupa l'intero schermo per dare respiro prima del footer */
    .finale-section {
        min-height: 100vh;
        padding: var(--spacing-4) var(--spacing-2);
        background-color: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
    }

    .finale-content {
        width: 100%;
        max-width: 90rem;
        display: flex;
        justify-content: center;
    }

    .finale-phrase {
        margin: 0;
        font-family: var(--font-family-base);
        font-size: var(--text-l);
        font-weight: 400;
        line-height: 1.25;
        color: var(--content-primary);
        text-align: center;
    }
</style>
