<script>
    import { page } from "$app/state";
    import InteractiveGradient from "$lib/components/ui/InteractiveGradient.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Navbar from "$lib/components/navbar/Navbar.svelte";

    // Configurazione del gradiente per la pagina di errore (colori unificati della Home)
    let statusCode = $state(page.status);

    const ERROR_GRADIENT = {
        colors: [
            "var(--azzurro-200)",             // Chiaro - Favorito
            "var(--viola-600)",               // Scuro  - Insoddisfatto
            "var(--arancione-200)",           // Chiaro - Infortunato
            "var(--archetipi-favorito)",      // Medium - Favorito
            "var(--viola-200)",               // Chiaro - Insoddisfatto
            "var(--arancione-600)",           // Scuro  - Infortunato
            "var(--azzurro-600)",             // Scuro  - Favorito
            "var(--archetipi-insoddisfatto)", // Medium - Insoddisfatto
            "var(--archetipi-infortunato)"    // Medium - Infortunato
        ],
        coverage: 1.0, // Copertura totale
    };
</script>

<InteractiveGradient config={ERROR_GRADIENT} />

<Navbar />

<main id="error-page">
    <div class="error-container">
        <h1 class="error-code">{statusCode}</h1>

        {#if statusCode === 404}
            <p class="error-message">
                Hai trovato una sfumatura della performance che non abbiamo ancora catalogato.<br />Evidentemente c'è ancora molto da scrivere.
            </p>
            <div class="action-container">
                <Button href="/" ariaLabel="Torna alla narrazione">
                    Torna alla narrazione
                </Button>
            </div>
        {:else}
            <p class="error-message">
                Il nostro sistema ha ceduto sotto pressione.<br />Ci prendiamo un momento per recuperare le energie, riprova tra poco.
            </p>
            <div class="action-container">
                <Button onclick={() => location.reload()} ariaLabel="Riprova ora">
                    Riprova ora
                </Button>
            </div>
        {/if}
    </div>
</main>

<style>
    #error-page {
        position: relative;
        width: 100%;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
        color: var(--content-dark-primary);
        overflow: hidden;
        text-align: center;
        padding: var(--spacing-4);
        box-sizing: border-box;
    }

    .error-container {
        z-index: 10;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-4);
        margin-top: var(--spacing-6);
        transition: opacity 150ms ease-out;
    }

    @starting-style {
        .error-container {
            opacity: 0;
        }
    }

    .error-code {
        font-size: var(--text-3xl);
        font-weight: var(--text-black);
        line-height: 0.8;
        color: color-mix(in srgb, var(--content-dark-primary) 90%, transparent);
    }

    .error-message {
        text-wrap: pretty;
        opacity: 0.85;
        margin: 0;
        line-height: 1.5;
    }

    .action-container {
        margin-top: var(--spacing-6);
    }
</style>
