<script>
    import { fly, fade } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import { onMount } from 'svelte';

    const stats = [
        '34% soffre di ansia o depressione',
        '26% sviluppa problemi mentali gravi dopo il ritiro',
        '45% manifesta disturbi alimentari',
        '53% soffre di solitudine',
        '36% soffre di disturbi del sonno'
    ];

    const scrollSteps = stats.length + 1;
    const scrollSegment = 0.5;
    /** @type {HTMLElement | null} */
    let section = null;
    let activeIndex = -1;

    onMount(() => {
        const updateActiveIndex = () => {
            if (!section) return;

            const sectionRect = section.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const scrollableDistance = Math.max(section.offsetHeight - viewportHeight, 1);
            const progress = Math.min(Math.max(-sectionRect.top / (scrollableDistance * scrollSegment), 0), 1);
            const nextIndex = Math.min(Math.floor(progress * scrollSteps) - 1, stats.length - 1);

            activeIndex = nextIndex;
        };

        updateActiveIndex();
        window.addEventListener('scroll', updateActiveIndex, { passive: true });
        window.addEventListener('resize', updateActiveIndex);

        return () => {
            window.removeEventListener('scroll', updateActiveIndex);
            window.removeEventListener('resize', updateActiveIndex);
        };
    });
</script>

<section bind:this={section} class="outro-scroll-container" aria-label="Statistiche sul dopo podio">
    <div class="viewport-sticky">
        <div class="scroll-flow">
            <div class="top-header">
                <h2 class="podium-title">Questo è ciò che non si vede sul podio:</h2>
            </div>

            <div class="stats-stage" aria-live="polite">
                {#if activeIndex >= 0}
                    {#key activeIndex}
                        <div class="phrase" in:fly={{ y: 18, duration: 220, easing: cubicOut }} out:fade={{ duration: 140 }}>
                            <span>{stats[activeIndex]}</span>
                        </div>
                    {/key}
                {/if}
            </div>
        </div>
    </div>
</section>

<style>
    .outro-scroll-container {
        position: relative;
        margin-top: 0;
        height: calc(100vh * 3);
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
        overflow: visible;
        box-sizing: border-box;
    }

    .scroll-flow {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
                padding-top: calc(50vh - 18px);
                padding-bottom: 12vh;
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

    .stats-stage {
        width: 100%;
        min-height: 4rem;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: var(--spacing-13);
    }

    .phrase {
        display: inline-flex;
        align-items: center;
        font-family: var(--font-family-base);
        font-size: 24px;
        font-weight: 700;
        color: var(--content-primary);
        line-height: 1.2;
        text-align: center;
        max-width: 42rem;
        padding: 0 var(--spacing-4);
        box-sizing: border-box;
    }
</style>