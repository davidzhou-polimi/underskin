<script>
    /**
     * Assunzioni per questo componente unificato:
     * 1. Sostituisce i tre file Hero specifici in un unico componente riutilizzabile.
     * 2. Gestisce reattivamente sfondi e testi tramite le rune di Svelte 5.
     * 3. Tutte le animazioni GSAP e ScrollTrigger sono isolate nel context ed eseguono il cleanup su distruzione del componente.
     */

    import { onMount } from 'svelte';
    import { gsap } from 'gsap';
    import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

    import { trackSection } from '$lib/actions/trackSection.js';

    if (typeof window !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    /**
     * @typedef {Object} Props
     * @property {string} [title] - Il titolo principale dell'intestazione
     * @property {string} [sectionId] - L'ID univoco per lo scrollytelling
     * @property {string} [textShadow] - Effetto ombra per il testo
     * @property {'favorito' | 'infortunato' | 'insoddisfatto'} [theme] - Il tema per le impostazioni delle animazioni
     */

    /** @type {Props} */
    let {
        title = 'IL FAVORITO',
        sectionId = 'favorito-hero',
        textShadow = 'none',
        theme = 'favorito'
    } = $props();

    /** @type {HTMLHeadingElement | null} */
    let blobText = null;
    /** @type {HTMLElement | null} */
    let sectionRef = null;

    onMount(() => {
        if (!blobText || !sectionRef) return;

        const txt = blobText;
        const sec = sectionRef;

        gsap.set(txt, { opacity: 1 });

        const ctx = gsap.context(() => {
            // Dissolvenza e parallasse verticale del titolo durante lo scroll (MANTENUTO)
            gsap.fromTo(txt,
                { opacity: 1, y: 0 },
                {
                    opacity: 0,
                    y: theme === 'insoddisfatto' ? -80 : -50,
                    scrollTrigger: {
                        trigger: sec,
                        start: 'top top',
                        end: 'bottom 50%',
                        scrub: true
                    }
                }
            );
        });

        return () => ctx.revert();
    });
</script>

<section 
    id={sectionId} 
    class="blob-section" 
    class:mod-insoddisfatto={theme === 'insoddisfatto'} 
    bind:this={sectionRef} 
    use:trackSection={{ id: sectionId }}
>
    <div class="sticky-viewport">
    
        
        <div class="text-container">
            <h1 bind:this={blobText} class="blob-text" style:text-shadow={textShadow}>
                {title}
            </h1>
        </div>
    </div>
</section>

<style>
    .blob-section {
        position: relative;
        width: 100%;
        height: 100vh;
        /* Sfondo trasparente per far passare il gradiente interattivo globale */
        background-color: transparent; 
    }
    .sticky-viewport {
        position: sticky;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        overflow: hidden;
    }
    .circles-layer {
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
    }
    .text-container {
        position: absolute;
        inset: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10;
        padding: 0 2rem;
        pointer-events: none;
    }
    .blob-text {
        text-align: center;
        margin: 0;
        white-space: normal;
        word-wrap: break-word;
        max-width: 100%;
        font-size: var(--text-title-size);
        font-weight: var(--text-title-weight);
        color: var(--background-primary); 
        line-height: 1.1;
    }
</style>