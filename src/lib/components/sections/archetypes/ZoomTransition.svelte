<script>
    import { zoomTextTransition } from '$lib/actions/archetypes/zoomTextTransition.js';

    /**
     * @typedef {Object} Props
     * @property {'favorito' | 'infortunato' | 'insoddisfatto'} [theme] - Il tema cromatico dell'archetipo
     * @property {string} [nextTitle] - Il titolo della sezione successiva
     * @property {import('svelte').Snippet} [children] - Frammento Svelte per iniettare contenuti personalizzati
     * @property {(revealed: boolean) => void} [onRevealChange] - Notifica quando lo zoom rivela/nasconde il contenuto successivo
     */

    /** @type {Props} */
    let {
        theme = 'favorito',
        nextTitle = 'Nuova Sezione',
        children = undefined,
        onRevealChange = undefined
    } = $props();

    /** @type {Record<string, string>} */
    const themeColors = {
        favorito: 'var(--azzurro-600)',
        infortunato: 'var(--arancione-600)',
        insoddisfatto: 'var(--viola-500)'
    };

    let textColor = $derived(themeColors[theme] || 'var(--azzurro-600)');
</script>

<section id="zoom-transition" class="zoom-section" use:zoomTextTransition={{ onRevealChange }}>
    
    <div class="intro-container">
        <p class="first-text">Alcuni casi a</p>
        
        <!-- Desktop: SVG con zoom cinematografico via viewBox nativo -->
        <svg class="zoom-svg" viewBox="0 0 1000 400" width="100%" height="100%">
            <g class="zoom-content">
                <text class="zoom-text" x="500" text-anchor="middle" style:fill={textColor}><tspan x="500" dy="180">Milano Cortina</tspan><tspan x="500" dy="220" class="year-text">2026</tspan></text>
            </g>
        </svg>

        <!-- Mobile: testo bold che riempie lo schermo, fade al posto dello zoom -->
        <div class="zoom-text-mobile">
            <p class="mobile-eyebrow">Alcuni casi a</p>
            <div class="mobile-title-block" style:color={textColor}>
                <span class="mobile-title-line">Milano</span>
                <span class="mobile-title-line">Cortina</span>
                <span class="mobile-year">2026</span>
            </div>
        </div>
    </div>

    <div class="next-section-content">
        <div class="content-wrapper">
            {#if children}
                {@render children()}
            {:else}
                <h3>{nextTitle}</h3>
            {/if}
        </div>
    </div>

</section>

<style>
    .zoom-section {
        --placeholder-color: var(--content-primary, #111111);
        position: relative;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
        background-color: transparent;
        font-family: var(--font-family-base);
        z-index: 5;
        /* Avvicina la sezione a quella precedente sovrapponendo i margini vuoti in modo trasparente per migliorare la fluidità visiva dello scroll */
        margin-top: -25vh;
    }

    .intro-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 1;
        padding: var(--spacing-4);
    }

    .first-text {
        font-size: var(--text-caption-size);
        font-weight: var(--text-caption-weight);
        color: var(--content-primary);
        margin-bottom: var(--spacing-4);
    }

    /* Stili per l'SVG e il testo vettoriale */
    .zoom-svg {
        max-width: 900px;
        max-height: 350px;
        overflow: visible;
    }

    .zoom-text {
        font-size: var(--text-3xl); /* Dimensione calibrata sul viewBox dell'SVG */
        /* Commento solo il PERCHÉ: allinea il testo zoom dell'SVG con il peso massimo (black) definito globalmente */
        font-weight: var(--text-black);
        line-height: 1.1;
    }

    /* ==========================================================================
       MOBILE LAYOUT
       ========================================================================== */

    .zoom-text-mobile {
        display: none;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: var(--spacing-3);
    }

    .mobile-eyebrow {
        font-size: var(--text-caption-size);
        font-weight: var(--text-regular);
        color: var(--content-primary);
    }

    .mobile-title-block {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .mobile-title-line {
        display: block;
        /* Commento solo il PERCHÉ: valore vw puro perché --text-3xl (80px) è il token massimo
           ma non basta a riempire la larghezza dello schermo. 25vw = ~97px su 390px, che fa
           sì che "Milano" e "Cortina" coprano quasi tutta la viewport mobile */
        font-size: 25vw;
        font-weight: var(--text-black);
        line-height: 0.95;
        letter-spacing: -0.02em;
    }

    .mobile-year {
        /* Commento solo il PERCHÉ: vw puro allineato alla stessa logica di .mobile-title-line,
           leggermente più piccolo (~66px su 390px) per dare gerarchia senza perdere il peso */
        font-size: 17vw;
        font-weight: var(--text-black);
        letter-spacing: -0.01em;
        line-height: 1;
        margin-top: var(--spacing-2);
    }

    @media (max-width: 768px) {
        /* Neutralizza la sovrapposizione: su mobile il -25vh anticipava l'aggancio del pin
           (anticipatePin) creando un salto d'ingresso; il desktop mantiene l'overlap.
           svh (statico, pattern IntroSection): il box pinnato coincide col viewport visibile
           a barra browser mostrata, così il contenuto centrato (deck atleti) non scivola
           sotto la piega; niente thrashing di ScrollTrigger, a differenza di dvh. */
        .zoom-section {
            margin-top: 0;
            height: 100vh;
            height: 100svh;
        }

        .zoom-svg {
            display: none;
        }

        /* Nasconde il .first-text desktop: l'eyebrow è dentro .zoom-text-mobile */
        .first-text {
            display: none;
        }

        .zoom-text-mobile {
            display: flex;
        }
    }

    .next-section-content {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
        /* Commento solo il PERCHÉ: rende lo sfondo trasparente per consentire il passaggio fluido e continuo del canvas di gradiente interattivo globale */
        background-color: transparent;
        overflow: visible;
        /* Rende la sezione e tutti i suoi figli invisibili e non interattivi finché non inizia la dissolvenza */
        visibility: hidden;
    }
</style>
