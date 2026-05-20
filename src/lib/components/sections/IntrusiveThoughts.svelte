<script>
  import { onMount, tick } from 'svelte';
  import { gsap } from 'gsap';
  import { Draggable } from 'gsap/dist/Draggable';

  if (typeof window !== 'undefined') {
    gsap.registerPlugin(Draggable);
  }

  let container;
  
  // Coordinate calibrate sul mockup (Screenshot 2026-05-20 alle 07.41.23.jpg)
  let thoughts = [
    { id: 1, text: "\"È IMBATTIBILE\"", cTop: '35%', cLeft: '30%', sTop: '28%', sLeft: '42%', isScattered: false },
    { id: 2, text: "\"È OVVIO CHE VINCA\"", cTop: '42%', cLeft: '48%', sTop: '15%', sLeft: '55%', isScattered: false },
    { id: 3, text: "\"NON PUÒ SBAGLIARE\"", cTop: '48%', cLeft: '20%', sTop: '38%', sLeft: '25%', isScattered: false },
    { id: 4, text: "\"TUTTI LO GUARDANO\"", cTop: '48%', cLeft: '58%', sTop: '28%', sLeft: '75%', isScattered: false },
    { id: 5, text: "\"È UNA VITTORIA FACILE\"", cTop: '56%', cLeft: '38%', sTop: '75%', sLeft: '55%', isScattered: false },
    { id: 6, text: "\"DEVE VINCERE\"", cTop: '65%', cLeft: '28%', sTop: '68%', sLeft: '32%', isScattered: false },
    { id: 7, text: "\"È IL MIGLIORE\"", cTop: '64%', cLeft: '55%', sTop: '65%', sLeft: '78%', isScattered: false }
  ];

  // Sfocatura e opacità
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

  function moveThought(id, element) {
    const index = thoughts.findIndex(t => t.id === id);
    
    if (thoughts[index].isScattered) return;

    markAsScattered(id);

    gsap.to(element, {
      top: thoughts[index].sTop,
      left: thoughts[index].sLeft,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: () => {
          Draggable.get(element)?.update();
      }
    });
  }

  onMount(async () => {
    await tick();

    const items = document.querySelectorAll('.thought-box');
    items.forEach((item) => {
      Draggable.create(item, {
        type: "x,y",
        edgeResistance: 0.8,
        bounds: container, 
        
        onDragStart: function() {
          const id = parseInt(this.target.getAttribute('data-id'));
          markAsScattered(id);
        },
        
        onClick: function() {
          const id = parseInt(this.target.getAttribute('data-id'));
          moveThought(id, this.target);
        }
      });
    });
  });
</script>

<section class="favorite-section" bind:this={container}>
  
  <div 
    class="sentence-container" 
    style="filter: blur({blurAmount}px); opacity: {opacityAmount};"
  >
    <p class="main-sentence">
        Quando vincere diventa l'unico risultato<br>
        accettabile, l'atleta smette di essere<br>
        una persona e diventa un risultato.
    </p>
  </div>

  {#each thoughts as t (t.id)}
    <div 
      class="thought-box" 
      data-id={t.id}
      style="top: {t.cTop}; left: {t.cLeft};"
      role="button"
      tabindex="0"
    >
      {t.text}
    </div>
  {/each}

</section>

<style>
  .favorite-section {
    position: relative;
    width: 100%;
    height: 100vh;
    background: linear-gradient(135deg, #e8f0f6 0%, #c4dbe8 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    cursor: default;
  }

  .sentence-container {
    text-align: center;
    transition: filter 0.6s ease, opacity 0.6s ease;
    max-width: 85%;
    z-index: 1;
    pointer-events: none; 
  }

  .main-sentence {
    font-family: 'Urbanist', system-ui, -apple-system, sans-serif; 
    font-size: 2.2rem;
    font-weight: 400; 
    color: #1a2b3c;
    line-height: 1.5;
    margin: 0;
  }

  /* Stile base dei pensieri pronti per il tuo effetto ghiaccio */
  .thought-box {
    position: absolute;
    background: white; 
    padding: 12px 28px; 
    border-radius: 4px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08); 
    font-family: 'Lato', system-ui, sans-serif; 
    font-weight: 400; 
    color: #0c2137;
    font-size: 0.95rem;
    cursor: grab;
    user-select: none;
    z-index: 10;
    white-space: nowrap;
    will-change: transform, top, left;
  }

  /* La codina della nuvoletta sulla sinistra, come nel mockup */
  .thought-box::after {
    content: '';
    position: absolute;
    bottom: -10px; 
    left: 20px; 
    border-width: 15px 15px 0 0; 
    border-style: solid;
    border-color: white transparent transparent transparent; 
    z-index: -1;
  }

  .thought-box:active {
    cursor: grabbing;
    transform: scale(1.02);
  }
</style>