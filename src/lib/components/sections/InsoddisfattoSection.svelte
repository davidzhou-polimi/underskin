<script>
    // Commento solo il PERCHÉ: Importa trackSection per aggiornare lo store dello scroll
    import { trackSection } from "$lib/actions/trackSection.js";
</script>

<section id="insoddisfatto" class="insoddisfatto-section" use:trackSection>
    <div class="content">
        <h2>INSODDISFATTO</h2>
    </div>
</section>

<style>
    .insoddisfatto-section {
        position: relative;
        overflow: hidden;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        color: color-mix(in srgb, var(--content-dark-primary) 70%, transparent);
        font-size: var(--text-title-size);
        font-weight: var(--text-title-weight);
    }

    .content {
        position: relative;
        z-index: 1;
        text-align: center;
    }
</style>
