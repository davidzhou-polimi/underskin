<script>
    import ArchetypeCard from "$lib/components/ui/ArchetypeCard.svelte";
    import { staggerReveal } from "$lib/actions/staggerReveal.js";
    import { archetypeScrolly } from "$lib/actions/home/archetypeScrolly.js";
    import { horizontalCarousel } from "$lib/actions/horizontalCarousel.js";
    import { dragSwipe } from "$lib/actions/dragSwipe.js";

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

    // Stato del carosello mobile
    let activeIndex = $state(0);
    let autoplayActive = $state(true);
    /** @type {HTMLDivElement | null} */
    let dotsPillElement = $state(null);
    let progressRatio = $state(0);
    let dragOffset = $state(0);

    // ─── Navigazione ───────────────────────────────────────────────────────────

    function next() {
        activeIndex = (activeIndex + 1) % activeItems.length;
        progressRatio = 0;
    }

    function prev() {
        activeIndex = (activeIndex - 1 + activeItems.length) % activeItems.length;
        progressRatio = 0;
    }

    /** @param {number} index */
    function selectIndex(index) {
        activeIndex = index;
        autoplayActive = false; // Disattiva autoplay su interazione
        progressRatio = 0;
    }

    function handleVideoEnded() {
        if (autoplayActive) {
            next();
        }
    }

    /**
     * @param {number} currentTime
     * @param {number} duration
     */
    function handleVideoTimeUpdate(currentTime, duration) {
        progressRatio = currentTime / duration;
    }

    // ─── Touch Events per Swipe e Drag ────────────────────────────────────────
    // La logica di gesto (axis-lock, throttling, soglia) vive nell'azione condivisa dragSwipe.

    /** @param {1 | -1} direction */
    function handleSwipeCommit(direction) {
        direction === 1 ? next() : prev();
    }

    function handleSwipeStart() {
        autoplayActive = false; // Disattiva autoplay su interazione
    }

    // ─── Touch Drag sulla barra dei Dot ────────────────────────────────────────

    let dotsRafId = 0;
    let latestTouchX = 0;

    /** @param {TouchEvent} e */
    function handleDotsTouch(e) {
        if (!dotsPillElement) return;
        autoplayActive = false; // Disattiva autoplay su interazione

        // Previene lo scorrimento di pagina nativo durante il drag dei dot
        if (e.cancelable) {
            e.preventDefault();
        }

        // ⚡ Bolt Optimization: Throttle getBoundingClientRect using requestAnimationFrame
        // to avoid layout thrashing during the high-frequency touchmove event.
        // We capture the most recent touch coordinate outside the rAF.
        latestTouchX = e.touches[0].clientX;

        if (dotsRafId) return;

        dotsRafId = requestAnimationFrame(() => {
            dotsRafId = 0;
            if (!dotsPillElement) return;
            const rect = dotsPillElement.getBoundingClientRect();

            // Calcola la coordinata X relativa all'interno della barra (0-1)
            const relativeX = Math.max(0, Math.min(1, (latestTouchX - rect.left) / rect.width));

            // Determina l'indice più vicino ed esegui lo slide
            const count = activeItems.length;
            const targetIndex = Math.min(count - 1, Math.floor(relativeX * count));
            if (targetIndex !== activeIndex) {
                activeIndex = targetIndex;
            }
        });
    }
</script>

<section
    id="archetypes"
    class="archetype-section"
    use:archetypeScrolly
