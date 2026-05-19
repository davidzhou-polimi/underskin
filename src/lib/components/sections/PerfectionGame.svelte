<script>
    import { onMount, onDestroy } from 'svelte';

    let isPlaying = true;
    let attempts = 0;
    const MAX_ATTEMPTS = 3; 

    /** @type {number | null} */
    let accuracy = null;
    
    /** @type {number} */
    let animationFrame;
    
    /** @type {number | null} */
    let startTime = null;
    
    let blobX = 0;
    let blobY = 0;

    /**
     * @param {number} time
     */
    function animate(time) {
        if (!isPlaying) return;
        if (!startTime) startTime = time;
        const elapsed = time - startTime;

        const speed = 0.0007; 
        const radiusX = 180;
        const radiusY = 120;

        blobX = Math.sin(elapsed * speed) * radiusX;
        blobY = Math.sin(elapsed * speed * 1.3) * radiusY; 

        animationFrame = requestAnimationFrame(animate);
    }

    onMount(() => {
        animationFrame = requestAnimationFrame(animate);
    });

    onDestroy(() => {
        if (animationFrame) cancelAnimationFrame(animationFrame);
    });

    function toggleGame() {
        // Se abbiamo esaurito i tentativi, blocchiamo tutto
        if (attempts >= MAX_ATTEMPTS) return;

        if (isPlaying) {
            // Ferma il gioco
            isPlaying = false;
            if (animationFrame) cancelAnimationFrame(animationFrame);
            attempts++;

            const distance = Math.sqrt(blobX * blobX + blobY * blobY);
            let calcPerc = 100 - (distance / 216) * 100;

            if (distance <= 15) {
                accuracy = 100;
                blobX = 0;
                blobY = 0; 
            } else {
                accuracy = Math.max(1, Math.min(99, Math.round(calcPerc)));
            }
        } else {
            // Riavvia il gioco (solo se non abbiamo raggiunto il limite)
            accuracy = null;
            isPlaying = true;
            startTime = null; 
            animationFrame = requestAnimationFrame(animate);
        }
    }

    /**
     * @param {KeyboardEvent} event
     */
    function handleKeydown(event) {
        if (event.code === 'Space') {
            event.preventDefault(); 
            toggleGame();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<section class="perfection-container">
    
    <div class="header-text">
        <h2 class="title">Quanto è difficile la perfezione?</h2>
    </div>

    <div class="game-area" on:click={toggleGame} role="presentation">
        <div class="target-circle"></div>

        <div 
            class="purple-blob" 
            class:stopped={!isPlaying}
            class:game-over={attempts >= MAX_ATTEMPTS}
            style="transform: translate({blobX}px, {blobY}px);"
        >
            {#if accuracy !== null}
                <span class="percentage">{accuracy}%</span>
            {/if}
        </div>
    </div>

</section>

<style>
    .perfection-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 800px;
        background-color: #f4f8fb;
        user-select: none;
    }

    .header-text {
        text-align: center;
        margin-bottom: 2rem;
    }

    .title {
        font-family: system-ui, sans-serif;
        font-size: 2.5rem;
        font-weight: 600;
        color: #0c2137;
        margin: 0;
    }

    .game-area {
        position: relative;
        width: 400px;
        height: 400px;
        display: flex;
        justify-content: center;
        align-items: center;
        /* Cambia cursore solo se non abbiamo finito i tentativi */
        cursor: crosshair; 
    }

    .game-area:has(.game-over) {
        cursor: default;
    }

    .target-circle {
        position: absolute;
        width: 200px;
        height: 200px;
        border: 2px dashed #0c2137;
        border-radius: 50%;
        opacity: 0.5;
        z-index: 1;
    }

    .purple-blob {
        position: absolute;
        width: 180px;
        height: 180px;
        background: radial-gradient(circle, #8a2be2 0%, #4b0082 100%);
        border-radius: 50%;
        filter: blur(14px);
        opacity: 0.9;
        z-index: 2;
        will-change: transform;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: filter 0.4s ease;
    }

    .purple-blob.stopped {
        filter: blur(4px);
    }

    /* Se il gioco è finito, la pallina rimane spenta/fissa */
    .purple-blob.game-over {
        opacity: 0.7;
    }

    .percentage {
        font-family: system-ui, sans-serif;
        font-size: 3.5rem;
        font-weight: 800;
        color: #ffffff;
        text-shadow: 0px 2px 10px rgba(0,0,0,0.4);
        animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }

    @keyframes popIn {
        0% { transform: scale(0.5); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }
</style>