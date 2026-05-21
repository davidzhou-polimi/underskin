<script>
    
</script>

<section class="performance-section">
    <div class="text-container">
        <p class="subtitle">La salute mentale non è separata dalla performance.</p>
        <h1 class="main-title gradient-text animate-gradient-text my-archetypes-color">
         &egrave; la performance
        </h1>
    </div>
</section>

<style>
    /* Centra tutto perfettamente nello schermo */
    .performance-section {
        height: 100vh;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--background-primary, #000000); 
        overflow: hidden;
    }

    /* Contenitore verticale con lo spacing a 40px tramite token */
    .text-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: var(--spacing-2); /* Configurato a 2.5rem, cioè 40px esatti */
        width: 100%;
        padding: var(--spacing-2); /* 16px (1rem) presi dai token della repo */
    }

    /* Scritta sopra: Rethink Sans Regular 24 */
    .subtitle {
        margin: 0;
        font-family: 'Rethink Sans', var(--font-family-base), sans-serif;
        font-size: 24px;
        font-weight: 400; /* Regular */
        color: var(--content-primary, #ffffff);
        line-height: 1.4;
    }

    /* Scritta sotto: Rethink Sans Bold 56 + Gradiente */
    .main-title {
        margin: 0;
        font-family: 'Rethink Sans', var(--font-family-base), sans-serif;
        font-size: 56px;
        font-weight: 700; /* Bold */
        line-height: 1.2;
    }

    /* Configurazione dei colori presi dal vecchio branch */
    .my-archetypes-color {
        --gradient-c1: var(--archetipi-favorito, #ff0055);
        --gradient-c2: var(--archetipi-insoddisfatto, #00ffcc);
        --gradient-c3: var(--archetipi-infortunato, #3300ff);
    }
</style>