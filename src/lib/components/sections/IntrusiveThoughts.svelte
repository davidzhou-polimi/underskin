<script>
  import { onMount, tick } from 'svelte';
  import { gsap } from 'gsap';
  import { Draggable } from 'gsap/dist/Draggable';

  if (typeof window !== 'undefined') {
    gsap.registerPlugin(Draggable);
  }

  let container;
  
  let thoughts = [
    { id: 1, text: "\"È IMBATTIBILE\"", cTop: '32%', cLeft: '28%', sTop: '25%', sLeft: '35%', isScattered: false, tailDir: 'left' },
    { id: 2, text: "\"È OVVIO CHE VINCA\"", cTop: '35%', cLeft: '48%', sTop: '15%', sLeft: '55%', isScattered: false, tailDir: 'right' },
    { id: 3, text: "\"NON PUÒ SBAGLIARE\"", cTop: '45%', cLeft: '22%', sTop: '38%', sLeft: '15%', isScattered: false, tailDir: 'left' },
    { id: 4, text: "\"TUTTI LO GUARDANO\"", cTop: '45%', cLeft: '52%', sTop: '28%', sLeft: '75%', isScattered: false, tailDir: 'right' },
    { id: 5, text: "\"È UNA VITTORIA FACILE\"", cTop: '55%', cLeft: '32%', sTop: '75%', sLeft: '50%', isScattered: false, tailDir: 'right' },
    { id: 6, text: "\"È IL MIGLIORE\"", cTop: '58%', cLeft: '55%', sTop: '72%', sLeft: '72%', isScattered: false, tailDir: 'right' },
    { id: 7, text: "\"DEVE VINCERE\"", cTop: '62%', cLeft: '25%', sTop: '65%', sLeft: '28%', isScattered: false, tailDir: 'left' }
  ];

  $: activeCount = thoughts.filter(t => !t.isScattered).length;
  $: blurAmount = activeCount * 1.5; 
  $: opacityAmount = activeCount === 0 ? 1 : 0.4 + ((7 - activeCount) * 0.08);

  function markAsScattered(id) {
    const index = thoughts.findIndex(t => t.id === id);
    if (!thoughts[index].isScattered) {
      thoughts[index].isScattered = true;
      thoughts = [...thoughts]; 
    }
  }

  onMount(async () => {
    await tick();
    const items = document.querySelectorAll('.thought-box');
    items.forEach((item) => {
      Draggable.create(item, {
        type: "x,y",
        edgeResistance: 0.8,
        bounds: container,
        onDragEnd: function() {
          const id = parseInt(this.target.getAttribute('data-id'));
          markAsScattered(id); // Una volta spostato, rimane dov'è
        }
      });
    });
  });
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
    <div class="thought-box tail-{t.tailDir}" data-id={t.id} style="top: {t.cTop}; left: {t.cLeft};" role="button" tabindex="0">
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
  }

.thought-box {
    position: absolute;
    padding: var(--spacing-3) var(--spacing-7); 
    
    font-family: var(--font-family-base);
    font-size: var(--text-caption-size);
    font-weight: var(--text-card-front-weight);
    color: var(--neutral-900);
    
    cursor: grab;
    user-select: none;
    z-index: 10;
    white-space: nowrap;

    /* 1. Sfondo e Bordo esatti */
    background-color: rgba(241, 250, 253, 0.55);
    border: 1px solid rgba(223, 244, 250, 0.5);
    
    /* 2. RIFRAZIONE E PROFONDITÀ (Dal tuo GlassEffect.svelte) */
    box-shadow: 
      2px 2px 4px rgba(0, 0, 0, 0.23),            /* A. Ombra ESTERNA */
      inset 0 0 10px rgba(255, 255, 255, 0.3),    /* B. Luce spessa (Depth) */
      inset 2px 2px 3px rgba(255, 255, 255, 0.9), /* C. Riflesso Top-Left */
      inset -1px -1px 3px rgba(223, 244, 250, 0.4);/* D. Profondità Bottom-Right */

    /* 3. Frost + Refraction */
    backdrop-filter: blur(13px) saturate(120%);
    -webkit-backdrop-filter: blur(13px) saturate(120%);
    
    /* 4. Gradiente di luce */
    background-image: linear-gradient(
      -45deg, 
      rgba(255, 255, 255, 0.4) 0%, 
      rgba(255, 255, 255, 0) 30%, 
      rgba(255, 255, 255, 0) 70%, 
      rgba(255, 255, 255, 0.1) 100%
    );
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