<script>
    import ArchetypeCard from "$lib/components/ui/ArchetypeCard.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import { goto } from "$app/navigation";
    import { navigationState } from "$lib/stores/navigationState.svelte.js";

    /**
     * @type {{
     *   archetype?: 'favorito' | 'infortunato' | 'insoddisfatto'
     * }}
     */
    let { archetype = "favorito" } = $props();

    // Lista statica di tutti gli archetipi disponibili
    /**
     * @type {Array<{
     *   name: string,
     *   type: 'favorito' | 'infortunato' | 'insoddisfatto',
     *   videoSrc: string
     * }>}
     */
    const allArchetypes = [
        {
            name: "Il favorito",
            type: "favorito",
            videoSrc: "/videos/favorito.webm",
        },
        {
            name: "L'infortunato",
            type: "infortunato",
            videoSrc: "/videos/infortunato.webm",
        },
        {
            name: "L'insoddisfatto",
            type: "insoddisfatto",
            videoSrc: "/videos/insoddisfatto.webm",
        },
    ];

    // Escludiamo l'archetipo corrente per visualizzare solo gli altri due
    let filteredArchetypes = $derived(
        allArchetypes.filter((item) => item.type !== archetype),
    );

    // Reindirizziamo alla rotta radice impostando lo store per innescare la transizione cinematica
    const handleButtonClick = () => {
        navigationState.fromArchetype = true;
        goto("/");
    };
</script>

<section
    id="continue-narration"
    class="continue-section"
>
    <div class="continue-container">
        <div class="center-content">
            <!-- Titolo della sezione con stile tipografico grande coordinato -->
            <h3 class="continue-title">Continua a esplorare</h3>

            <!-- Contenitore delle due card visualizzate in orizzontale -->
            <div class="cards-grid">
                {#each filteredArchetypes as item (item.name)}
                    <ArchetypeCard
                        name={item.name}
                        type={item.type}
                        videoSrc={item.videoSrc}
                        horizontal={true}
                        showTooltip={false}
                    />
                {/each}
            </div>
        </div>

        <!-- Bottone a forma di pillola traslucido con colore background primary, opacità 40% e shadow leggera -->
        <div class="action-container">
            <Button
                onclick={handleButtonClick}
                ariaLabel="Vai alla conclusione"
            >
                Vai alla conclusione
            </Button>
        </div>
    </div>
</section>

<style>
    .continue-section {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        width: 100%;
        padding-top: var(--spacing-10);
        padding-bottom: var(--spacing-10);
        box-sizing: border-box;
        background-color: var(--background-primary);
        overflow: hidden;
    }

    .continue-container {
        width: 100%;
        max-width: var(--spacing-17);
        /* Commento solo il perché: forza il contenitore ad occupare l'altezza visibile al netto dei padding */
        min-height: calc(100vh - (var(--spacing-10) * 2));
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        padding-inline: var(--spacing-2);
        box-sizing: border-box;
    }

    .center-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        /* Commento solo il perché: distribuisce lo spazio extra per centrare verticalmente il blocco principale */
        flex-grow: 1;
        width: 100%;
    }

    .continue-title {
        /* Commento solo il PERCHÉ: allinea lo stile del titolo a quello delle altre sezioni principali */
        font-size: var(--text-m);
        font-weight: var(--text-regular);
        color: var(--content-primary);
        text-align: center;
        /* Commento solo il perché: definisce lo spazio verticale per distanziare il titolo dagli altri elementi */
        margin-top: var(--spacing-6);
        margin-bottom: var(--spacing-6);
    }

    .cards-grid {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: var(--spacing-4);
        width: 100%;
    }

    .action-container {
        display: flex;
        justify-content: center;
        width: 100%;
    }

    /* Responsive per schermi più piccoli */
    @media (max-width: 1024px) {
        .cards-grid {
            flex-direction: column;
            gap: var(--spacing-4);
        }
    }
</style>
