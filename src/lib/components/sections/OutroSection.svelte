<script>
    import { onMount } from 'svelte';
    import { getClockwiseCircleMeasure } from '$lib/utils/circleMeasure.js';

    /** @type {HTMLElement | null} */
    let section = null;
    /** @type {HTMLElement | null} */
    let title = null;
    let titleTopPx = '0px';
    let circleTopPx = '0px';
    let circleOpacity = 0;
    let circleReveal = 0;
    let circlePercentage = '34%';
    let circleDescriptionLines = ['soffre di ansia o depressione'];
    let circleDescriptionGapPx = '0px';
    let circleArcTarget = 34;

    const circleStages = [
        {
            percentage: '34%',
            descriptionLines: ['soffre di ansia o depressione'],
            descriptionGapPx: '0px',
            target: 34
        },
        {
            percentage: '45%',
            descriptionLines: ['manifesta disturbi alimentari'],
            descriptionGapPx: '0px',
            target: 45
        },
        {
            percentage: '26%',
            descriptionLines: ['sviluppa problemi mentali gravi', 'dopo il ritiro'],
            descriptionGapPx: '5px',
            target: 26
        },
        {
            percentage: '36%',
            descriptionLines: ['soffre di disturbi del sonno'],
            descriptionGapPx: '0px',
            target: 36
        },
        {
            percentage: '53%',
            descriptionLines: ['soffre di solitudine'],
            descriptionGapPx: '0px',
            target: 53
        }
    ];

    /**
     * @param {number} value
     * @param {number} min
     * @param {number} max
     */
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    /**
     * @param {string} tokenName
     */
    const getRootSpacingPx = (tokenName) => {
        const rootStyles = getComputedStyle(document.documentElement);
        const tokenValue = rootStyles.getPropertyValue(tokenName).trim();
        const rootFontSize = parseFloat(rootStyles.fontSize) || 16;

        return parseFloat(tokenValue) * rootFontSize;
    };

    onMount(() => {
        const updateScene = () => {
            if (!section || !title) return;

            const sectionRect = section.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const scrollableDistance = Math.max(section.offsetHeight - viewportHeight, 1);
            const progress = Math.min(Math.max(-sectionRect.top / scrollableDistance, 0), 1);

            const titleHeight = title.offsetHeight;
            const titleStartTop = (viewportHeight - titleHeight) / 2;
            const titleEndTop = getRootSpacingPx('--spacing-12');
            const titleProgress = clamp(progress / 0.3, 0, 1);
            const titleTop = titleStartTop + (titleEndTop - titleStartTop) * titleProgress;
            const circleStart = 0.45;
            const stageStride = (1 - circleStart) / circleStages.length;
            const fillDuration = 0.08;
            const stageIndex = clamp(Math.floor((progress - circleStart) / stageStride), 0, circleStages.length - 1);
            const stageStart = circleStart + stageIndex * stageStride;
            const stageFillProgress = clamp((progress - stageStart) / fillDuration, 0, 1);
            const activeStage = circleStages[stageIndex];

            titleTopPx = `${titleTop}px`;
            circleTopPx = `${titleEndTop + titleHeight + getRootSpacingPx('--spacing-8')}px`;
            circleOpacity = clamp((progress - circleStart) / 0.08, 0, 1);
            circlePercentage = activeStage.percentage;
            circleDescriptionLines = activeStage.descriptionLines;
            circleDescriptionGapPx = activeStage.descriptionGapPx;
            circleArcTarget = activeStage.target;
            circleReveal = getClockwiseCircleMeasure(stageFillProgress) * (activeStage.target / 100);
        };

        updateScene();
        window.addEventListener('scroll', updateScene, { passive: true });
        window.addEventListener('resize', updateScene);

        return () => {
            window.removeEventListener('scroll', updateScene);
            window.removeEventListener('resize', updateScene);
        };
    });
</script>

