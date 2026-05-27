<script>
    import { onMount } from 'svelte';
    import GlassEffect from '$lib/components/ui/GlassEffect.svelte';

    // Testo strutturato per riga
    const stats = [
        "34% soffre di ansia o depressione",
        "26% sviluppa problemi mentali gravi dopo il ritiro",
        "45% manifesta disturbi alimentari",
        "53% soffre di solitudine",
        "36% soffre di disturbi del sonno"
    ];

    const allWords = stats.flatMap((line, lineIndex) => {
        const words = line.split(' ');
        return words.map((word, wordIndex) => ({
            text: word,
            isLastOfLine: wordIndex === words.length - 1 && lineIndex < stats.length - 1
        }));
    });

    // Offsets per riga per mappare l'indice globale dei word
    const lineOffsets = (() => {
        const out = [];
        let acc = 0;
        for (const line of stats) {
            out.push(acc);
            acc += line.split(' ').length;
        }
        return out;
    })();

    /** @type {HTMLElement | null} */
    let container = null;
    /** @type {HTMLElement | null} */
    let titleElement = null;

    // Gestione degli stati dell'animazione
    let showStats = false; 
    let textRevealProgress = 0; // Progresso dedicato unicamente all'accensione delle parole

    // Numero di parole da mostrare in base al progresso (0..allWords.length)
    $: revealedCount = Math.floor(textRevealProgress * allWords.length);

    onMount(() => {
        const handleScroll = () => {
            if (!container || !titleElement) return;
            
            const rect = container.getBoundingClientRect();
            const titleRect = titleElement.getBoundingClientRect();
            const viewHeight = window.innerHeight;
            
            // 1. BREAKPOINT VISIVO (75% dello schermo)
            // Calcoliamo quando la cima del titolo si trova al 25% dall'alto del browser (ovvero ha scalato il 75% della pagina)
            const breakpoint = viewHeight * 0.25;
            showStats = titleRect.top <= breakpoint;

            // 2. ANIMAZIONE DELLE PAROLE (Indipendente dallo scroll generale)
            // Se il blocco è visibile, iniziamo a calcolare il progresso di accensione basandoci su quanti pixel 
            // il titolo ha percorso *oltre* il breakpoint. Questo garantisce che l'animazione avvenga solo quando vedi il testo!
            if (showStats) {
                const pixelsPastBreakpoint = breakpoint - titleRect.top;
                // Dividiamo per 300px per decidere la "durata dello scroll" dell'accensione delle parole
                textRevealProgress = Math.min(Math.max(pixelsPastBreakpoint / 300, 0), 1);
            } else {
                textRevealProgress = 0;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);
        handleScroll();
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    });
</script>

<div bind:this={container} class="outro-scroll-container">
    
    <div class="viewport-sticky">
        
        <div class="scroll-flow">
            
            <div bind:this={titleElement} class="top-header">
                <h2 class="podium-title">Questo è ciò che non si vede sul podio:</h2>
            </div>

            <GlassEffect class={"stats-glass " + (showStats ? 'revealed' : '')}>
                <div class="stats-content">
                    {#each stats as line, lineIndex}
                        {@const words = line.split(' ')}
                        {@const offset = lineOffsets[lineIndex]}
                        <div class="line">
                            {#each words as w, wi}
                                {@const globalIndex = offset + wi}
                                
                                <span class="word" class:visible={globalIndex < revealedCount}>{w}{' '}</span>
                            {/each}
                        </div>
                    {/each}
                </div>
            </GlassEffect>

        </div>

    </div>
</div>

<style>
    .outro-scroll-container {
        position: relative;
        margin-top: 0;
        /* Altezza totale della sezione per gestire la fluidità dello scroll */
        height: 160vh; 
        background-color: var(--background-primary);
        margin-left: 0;
        margin-right: 0;
        padding: 0;
    }

    .viewport-sticky {
        position: sticky;
        top: 0;
        height: 100vh;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        /* Allow content to be visible when it overflows the sticky viewport
           to avoid clipping lines of the stats block during reveal. */
        overflow: visible;
        box-sizing: border-box;
    }

    /* Gestisce lo scorrimento del testo verso l'alto come un normale testo di pagina */
    .scroll-flow {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        
        /* TRUCCO PER LA CENTRATURA: 
           All'avvio (scroll = 0), il padding-top spinge il titolo esattamente a metà dello schermo (50vh) 
           sottraendo circa metà dell'altezza della riga del titolo per una precisione millimetrica al 50/50. */
        padding-top: calc(50vh - 18px); 
        padding-bottom: 30vh;
    }

    .top-header {
        text-align: center;
        width: 100%;
        position: relative;
    }

    .podium-title {
        font-family: var(--font-family-base);
        font-size: var(--text-xl);
        font-weight: 700;
        color: var(--content-primary);
        margin: 0;
    }

    :global(.stats-glass) {
        width: 100%;
        max-width: 800px;
        margin-top: var(--spacing-13); 
        border-radius: 24px;
        padding: var(--spacing-5) var(--spacing-6);
        box-sizing: border-box;
        position: relative;

        /* Stato iniziale: dissolvenza pulita prima del breakpoint */
        opacity: 0;
        transform: translateY(15px);
        transition: opacity 0.4s ease-out, transform 0.4s ease-out;
        pointer-events: none;
    }

    /* Quando il titolo taglia la linea del 75% dello schermo, il blocco appare */
    :global(.stats-glass.revealed) {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
    }

    .stats-content {
        width: 100%;
        text-align: center;
    }

    .line {
        font-family: var(--font-family-base);
        font-size: var(--text-s);
        font-weight: 700;
        line-height: 1.25;
        margin: 0;
        display: block;
        white-space: nowrap;
        margin-bottom: var(--spacing-1);
    }

    .word {
        color: var(--neutral-400); 
        transition: color 0.15s ease-out;
        display: inline-block;
        white-space: pre;
    }

    .word.visible {
        color: var(--content-primary);
    }
</style>