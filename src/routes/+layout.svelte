<script>
    import Navbar from '$lib/components/navbar/Navbar.svelte';
    import 'modern-normalize/modern-normalize.css';
    import '$lib/styles/tokens.css';
    import favicon from '$lib/assets/favicon.svg';

    let { children } = $props();
</script>

<svelte:head>
    <title>UnderSkin</title>
    <meta name="description" content="UnderSkin — Digital project exploring the psychological dimensions of high-level athletic performance." />

    <link rel="icon" href={favicon} />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Rethink+Sans:ital,wght@0,400..800;1,400..800&display=swap" rel="stylesheet" />
</svelte:head>

<Navbar />

<main class="global-layout">
    {@render children()}
</main>

<style>
    /* Forziamo le impostazioni di base dell'HTML sul tema chiaro del brand */
    :global(html), :global(body) {
        margin: 0;
        padding: 0;
        width: 100%;
        min-height: 100vh;
        /* Applica lo sfondo chiaro #F1FAFD nativo dai tuoi token */
        background-color: var(--background-primary, #F1FAFD);
        /* Imposta il colore di lettura principale #071E45 */
        color: var(--content-primary, #071E45);
        font-family: 'Rethink Sans', sans-serif;
        overflow-x: hidden;
        -webkit-font-smoothing: antialiased;
    }

    /* Struttura fluida per il posizionamento verticale delle sezioni */
    .global-layout {
        display: flex;
        flex-direction: column;
        width: 100%;
        min-height: 100vh;
        /* Aggiunge un padding superiore per evitare che la Navbar fissa copra la Hero iniziale */
        padding-top: calc(68px + (var(--spacing-4, 32px) * 2)); 
        box-sizing: border-box;
    }
</style>