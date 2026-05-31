<script>
    // Commento solo il PERCHÉ: Importa le sezioni e lo store di narrazione per orchestrare
    // la visualizzazione condizionale della sezione corrente attiva sulla pagina singola.
    import MainSection from "$lib/components/sections/MainSection.svelte";
    import Footer from "$lib/components/sections/Footer.svelte";
    import FavoritoSection from "$lib/components/sections/FavoritoSection.svelte";
    import InsoddisfattoSection from "$lib/components/sections/InsoddisfattoSection.svelte";
    import InfortunatoSection from "$lib/components/sections/InfortunatoSection.svelte";
    import InteractiveGradient from "$lib/components/ui/InteractiveGradient.svelte";
    import { narrative } from "$lib/stores/narrative.svelte.js";
    import { scroll } from "$lib/stores/scroll.svelte.js";
    import { trackScrollProgress } from "$lib/actions/trackScrollProgress.js";

    // Commento solo il PERCHÉ: Associa a ciascuna sezione narrativa i relativi parametri del
    // gradiente per pilotare l'animazione fluida dell'unico canvas di sfondo globale.
    /** @type {Record<string, any>} */
    const SECTION_CONFIGS = {
        hero: {
            coverage: 0.3,
            maskClamp: [0.0, 0.7],
            grainIntensity: 0.1,
            colors: null,
            focusCenter: [0.5, 0.5],
            focusRadius: 2.0,
        },
        favorito: {
            colors: [
                "var(--azzurro-200)",
                "var(--archetipi-favorito)",
                "var(--azzurro-600)",
            ],
            coverage: 1.0,
            maskClamp: [0.0, 1.0],
            grainIntensity: 0.05,
        },
        insoddisfatto: {
            colors: [
                "var(--viola-200)",
                "var(--archetipi-insoddisfatto)",
                "var(--viola-600)",
            ],
            coverage: 1.0,
            maskClamp: [0.0, 1.0],
            grainIntensity: 0.025,
        },
        infortunato: {
            colors: [
                "var(--arancione-200)",
                "var(--archetipi-infortunato)",
                "var(--arancione-600)",
            ],
            coverage: 1.0,
            maskClamp: [0.0, 1.0],
            grainIntensity: 0.05,
        },
    };

    let scrollY = $state(0);
    let innerHeight = $state(0);

    // Commento solo il PERCHÉ: Determina dinamicamente se l'utente ha scrollato oltre
    // l'altezza esatta del viewport corrente (100vh) per modificare i parametri del gradiente.
    let isPastFirstViewport = $derived(scrollY > innerHeight / 1.5);

    // Commento solo il PERCHÉ: Determina se l'utente ha quasi completato lo scroll della sezione Hero
    // (es. progress > 80%) per concentrare i gradienti sul fondo.
    let isNearHeroBottom = $derived(
        narrative.activeSection === "hero" && scroll.progress > 0.99,
    );

    // Commento solo il PERCHÉ: Calcola la configurazione del gradiente reagendo allo scroll reale
    // in pixel o alla vicinanza al fondo della Hero per evitare errori dovuti ad altezze dinamiche delle sezioni.
    let activeConfig = $derived(
        isNearHeroBottom
            ? {
                  ...SECTION_CONFIGS.hero,
                  coverage: 1.0,
                  mouseStrength: 100.0,
                  focusCenter: [0.5, -0.2],
                  focusRadius: [1.5, 0.95],
              }
            : isPastFirstViewport &&
                ["favorito", "insoddisfatto", "infortunato"].includes(
                    narrative.activeSection,
                )
              ? {
                    ...SECTION_CONFIGS[narrative.activeSection],
                    coverage: 0.3,
                }
              : SECTION_CONFIGS[narrative.activeSection] ||
                SECTION_CONFIGS.hero,
    );
</script>

<svelte:window bind:scrollY bind:innerHeight />

<InteractiveGradient config={activeConfig} />

<main use:trackScrollProgress>
    {#if narrative.activeSection === "hero"}
        <MainSection />
        <section class="scroll-spacer" aria-hidden="true"></section>
        <Footer />
    {:else if narrative.activeSection === "favorito"}
        <FavoritoSection />
        <section class="scroll-spacer" aria-hidden="true"></section>
    {:else if narrative.activeSection === "insoddisfatto"}
        <InsoddisfattoSection />
        <section class="scroll-spacer" aria-hidden="true"></section>
    {:else if narrative.activeSection === "infortunato"}
        <InfortunatoSection />
        <section class="scroll-spacer" aria-hidden="true"></section>
    {/if}
</main>

<style>
    main {
        background: transparent;
    }

    .scroll-spacer {
        min-height: 300vh;
    }
</style>
