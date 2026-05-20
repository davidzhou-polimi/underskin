<script>
  import GlassEffect from '$lib/components/sections/GlassEffect.svelte';
  import { draggableThought } from '$lib/actions/draggableThought.js';

  let container = $state();
  
  // Runa $state per tracciare la lista dei pensieri reattivamente in Svelte 5
  let thoughts = $state([
    { id: 1, text: "\"È IMBATTIBILE\"", cTop: '32%', cLeft: '28%', sTop: '10%', sLeft: '14%', isScattered: false, tailDir: 'left' },
    { id: 2, text: "\"È OVVIO CHE VINCA\"", cTop: '35%', cLeft: '48%', sTop: '12%', sLeft: '58%', isScattered: false, tailDir: 'right' },
    { id: 3, text: "\"NON PUÒ SBAGLIARE\"", cTop: '45%', cLeft: '22%', sTop: '30%', sLeft: '6%', isScattered: false, tailDir: 'left' },
    { id: 4, text: "\"TUTTI LO GUARDANO\"", cTop: '45%', cLeft: '52%', sTop: '28%', sLeft: '75%', isScattered: false, tailDir: 'right' },
    { id: 5, text: "\"È UNA VITTORIA FACILE\"", cTop: '55%', cLeft: '32%', sTop: '82%', sLeft: '32%', isScattered: false, tailDir: 'right' },
    { id: 6, text: "\"È IL MIGLIORE\"", cTop: '58%', cLeft: '55%', sTop: '74%', sLeft: '70%', isScattered: false, tailDir: 'right' },
    { id: 7, text: "\"DEVE VINCERE\"", cTop: '62%', cLeft: '25%', sTop: '68%', sLeft: '10%', isScattered: false, tailDir: 'left' }
  ]);

  // Rune $derived per ricalcolare dinamicamente lo stato della frase sfocata in base ai pensieri attivi
  let activeCount = $derived(thoughts.filter(t => !t.isScattered).length);
  let blurAmount = $derived(activeCount * 1.5); 
  let opacityAmount = $derived(activeCount === 0 ? 1 : 0.4 + ((7 - activeCount) * 0.08));

  /**
   * Marca il pensiero come disperso, modificando lo stato per innescare gli effetti reattivi
   * @param {number} id - L'ID del pensiero da marcare
   */
  function markAsScattered(id) {
    const index = thoughts.findIndex(t => t.id === id);
    if (index !== -1 && !thoughts[index].isScattered) {
      thoughts[index].isScattered = true;
    }
  }
</script>

<section class="favorite-section" bind:this={container}>
  
  <div class="sentence-container" style="filter: blur({blurAmount}px); opacity: {opacityAmount};">
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
        onScatter: markAsScattered 
      }}
      class="thought-box tail-{t.tailDir}" 
      data-id={t.id} 
      style="top: {t.cTop}; left: {t.cLeft};" 
      role="button" 
      tabindex="0"
    >
      <GlassEffect class="thought-background" />
      {t.text}
    </div>
  {/each}
</section>

<style>
  @import '$lib/styles/tokens/typography.css';

  .favorite-section {
    position: relative;
    width: 100%;
    height: 100vh;
    background: linear-gradient(135deg, var(--azzurro-100) 0%, var(--neutral-100) 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }

  .main-sentence {
    font-family: var(--font-family-base);
    font-size: var(--text-body-size);
    font-weight: 400;
    color: var(--neutral-900);
    line-height: 1.5;
    text-align: center;
  }

  .sentence-container {
    /* Rende la transizione tra un livello di sfocatura e l'altro estremamente morbida e progressiva */
    transition: filter 1.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.4s cubic-bezier(0.25, 1, 0.5, 1);
    will-change: filter, opacity;
  }

  .thought-box {
    position: absolute;
    padding: var(--spacing-3) var(--spacing-7); 
    
    font-family: var(--font-family-base);
    font-size: var(--text-caption-size);
    font-weight: 400;
    color: var(--neutral-900);
    
    cursor: grab;
    user-select: none;
    z-index: 10;
    white-space: nowrap;
    
    /* Assicura la disposizione del testo sopra lo sfondo in assoluto */
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Forza il componente GlassEffect a coprire l'intera superficie del fumetto fungendo da riempimento */
  :global(.thought-background) {
    position: absolute !important;
    top: 0;
    left: 0;
    width: 100% !important;
    height: 100% !important;
    z-index: -1;
  }
  
  /* Poligoni con angoli stondati simulati */
  .tail-left {
    padding-left: var(--spacing-8);
    clip-path: polygon(15px 0%, calc(100% - 16px) 0%, calc(100% - 10px) 1.5px, calc(100% - 5px) 5px, calc(100% - 1.5px) 10px, 100% 16px, 100% calc(100% - 16px), calc(100% - 1.5px) calc(100% - 10px), calc(100% - 5px) calc(100% - 5px), calc(100% - 10px) calc(100% - 1.5px), calc(100% - 16px) 100%, 31px 100%, 25px calc(100% - 1.5px), 20px calc(100% - 5px), 16.5px calc(100% - 10px), 15px calc(100% - 16px), 15px 15px, 0% 0%);
  }

  .tail-right {
    padding-right: var(--spacing-8);
    clip-path: polygon(0% 16px, 1.5px 10px, 5px 5px, 10px 1.5px, 16px 0%, calc(100% - 15px) 0%, 100% 0%, calc(100% - 15px) 15px, calc(100% - 15px) calc(100% - 16px), calc(100% - 16.5px) calc(100% - 10px), calc(100% - 20px) calc(100% - 5px), calc(100% - 25px) calc(100% - 1.5px), calc(100% - 31px) 100%, 16px 100%, 10px calc(100% - 1.5px), 5px calc(100% - 5px), 1.5px calc(100% - 10px), 0% calc(100% - 16px));
  }
</style>