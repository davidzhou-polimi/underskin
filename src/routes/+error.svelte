<script>
    import { page } from "$app/stores";
    import InteractiveGradient from "$lib/components/ui/InteractiveGradient.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Navbar from "$lib/components/navbar/Navbar.svelte";

    // Configurazione del gradiente per la pagina di errore (colori unificati della Home)
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

<svelte:head>
    <title>{$page.status} · UnderSkin</title>
</svelte:head>

<InteractiveGradient config={ERROR_GRADIENT} />

<Navbar />

<main id="error-page">
    <div class="error-container">
        <!-- Commento solo il PERCHÉ: Il codice di stato e il sottotitolo ereditano lo stile Rethink Sans pesante del footer -->
        <h1 class="error-code">{$page.status}</h1>
        
        <!-- Commento solo il PERCHÉ: Messaggio poetico personalizzato visualizzato in evidenza -->
        <p class="error-message">
            Hai trovato una sfumatura della performance che non abbiamo ancora catalogato.<br />Evidentemente c'è ancora molto da scrivere.
        </p>

        <div class="action-container">
            <Button href="/" ariaLabel="Torna alla narrazione">
                Torna alla narrazione
            </Button>
        </div>
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
