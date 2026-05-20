<script>
    import { onMount, onDestroy } from 'svelte';

    let blobX = -320; // Inizializzata a sinistra (-320px) per far partire l'oscillazione dall'estremo sinistro
    let blobY = 0;
    let blobScale = 0.55; // Scala minima (55%) corrispondente alla posizione iniziale all'estremo sinistro
    let isPlaying = false; // Modificato a false per far partire l'oscillazione solo una volta visibile a schermo
    let attempts = 0;
    const MAX_ATTEMPTS = 3; 

    /** @type {number | null} */
    let accuracy = null;
    
    /** @type {number} */
    let animationFrame;
    
    /** @type {number | null} */
    let startTime = null;
    
    /**
     * @param {number} time
     */
    function animate(time) {
        if (!isPlaying) return;
        if (!startTime) startTime = time;
        const elapsed = time - startTime;

        const speed = 0.0007; 
        const radiusX = 320; // Raggio aumentato a 320px per consentire un'oscillazione molto più ampia

        // Usiamo -Math.cos per far iniziare l'oscillazione orizzontale dall'estremo sinistro (-320px) anziché dal centro
        blobX = -Math.cos(elapsed * speed) * radiusX;
        // La pallina deve oscillare unicamente sull'asse X per rimanere vincolata in orizzontale
        blobY = 0; 

        // Calcola la scala dinamica: 1.0 (100% dimensione) al centro, fino a 0.55 (55% dimensione) agli estremi dell'oscillazione
        blobScale = 1.0 - (Math.abs(blobX) / radiusX) * 0.45;

        animationFrame = requestAnimationFrame(animate);
    }

    let hasStarted = false; // Impedisce il riavvio o il reset se la sezione viene visualizzata più volte nello scorrimento
    /** @type {IntersectionObserver | null} */
    let observer = null;

    onMount(() => {
        // Rileva l'intersezione con il viewport in modo che la pallina parta dall'estremo sinistro solo quando effettivamente visibile
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasStarted) {
                    hasStarted = true;
                    startTime = null; // Forza l'inizio esatto dall'estremo sinistro riducendo a 0 la differenza di tempo sul primo frame
                    isPlaying = true;
                    animationFrame = requestAnimationFrame(animate);
                }
            });
        }, { threshold: 0.1 });

        const section = document.querySelector('.perfection-container');
        if (section) observer.observe(section);
    });

    onDestroy(() => {
        if (observer) observer.disconnect(); // Rilascio delle risorse dell'observer per evitare accumulo in memoria
        if (animationFrame) cancelAnimationFrame(animationFrame); // Interruzione del loop di disegno per prevenire memory leak
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
            // Calcolo percentuale normalizzato sul raggio massimo di 320px
            let calcPerc = 100 - (distance / 320) * 100;

            // Il gioco è volutamente infido ed esasperante: il 100% è inarrivabile, il limite è 99%
            accuracy = Math.max(1, Math.min(99, Math.round(calcPerc)));
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
            class="blob-wrapper"
            style="transform: translate({blobX}px, {blobY}px) scale({blobScale});"
        >
            <div 
                class="purple-blob" 
                class:stopped={!isPlaying}
                class:game-over={attempts >= MAX_ATTEMPTS}
            ></div>
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
        width: 320px; /* Ingrandito a 320px di diametro */
        height: 320px;
        border: 2px dashed #0c2137;
        border-radius: 50%;
        opacity: 0.5;
        z-index: 1;
    }

    .blob-wrapper {
        position: absolute;
        width: 290px; /* Ingrandito a 290px per essere quasi grande quanto il cerchio di target (320px) con un piccolo margine di 15px */
        height: 290px;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2;
        will-change: transform;
    }

    .purple-blob {
        position: absolute;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, #8a2be2 0%, #4b0082 100%);
        border-radius: 50%;
        filter: blur(24px); /* Sfocatura uniforme e profonda mantenuta identica sia in movimento che da ferma per preservare il glow sfumato */
        opacity: 0.9;
        z-index: 1; /* Il blob sfocato rimane sul fondo */
    }

    /* Se il gioco è finito, la pallina rimane spenta/fissa */
    .purple-blob.game-over {
        opacity: 0.7;
    }

    .percentage {
        position: relative;
        z-index: 2; /* Sovrapposto allo sfondo sfocato ma mantenuto al 100% nitido ed esente da filtri */
        font-family: system-ui, sans-serif;
        font-size: 3.8rem;
        font-weight: 800;
        color: var(--background-primary);
        /* Ombra rimossa per un aspetto grafico pulito ed elegante */
        animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }

    @keyframes popIn {
        0% { transform: scale(0.5); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }
</style>