<section bind:this={section} class="outro-scroll-container" aria-label="Titolo sul dopo podio">
    <div class="scene">
        <h2 bind:this={title} class="podium-title" style={`--title-top: ${titleTopPx};`}>
            Questo è ciò che non si vede sul podio:
        </h2>

        {#if circleOpacity > 0}
            <div class="circle-stage" style={`--circle-top: ${circleTopPx}; --circle-opacity: ${circleOpacity};`}>
                <div class="circle-copy">
                    <div class="circle-percentage">{circlePercentage}</div>
                    <div class="circle-description" style={`--circle-description-gap: ${circleDescriptionGapPx};`}>
                        {#each circleDescriptionLines as line}
                            <span class="circle-description-line">{line}</span>
                        {/each}
                    </div>
                </div>
                <svg
                    class="dotted-circle"
                    viewBox="0 0 471 471"
                    preserveAspectRatio="xMidYMid meet"
                    width="471"
                    height="471"
                    data-circle-measure={circleArcTarget.toFixed(2)}
                    role="presentation"
                    focusable="false"
                >
                    <defs>
                        <linearGradient id="outro-circle-gradient" x1="0%" y1="100%" x2="100%" y2="0%" gradientUnits="objectBoundingBox">
                            <animateTransform
                                attributeName="gradientTransform"
                                type="translate"
                                from="-1 0"
                                to="1 0"
                                dur="6s"
                                repeatCount="indefinite"
                            />
                            <stop offset="0%" stop-color="var(--archetipi-insoddisfatto)" />
                            <stop offset="50%" stop-color="var(--azzurro-500)" />
                            <stop offset="100%" stop-color="var(--arancione-500)" />
                        </linearGradient>
                    </defs>

                    <circle
                        cx="235.5"
                        cy="235.5"
                        r="233.5"
                        fill="none"
                        stroke="var(--content-primary)"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-dasharray="0 16"
                    />

                    <circle
                        cx="235.5"
                        cy="235.5"
                        r="233.5"
                        fill="none"
                        stroke="url(#outro-circle-gradient)"
                        stroke-width="6"
                        stroke-linecap="round"
                        pathLength="100"
                        stroke-dasharray={`${circleReveal.toFixed(2)} ${100 - circleReveal}`}
                        transform="rotate(-90 235.5 235.5)"
                    />
                </svg>
            </div>
        {/if}
    </div>
</section>

<style>
    .outro-scroll-container {
        position: relative;
        height: calc(100vh * 7);
        background-color: var(--background-primary);
    }

    .scene {
        position: sticky;
        top: 0;
        height: 100vh;
        width: 100%;
        display: block;
        overflow: visible;
    }

    .circle-stage {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        width: min(100%, 471px);
        min-height: 471px;
        display: flex;
        align-items: center;
        justify-content: center;
        top: var(--circle-top);
        opacity: var(--circle-opacity);
    }

    .circle-copy {
        position: absolute;
        inset: 0;
        display: block;
        color: var(--content-primary);
        z-index: 1;
        pointer-events: none;
    }

    .circle-percentage {
        position: absolute;
        left: 50%;
        top: 60%;
        transform: translate(-50%, -100%);
        font-family: var(--font-family-base);
        font-size: 7.5rem;
        font-weight: 700;
        line-height: 1;
        letter-spacing: -0.04em;
    }

    .circle-description {
        position: absolute;
    left: 50%;
    top: calc(50% + 4.5rem);
    transform: translateX(-50%);
    font-family: var(--font-family-base);
    font-size: var(--text-s);
    font-weight: 700;
    line-height: 1.2;
    
    /* 1. Cambiamo la larghezza massima portandola al 100% del cerchio (o rimuovila) */
    max-width: 100%; 
    
    margin-top: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--circle-description-gap, 0px);
    text-align: center;
    }

    .circle-description-line {
        display: block;
        white-space: nowrap;
    }

    .dotted-circle {
        display: block;
        width: min(471px, 100%);
        aspect-ratio: 1 / 1;
        height: auto;
        overflow: visible;
        flex: none;
        position: relative;
        z-index: 0;
    }

    .podium-title {
        position: absolute;
        left: 50%;
        top: 0;
        transform: translateX(-50%) translateY(var(--title-top));
        width: max-content;
        white-space: nowrap;
        font-family: var(--font-family-base);
        font-size: var(--text-xl);
        font-weight: 700;
        color: var(--content-primary);
        margin: 0;
        text-align: center;
    }
</style>