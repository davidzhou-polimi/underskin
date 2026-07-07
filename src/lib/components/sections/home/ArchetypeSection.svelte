<script>
    import ArchetypeCard from "$lib/components/ui/ArchetypeCard.svelte";
    import { staggerReveal } from "$lib/actions/staggerReveal.js";
    import { sectionPin } from "$lib/actions/sectionPin.js";
    import { horizontalCarousel } from "$lib/actions/horizontalCarousel.js";

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

    // ─── Navigazione ───────────────────────────────────────────────────────────

    function next() {
        activeIndex = (activeIndex + 1) % activeItems.length;
    }

    function prev() {
        activeIndex = (activeIndex - 1 + activeItems.length) % activeItems.length;
    }

    /** @param {number} index */
    function selectIndex(index) {
        activeIndex = index;
        autoplayActive = false; // Disattiva autoplay su interazione
    }

    function handleVideoEnded() {
        if (autoplayActive) {
            next();
        }
    }

    // ─── Touch Events per Swipe ───────────────────────────────────────────────

    let touchStartX = 0;
    let touchStartY = 0;

    /** @param {TouchEvent} e */
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }

    /** @param {TouchEvent} e */
    function handleTouchEnd(e) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        // Rileva swipe orizzontale significativo
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            autoplayActive = false; // Disattiva autoplay su interazione
            dx > 0 ? prev() : next();
        }
    }

    // ─── Touch Drag sulla barra dei Dot ────────────────────────────────────────

    /** @param {TouchEvent} e */
    function handleDotsTouch(e) {
        if (!dotsPillElement) return;
        autoplayActive = false; // Disattiva autoplay su interazione

        // Previene lo scorrimento di pagina nativo durante il drag dei dot
        if (e.cancelable) {
            e.preventDefault();
        }

        const rect = dotsPillElement.getBoundingClientRect();
        const touchX = e.touches[0].clientX;

        // Calcola la coordinata X relativa all'interno della barra (0-1)
        const relativeX = Math.max(0, Math.min(1, (touchX - rect.left) / rect.width));

        // Determina l'indice più vicino ed esegui lo slide
        const count = activeItems.length;
        const targetIndex = Math.min(count - 1, Math.floor(relativeX * count));
        if (targetIndex !== activeIndex) {
            activeIndex = targetIndex;
        }
    }
</script>

<section
    id="archetypes"
    class="archetype-section"
    use:sectionPin
>
    {#if title}
        <h3 class="section-title">{title}</h3>
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
                use:horizontalCarousel={{ activeIndex }}
                ontouchstart={handleTouchStart}
                ontouchend={handleTouchEnd}
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
                    ></button>
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
        transition: transform var(--transition-duration-normal) var(--easing-standard),
                    background-color var(--transition-duration-normal) var(--easing-standard);
    }

    .dot-button.active {
        transform: scale(1.6);
        background-color: var(--neutral-800);
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
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .archetype-section {
            /* Commento solo il PERCHÉ: azzera il margine superiore negativo su mobile 
               per evitare conflitti spaziali con la sezione precedente */
            margin-top: 0;
            padding-top: var(--spacing-6);
            padding-bottom: var(--spacing-6);
        }
    }
</style>
