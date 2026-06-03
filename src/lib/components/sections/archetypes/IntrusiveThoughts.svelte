<script>
  import { draggableThought } from '$lib/actions/archetypes/draggableThought.js';
  import { thoughtsIntro } from '$lib/actions/archetypes/thoughtsIntro.js';

  let container = $state();
  
  let thoughts = $state([
    { id: 1, text: "\"È IMBATTIBILE\"", cTop: '32%', cLeft: '28%', sTop: '10%', sLeft: '14%', isScattered: false, tailDir: 'left' },
    { id: 2, text: "\"È OVVIO CHE VINCA\"", cTop: '35%', cLeft: '48%', sTop: '12%', sLeft: '58%', isScattered: false, tailDir: 'right' },
    { id: 3, text: "\"NON PUÒ SBAGLIARE\"", cTop: '45%', cLeft: '22%', sTop: '30%', sLeft: '6%', isScattered: false, tailDir: 'left' },
    { id: 4, text: "\"TUTTI LO GUARDANO\"", cTop: '45%', cLeft: '52%', sTop: '28%', sLeft: '75%', isScattered: false, tailDir: 'right' },
    { id: 5, text: "\"È UNA VITTORIA FACILE\"", cTop: '55%', cLeft: '32%', sTop: '82%', sLeft: '32%', isScattered: false, tailDir: 'right' },
    { id: 6, text: "\"È IL MIGLIORE\"", cTop: '58%', cLeft: '55%', sTop: '74%', sLeft: '70%', isScattered: false, tailDir: 'right' },
    { id: 7, text: "\"DEVE VINCERE\"", cTop: '62%', cLeft: '25%', sTop: '68%', sLeft: '10%', isScattered: false, tailDir: 'left' }
  ]);

  let isIntroDone = $state(false);
  let hasCompletedOnce = $state(false);
  let activeCount = $derived(thoughts.filter(t => !t.isScattered).length);
  
  // Evita di bloccare nuovamente l'utente se ha già completato l'interazione almeno una volta
  $effect(() => {
    if (isIntroDone && activeCount === 0) {
      hasCompletedOnce = true;
    }
  });

  // Il testo rimane nitido finché l'animazione di copertura non è completata
  let blurAmount = $derived(isIntroDone ? activeCount * 1.5 : 0); 
  let opacityAmount = $derived(isIntroDone ? (activeCount === 0 ? 1 : 0.4 + ((7 - activeCount) * 0.08)) : 1);

  /**
   * Modifica lo stato per innescare gli effetti reattivi di rimozione del pensiero
   * @param {number} id - L'ID del pensiero da rimuovere dal calcolo
   */
  function markAsScattered(id) {
    const index = thoughts.findIndex(t => t.id === id);
    if (index !== -1 && !thoughts[index].isScattered) {
      thoughts[index].isScattered = true;
    }
  }

  /**
   * Imposta lo stato di completamento dell'animazione d'ingresso
   * @param {boolean} val - Il nuovo stato dell'intro
   */
  function handleIntroChange(val) {
    isIntroDone = val;
  }

  // Utilizzato un let semplice anziché $state per evitare l'auto-tracking di Svelte 5 all'interno del blocco $effect
  let hasLocked = false;
  let touchStart = 0;

  /**
   * Blocca gli eventi wheel che spingono lo scroll verso il basso (deltaY > 0)
   * @param {WheelEvent} event
   */
  function preventScrollDown(event) {
    // Consente lo zoom nativo (il pinch-to-zoom su trackpad invia ctrlKey: true)
    if (event.ctrlKey) return;

    if (event.deltaY > 0) {
      event.preventDefault();
    }
  }

  /**
   * Traccia l'inizio del tocco su dispositivi mobile
   * @param {TouchEvent} event
   */
  function handleTouchStart(event) {
    if (event.touches.length > 0) {
      touchStart = event.touches[0].clientY;
    }
  }

  /**
   * Blocca i gesti touch verticali che causano uno scroll verso il basso (swipe verso l'alto)
   * @param {TouchEvent} event
   */
  function handleTouchMove(event) {
    // Consente lo zoom multitouch su dispositivi mobile
    if (event.touches.length > 1) return;

    if (event.touches.length > 0) {
      const touchCurrent = event.touches[0].clientY;
      const diffY = touchStart - touchCurrent;
      if (diffY > 0) {
        event.preventDefault();
      }
    }
  }

  /**
   * Blocca la pressione di tasti di navigazione orientati verso il basso
   * @param {KeyboardEvent} event
   */
  function preventKeysDown(event) {
    const keysToBlock = ['ArrowDown', 'PageDown', ' '];
    if (keysToBlock.includes(event.key)) {
      // Consente lo scroll-up tramite Shift + Barra Spaziatrice
      if (event.key === ' ' && event.shiftKey) {
        return;
      }
      event.preventDefault();
    }
  }

  /**
   * Ripristina tutti i pensieri allo stato iniziale coperto/interattivo per consentire la riesecuzione dello scroll
   */
  function resetThoughts() {
    thoughts.forEach(t => t.isScattered = false);
    isIntroDone = false;
  }

  // Gestione reattiva dello scroll-lock monodirezionale e posizionamento della sezione
  $effect(() => {
    const shouldLock = isIntroDone && activeCount > 0 && !hasCompletedOnce;
    
    if (shouldLock) {
      window.addEventListener('wheel', preventScrollDown, { passive: false });
      window.addEventListener('touchstart', handleTouchStart, { passive: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('keydown', preventKeysDown, { passive: false });
      
      // Allinea la sezione una sola volta all'avvio del blocco
      if (!hasLocked) {
        hasLocked = true;
        container.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.removeEventListener('wheel', preventScrollDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', preventKeysDown);
      hasLocked = false;
    }

    return () => {
      // Rimozione completa dei listener in fase di distruzione del componente
      window.removeEventListener('wheel', preventScrollDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', preventKeysDown);
    };
  });
</script>

<section class="favorite-section" bind:this={container} use:thoughtsIntro={{ thoughts, onIntroChange: handleIntroChange, onReset: resetThoughts }}>
  
  <div class="sentence-container" style:--blur-amount="{blurAmount}px" style:--opacity-amount={opacityAmount}>
    <p class="main-sentence">
        Quando vincere diventa l'unico risultato<br>
        accettabile, l'atleta smette di essere<br>
        una persona e diventa un risultato.
    </p>
  </div>

  {#each thoughts as t (t.id)}
    <div 
      use:draggableThought={{ 
        id: t.id, 
        container, 
        sTop: t.sTop, 
        sLeft: t.sLeft, 
        cTop: t.cTop, 
        cLeft: t.cLeft, 
        isScattered: t.isScattered,
        thoughts,
        onScatter: markAsScattered 
      }}
      class="thought-box" 
      data-id={t.id} 
      style:--c-top={t.cTop}
      style:--c-left={t.cLeft}
      role="button" 
      tabindex="0"
    >
      <div class="shadow-container">
        <div class="shadow-shape tail-{t.tailDir}"></div>
      </div>
      <div class="thought-bubble tail-{t.tailDir}">
        {t.text}
      </div>
    </div>
  {/each}
</section>

<style>
  .favorite-section {
    position: relative;
    width: 100%;
    height: 100vh;
    display: flex;
    background: transparent;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }

  .main-sentence {
    font-family: var(--font-family-base);
    font-size: var(--text-body-size);
    font-weight: var(--text-body-weight);
    color: var(--content-primary);
    line-height: 1.5;
    text-align: center;
  }

  .sentence-container {
    filter: blur(var(--blur-amount));
    opacity: var(--opacity-amount);
    /* Transizione fluida della sfocatura per evitare scatti visivi durante il drag */
    transition: filter 1.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.4s cubic-bezier(0.25, 1, 0.5, 1);
    will-change: filter, opacity;
  }

  .thought-box {
    position: absolute;
    top: var(--c-top);
    left: var(--c-left);
    z-index: 10;
    cursor: grab;
    user-select: none;
    white-space: nowrap;
    
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .thought-bubble {
    position: relative;
    
    font-family: var(--font-family-base);
    font-size: var(--text-caption-size);
    font-weight: var(--text-caption-weight);
    color: var(--content-primary);
    
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    /* Glass Effect integrato direttamente: permette a backdrop-filter di operare 
       sul reale sfondo della pagina poiché nessun antenato ha proprietà 'filter' isolate.
       Valori uniformati con GlassEffect.svelte (var(--neutral-100) al 50% di opacità) */
    background-color: rgb(from var(--neutral-100) r g b / 0.5);
    border: 1px solid rgb(from var(--neutral-50) r g b / 0.3);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  /* Contenitore dell'ombra e del bordo proiettati. Posizionato a -9999px.
     Applica i filtri drop-shadow che proiettano bordo e ombre 9999px verso il basso */
  .shadow-container {
    position: absolute;
    top: -9999px;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    
  }

  
  
  .tail-left {
    padding: var(--spacing-3) var(--spacing-7) var(--spacing-3) var(--spacing-8); 
    clip-path: polygon(15px 0%, calc(100% - 16px) 0%, calc(100% - 10px) 1.5px, calc(100% - 5px) 5px, calc(100% - 1.5px) 10px, 100% 16px, 100% calc(100% - 16px), calc(100% - 1.5px) calc(100% - 10px), calc(100% - 5px) calc(100% - 5px), calc(100% - 10px) calc(100% - 1.5px), calc(100% - 16px) 100%, 31px 100%, 25px calc(100% - 1.5px), 20px calc(100% - 5px), 16.5px calc(100% - 10px), 15px calc(100% - 16px), 15px 15px, 0% 0%);
  }

  .tail-right {
    padding: var(--spacing-3) var(--spacing-8) var(--spacing-3) var(--spacing-7); 
    clip-path: polygon(0% 16px, 1.5px 10px, 5px 5px, 10px 1.5px, 16px 0%, calc(100% - 15px) 0%, 100% 0%, calc(100% - 15px) 15px, calc(100% - 15px) calc(100% - 16px), calc(100% - 16.5px) calc(100% - 10px), calc(100% - 20px) calc(100% - 5px), calc(100% - 25px) calc(100% - 1.5px), calc(100% - 31px) 100%, 16px 100%, 10px calc(100% - 1.5px), 5px calc(100% - 5px), 1.5px calc(100% - 10px), 0% calc(100% - 16px));
  }
</style>