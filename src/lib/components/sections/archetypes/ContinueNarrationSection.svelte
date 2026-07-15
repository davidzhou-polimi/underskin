<script>
    import ArchetypeCard from "$lib/components/ui/ArchetypeCard.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import { goto } from "$app/navigation";
    import { base } from '$app/paths';
    import { navigationState } from "$lib/stores/navigationState.svelte.js";
    import { staggerReveal } from "$lib/actions/staggerReveal.js";
    import { continueNarrationReveal } from "$lib/actions/continueNarrationReveal.js";
    import { media } from "$lib/stores/mediaQuery.svelte.js";

    /**
     * @type {{
     *   archetype?: 'favorito' | 'infortunato' | 'insoddisfatto',
     *   onVisibilityChange?: (visible: boolean) => void
     * }}
     */
    let { archetype = "favorito", onVisibilityChange } = $props();

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
            videoSrc: `${base}/videos/favorito.webm`,
        },
        {
            name: "L'infortunato",
            type: "infortunato",
            videoSrc: `${base}/videos/infortunato.webm`,
        },
        {
            name: "L'insoddisfatto",
            type: "insoddisfatto",
            videoSrc: `${base}/videos/insoddisfatto.webm`,
        },
    ];

    // Escludiamo l'archetipo corrente per visualizzare solo gli altri due
    let filteredArchetypes = $derived(
        allArchetypes.filter((item) => item.type !== archetype),
    );

    // Reindirizziamo alla rotta radice impostando lo store per innescare la transizione cinematica
    const handleButtonClick = () => {
        navigationState.fromArchetype = true;
        goto(`${base}/`);
    };
</script>

<section
    id="continue-narration"
    class="continue-section"
    use:continueNarrationReveal={{ onVisibilityChange }}
>
    <div class="continue-container">
        <div class="center-content">
            <!-- Titolo della sezione con stile tipografico grande coordinato -->
            <h3 class="continue-title">Continua a esplorare</h3>

            <!-- Contenitore delle due card visualizzate in orizzontale -->
            <div
                class="cards-grid"
                use:staggerReveal={{
                    y: 40,
                    duration: 0.7,
                    triggerOptions: { toggleActions: "play none none reverse" },
                    // Su mobile niente slide-up: le card sono subito visibili
                    enabled: !media.isMobile,
                }}
            >
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
        /* Trasparente (era opaco): espone il canvas del gradiente, che qui viene portato a
           intensity:0 (invisibile) da onVisibilityChange — a riposo nessuna differenza visiva,
           ma il reveal verso home diventa un fade animato invece di una comparsa improvvisa. */
        background-color: transparent;
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
        /* Commento solo il perché: raggruppa tutti i contenuti (titolo, card e bottone) al centro esatto dello schermo */
        justify-content: center;
        /* Commento solo il perché: definisce uno stacco bilanciato tra la griglia dei contenuti e l'azione finale */
        gap: var(--spacing-8);
        padding-inline: var(--spacing-2);
        box-sizing: border-box;
    }

    .center-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
    }

    .continue-title {
        /* Commento solo il PERCHÉ: allinea lo stile del titolo a quello delle altre sezioni principali */
        font-size: var(--text-m);
        font-weight: var(--text-regular);
        color: var(--content-primary);
        text-align: center;
        /* Commento solo il perché: definisce lo spazio verticale per distanziare il titolo dagli altri elementi */
        margin-top: var(--spacing-0);
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
        /* nascosto dal primo paint; GSAP lo porta a opacity:1 quando si tocca il fondo pagina */
        opacity: 0;
    }

    /* Responsive per schermi più piccoli */
    @media (max-width: 1024px) {
        .cards-grid {
            flex-direction: column;
            gap: var(--spacing-4);
        }
    }

    @media (max-width: 768px) {
        .continue-container {
            /* Il max-width 320px (--spacing-17 mobile) strozzava le card orizzontali
               deformandole; i fili laterali sono gli stessi della navbar (--spacing-6) */
            max-width: none;
            padding-inline: var(--spacing-6);
        }

        .cards-grid {
            /* Metà del gap tablet: in colonna su viewport bassi le due card devono restare
               entrambe leggibili senza spingere il bottone fuori dall'inquadratura */
            gap: var(--spacing-2);
        }
    }
</style>
