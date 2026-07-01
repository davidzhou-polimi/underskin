<script>
    import ArchetypeCard from "$lib/components/ui/ArchetypeCard.svelte";
    import { staggerReveal } from "$lib/actions/staggerReveal.js";
    import { sectionPin } from "$lib/actions/sectionPin.js";

    /**
     * @typedef {Object} Props
     * @property {string} [title]
     * @property {Array<{ name: string, type: 'favorito' | 'infortunato' | 'insoddisfatto', videoSrc?: string, imageSrc?: string }>} [items]
     * @property {boolean} [clickable]
     */

    /** @type {Props} */
    let {
        title = "Conosci gli archetipi",
        items = undefined,
        clickable = true,
    } = $props();

    /** @type {{ name: string, type: 'favorito' | 'infortunato' | 'insoddisfatto', videoSrc?: string, imageSrc?: string }[]} */
    const defaultItems = [
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

    const activeItems = $derived(items || defaultItems);
</script>

<section
    id="archetypes"
    class="archetype-section"
    use:sectionPin
>
    {#if title}
        <h3 class="section-title">{title}</h3>
    {/if}

    <div class="cards-row" use:staggerReveal>
        {#each activeItems as archetype (archetype.name)}
            <ArchetypeCard
                name={archetype.name}
                videoSrc={archetype.videoSrc ?? ""}
                imageSrc={archetype.imageSrc ?? ""}
                type={archetype.type}
                {clickable}
            />
        {/each}
    </div>
</section>

<style>
    .archetype-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        margin-top: -15vh;
        width: 100%;
        padding-top: var(--spacing-10);
        padding-bottom: var(--spacing-3);
        box-sizing: border-box;
        overflow: hidden;
    }

    .section-title {
        font-size: var(--text-m);
        /* Commento solo il PERCHÉ: allinea il peso del titolo della sezione con il peso regular globale */
        font-weight: var(--text-regular);
        color: var(--content-primary);
        text-align: center;
        margin: 0 0 var(--spacing-6) 0;
        max-width: var(--spacing-17);
        margin-bottom: var(--spacing-6);
    }

    .cards-row {
        display: flex;
        flex-direction: row;
        gap: var(--spacing-4);
        justify-content: center;
        align-items: flex-end;
        flex-wrap: wrap;
        padding-inline: var(--spacing-4);
        box-sizing: border-box;
    }

    @media (max-width: 768px) {
        .archetype-section {
            /* Commento solo il PERCHÉ: azzera il margine superiore negativo su mobile 
               per evitare conflitti spaziali con la sezione precedente */
            margin-top: 0;
            padding-top: var(--spacing-6);
        }

        .cards-row {
            /* Commento solo il PERCHÉ: passa ad una disposizione verticale in colonna 
               per ospitare correttamente le tre carte archetipo su schermi stretti */
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-6);
        }
    }
</style>
