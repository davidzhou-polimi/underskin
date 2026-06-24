<script>
    /**
     * SVELTE 5 - ORCHESTRATORE HOME PAGE (UNDER SKIN)
     * Caratteristiche:
     * 1. Amalgama i colori di tutti e tre gli archetipi in modo perfettamente equo e bilanciato.
     * 2. Utilizza le Svelte 5 Runes per il monitoraggio geometrico della viewport.
     * 3. Attiva una transizione cromatica accelerata e intensa in prossimità del Footer.
     * 4. Isola e preserva i listener di blocco dello scroll quando il Quiz è attivo.
     */

    // Importazione dei componenti strutturali del flusso di pagina
    import Intro from '$lib/components/sections/home/Intro.svelte';
    import Quiz from '$lib/components/sections/home/Quiz.svelte';
    import Performance from '$lib/components/sections/home/Performance.svelte';
    import ArchetypeSection from '$lib/components/sections/archetypes/ArchetypeSection.svelte';
    import Outro from '$lib/components/sections/home/Outro.svelte';
    import Burnout from '$lib/components/sections/home/Burnout.svelte';
    import Final from '$lib/components/sections/home/Final.svelte';
    import Footer from '$lib/components/sections/Footer.svelte';
    import InteractiveGradient from '$lib/components/ui/InteractiveGradient.svelte';
    import { trackScrollProgress } from '$lib/actions/trackScrollProgress.js';
    import { createFullPageGradientConfig } from '$lib/stores/scrollGradient.svelte.js';
    import { onMount } from 'svelte';

    // Stati reattivi per la gestione del blocco interattivo del Quiz
    let isLocked = $state(false);
    let quizExpanded = $state(false);

    const gradient = createFullPageGradientConfig();

    onMount(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('fromArchetype') === 'true') {
            // Seleziona la sezione degli archetipi e l'outro per coordinare il viaggio visivo dell'utente
            const archetypesSection = document.getElementById('archetypes');
            const outroSection = document.querySelector('.outro-scroll-container');

            if (archetypesSection && outroSection) {
                // Commento solo il PERCHÉ: utilizza un micro-timeout per assicurarsi che il posizionamento avvenga
                // dopo che SvelteKit ha completato la navigazione e il posizionamento dello scroll nativo
                setTimeout(() => {
                    // Posiziona istantaneamente l'utente alla griglia delle card
                    archetypesSection.scrollIntoView({ behavior: 'instant' });

                    // Commento solo il PERCHÉ: attende un secondo per mostrare all'utente le card di provenienza,
                    // dopodiché avvia uno scorrimento morbido e cinematico verso la sezione di chiusura (outro)
                    setTimeout(() => {
                        outroSection.scrollIntoView({ behavior: 'smooth' });

                        // Commento solo il PERCHÉ: rimuove il parametro dall'URL per evitare la riesecuzione
                        // della transizione automatica nel caso in cui l'utente ricarichi manualmente la pagina
                        const url = new URL(window.location.href);
                        url.searchParams.delete('fromArchetype');
                        window.history.replaceState({}, '', url.toString());
                    }, 500);
                }, 50);
            }
        }
    });

    /**
     * Intercetta e blocca i tentativi di scroll quando il quiz è attivo,
     * consentendo il normale scorrimento se il quiz è espanso a schermo intero.
     * @param {WheelEvent | TouchEvent} e - L'evento di input della finestra
     */
    function handlePreventScroll(e) {
        if (quizExpanded) return;

        if (isLocked && e.cancelable) {
            e.preventDefault();
        }
    }
</script>

<svelte:window bind:scrollY={gradient.scrollY} bind:innerHeight={gradient.innerHeight} onwheel={handlePreventScroll} ontouchmove={handlePreventScroll} />

<InteractiveGradient config={gradient.activeConfig} />

<main class="page-flow" use:trackScrollProgress>
    <Intro />
    <Quiz
        lockScroll={() => isLocked = true}
        unlockScroll={() => isLocked = false}
        onExpand={() => quizExpanded = true}
        onCollapse={() => quizExpanded = false}
    />
    <Performance />
	<ArchetypeSection />
    <Outro />
    <Burnout />
    <Final />
    <Footer />
</main>

<style>
    /* Mantiene il flusso di pagina strutturalmente trasparente per esporre il canvas in posizione fixed */
    .page-flow {
        position: relative;
        width: 100%;
        min-height: 100vh;
        background: transparent;
    }

    :global(body) {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
        background-color: var(--background-primary);
    }
</style>