>
    <!-- Mobile-only quote: animata da archetypeScrolly -->
    <blockquote class="perf-quote mobile-only">
        La performance non consuma <br />
        solo il corpo: ma modella <br />
        <span class="gradient-text animate-gradient-text my-archetypes-color">identità, abitudini, ossessioni.</span>
    </blockquote>
    {#if title}
        <h3 class="section-title desktop-only">{title}</h3>
    {/if}

    <!-- Layout Desktop: Riga statica con stagger -->
    <div class="cards-row desktop-only" use:staggerReveal>
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

    <!-- Layout Mobile: Carosello orizzontale con swipe e indicatori -->
    <div class="archetypes-carousel-container mobile-only">
        <div class="carousel-viewport">
            <div
                class="carousel-track"
                use:horizontalCarousel={{ activeIndex, gap: 24, dragOffset }}
                use:dragSwipe={{ onDrag: (offset) => (dragOffset = offset), onCommit: handleSwipeCommit, onStart: handleSwipeStart }}
                role="group"
                aria-label="Archetypes Carousel Track"
            >
                {#each activeItems as member, i (member.name)}
                    <div class="carousel-item">
                        <ArchetypeCard
                            name={member.name}
                            videoSrc={member.videoSrc ?? ""}
                            imageSrc={member.imageSrc ?? ""}
                            type={member.type}
                            clickable={clickable}
                            isPlaying={i === activeIndex}
                            loop={!autoplayActive}
                            onVideoEnded={i === activeIndex ? handleVideoEnded : undefined}
                            onTimeUpdate={i === activeIndex ? handleVideoTimeUpdate : undefined}
                            showTooltip={false}
                        />
                        <!-- Clic sulle card parziali laterali per centrarle -->
                        {#if i !== activeIndex}
                            <button
                                class="card-overlay"
                                onclick={() => selectIndex(i)}
                                aria-label="Visualizza {member.name}"
                            ></button>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>

        <!-- Dot Navigation Pill -->
        <div class="dots-navigation-container">
            <div
                bind:this={dotsPillElement}
                class="glass-effect dots-pill"
                role="toolbar"
                tabindex="-1"
                aria-label="Controlli scorrimento carosello"
                ontouchstart={handleDotsTouch}
                ontouchmove={handleDotsTouch}
            >
                {#each activeItems as _, i}
                    <button
                        class="dot-button"
                        class:active={i === activeIndex}
                        onclick={() => selectIndex(i)}
                        aria-label="Vai alla card {i + 1}"
                    >
                        {#if i === activeIndex}
                            <span
                                class="dot-progress"
                                class:no-transition={progressRatio === 0}
                                style="width: {progressRatio * 100}%"
                            ></span>
                        {/if}
                    </button>
                {/each}
            </div>
        </div>
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

    .perf-quote {
        font-family: 'Rethink Sans', sans-serif;
        font-weight: var(--text-important-weight);
        font-size: var(--text-l);
        line-height: 1.5;
        color: var(--content-primary);
        text-align: center;
        margin: 0;
        padding: 0;
        border: none;
    }

    .my-archetypes-color {
        --gradient-c1: var(--archetipi-favorito);
        --gradient-c2: var(--archetipi-insoddisfatto);
        --gradient-c3: var(--archetipi-infortunato);
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


    /* ─── CAROUSEL MOBILE STYLES ────────────────────────────────────────── */
    .archetypes-carousel-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        overflow: visible;
        padding: 0;
    }

    .carousel-viewport {
        width: 100%;
        height: 385px;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        position: relative;
        /* Commento solo il PERCHÉ: applica una sfumatura graduale ai lati per far dissolvere morbidamente le card in entrata e uscita */
        -webkit-mask-image: linear-gradient(
            to right,
            transparent,
            black var(--spacing-4),
            black calc(100% - var(--spacing-4)),
            transparent
        );
        mask-image: linear-gradient(
            to right,
            transparent,
            black var(--spacing-4),
            black calc(100% - var(--spacing-4)),
            transparent
        );
    }

    .carousel-track {
        width: 100%;
        height: 100%;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: visible;
    }

    .carousel-item {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 290px;
        height: 380px;
        will-change: transform, opacity;
    }

    .card-overlay {
        position: absolute;
        inset: 0;
        z-index: 20;
        cursor: pointer;
        background: transparent;
        border: none;
        padding: 0;
        margin: 0;
    }

    /* DOTS NAVIGATION STYLES */
    .dots-navigation-container {
        margin-top: var(--spacing-6);
        z-index: 10;
        display: flex;
        justify-content: center;
        width: 100%;
    }

    .dots-pill {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-2);
        padding: var(--spacing-2) var(--spacing-4);
        border-radius: 9999px;
        touch-action: none; /* Commento solo il PERCHÉ: disabilita le gesture di scroll native del browser sulla barra dei dot per garantire fluidità al drag orizzontale */
    }

    .dot-button {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: var(--neutral-400);
        border: none;
        padding: 0;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: transform var(--transition-duration-normal) var(--easing-standard),
                    background-color var(--transition-duration-normal) var(--easing-standard),
                    width var(--transition-duration-normal) var(--easing-standard),
                    border-radius var(--transition-duration-normal) var(--easing-standard);
    }

    .dot-button.active {
        width: var(--spacing-3); /* Commento solo il PERCHÉ: allunga la pillola attiva a forma di riga per visualizzare il progresso temporale del video */
        border-radius: 9999px;
        background-color: color-mix(
            in srgb,
            var(--neutral-800) 20%,
            transparent
        );
        transform: scale(1.0); /* Rimuove lo scale del dot attivo poiché la larghezza è ora gestita esplicitamente in pixel */
    }

    .dot-progress {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 0%;
        border-radius: 9999px;
        background-color: var(--neutral-800);
        pointer-events: none;
        /* Commento solo il PERCHÉ: applica una transizione lineare fluida sulla larghezza 
           per ammorbidire gli scatti intermedi derivanti dagli eventi timeupdate del video nativo */
        transition: width 0.15s linear;
    }

    .dot-progress.no-transition {
        /* Commento solo il PERCHÉ: disattiva temporaneamente la transizione quando il progresso si azzera 
           per evitare l'animazione di scivolamento all'indietro della barra */
        transition: none !important;
    }

    .desktop-only {
        display: flex;
    }

    .mobile-only {
        display: none;
    }

    @media (max-width: 768px) {
        .desktop-only {
            display: none;
        }

        .mobile-only {
            display: block;
        }

        .perf-quote.mobile-only {
            position: absolute;
            top: 50%;
            left: 0;
            width: 100%;
            margin-top: -60px; /* Commento solo il PERCHÉ: centra verticalmente il testo di circa 120px di altezza senza generare conflitti con transform di GSAP */
            z-index: 5;
            display: block;
        }

        .archetypes-carousel-container.mobile-only {
            position: absolute;
            top: 50%;
            left: 0;
            width: 100%;
            margin-top: -192px; /* Commento solo il PERCHÉ: centra verticalmente il carosello mobile di circa 385px di altezza senza generare conflitti con transform di GSAP */
            z-index: 2;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .archetype-section {
            /* Commento solo il PERCHÉ: azzera margini e padding ed imposta altezza a 100vh 
               per bloccare la sezione nel viewport durante lo scrollytelling unificato mobile */
            margin-top: 0;
            padding: 0;
            height: 100vh;
            min-height: 100vh;
            position: relative;
            box-sizing: border-box;
            overflow: hidden;
        }
    }
</style>
