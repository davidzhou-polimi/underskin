<script>
  import { draggableThought } from '$lib/actions/archetypes/draggableThought.js';
  import { thoughtsIntro } from '$lib/actions/archetypes/thoughtsIntro.js';
  import { thoughtsStackReveal } from '$lib/actions/archetypes/thoughtsStackReveal.js';
  import ScrollHint from '$lib/components/ui/ScrollHint.svelte';
  import { scrollHintAfterUnlock } from '$lib/utils/scrollHintAfterUnlock.js';
  import { fade } from 'svelte/transition';
  import { media } from '$lib/stores/mediaQuery.svelte.js';

  let container = $state();

  // `rot` è usato solo dalla variante mobile (obliquità del fumetto nella pila); ignorato dal desktop.
  let thoughts = $state([
    { id: 1, text: "\"È IMBATTIBILE\"", cTop: '32%', cLeft: '28%', sTop: '10%', sLeft: '14%', isScattered: false, tailDir: 'left', rot: -4 },
    { id: 2, text: "\"È OVVIO CHE VINCA\"", cTop: '35%', cLeft: '48%', sTop: '12%', sLeft: '58%', isScattered: false, tailDir: 'right', rot: 3 },
    { id: 3, text: "\"NON PUÒ SBAGLIARE\"", cTop: '45%', cLeft: '22%', sTop: '30%', sLeft: '6%', isScattered: false, tailDir: 'left', rot: -3 },
    { id: 4, text: "\"TUTTI LO GUARDANO\"", cTop: '45%', cLeft: '52%', sTop: '28%', sLeft: '68%', isScattered: false, tailDir: 'right', rot: 5 },
    { id: 5, text: "\"È UNA VITTORIA FACILE\"", cTop: '55%', cLeft: '32%', sTop: '72%', sLeft: '35%', isScattered: false, tailDir: 'right', rot: -2 },
    { id: 6, text: "\"È IL MIGLIORE\"", cTop: '58%', cLeft: '55%', sTop: '74%', sLeft: '70%', isScattered: false, tailDir: 'right', rot: 4 },
    { id: 7, text: "\"DEVE VINCERE\"", cTop: '62%', cLeft: '25%', sTop: '68%', sLeft: '10%', isScattered: false, tailDir: 'left', rot: -3 }
  ]);

  let isIntroDone = $state(false);
  let hasCompletedOnce = $state(false);
  let activeCount = $derived(thoughts.filter(t => !t.isScattered).length);
  let showScrollHint = $state(false);

  // Evita di bloccare nuovamente l'utente se ha già completato l'interazione almeno una volta
  $effect(() => {
    if (isIntroDone && activeCount === 0) {
      hasCompletedOnce = true;
    }
  });

  // Commento solo il PERCHÉ: svela l'indicatore con un delay dallo sblocco, ma lo nasconde
  // non appena l'utente inizia a scrollare; comportamento condiviso in scrollHintAfterUnlock.
  $effect(() => {
    if (hasCompletedOnce) {
      return scrollHintAfterUnlock((v) => (showScrollHint = v));
    }
    showScrollHint = false;
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

  /**
   * Ripristina tutti i pensieri allo stato iniziale coperto/interattivo per consentire la riesecuzione dello scroll
   */
  function resetThoughts() {
    if (hasCompletedOnce) return;
    thoughts.forEach(t => t.isScattered = false);
    isIntroDone = false;
  }

  // Commento solo il PERCHÉ: il blocco scroll (giù bloccato finché i pensieri non sono dispersi, su libero) è
  // ora interamente gestito dall'action thoughtsIntro tramite lo store Lenis (lock direzionale in fase capture).
</script>

{#if media.isMobile}
  <!-- Commento solo il PERCHÉ: su mobile l'interazione drag-to-scatter non è adatta; il gioco
       diventa un reveal guidato dallo scroll (fumetti impilati e obliqui, poi la frase di chiusura),
       senza lock direzionale. Markup e action dedicati, disgiunti dal percorso desktop. -->
  <section class="favorite-section favorite-section-mobile" use:thoughtsStackReveal>
    <!-- Commento solo il PERCHÉ: la sezione è pinnata e questo wrapper viene traslato verso l'alto
         dall'action (finto scroll): la colonna resta ancorata nel viewport e si allunga mentre i
         fumetti si accendono, spingendo sopra i precedenti. -->
    <div class="thoughts-scroller">
      <div class="thoughts-stack">
        {#each thoughts as t (t.id)}
          <div class="mobile-thought" data-id={t.id} data-rot={t.rot}>
            <div class="shadow-container">
              <div class="shadow-shape tail-{t.tailDir}"></div>
            </div>
            <div class="glass-effect thought-bubble tail-{t.tailDir}">
              {t.text}
            </div>
          </div>
        {/each}
      </div>

      <div class="closing-sentence">
        <h3 class="main-sentence">
          Quando vincere diventa l'unico traguardo accettabile,
          l'atleta smette di essere una persona e diventa solo un numero.
        </h3>
      </div>
    </div>
  </section>
{:else}
  <section class="favorite-section" bind:this={container} use:thoughtsIntro={{ thoughts, onIntroChange: handleIntroChange, onReset: resetThoughts, hasCompletedOnce }}>

    <div class="sentence-container" style:--blur-amount="{blurAmount}px" style:--opacity-amount={opacityAmount}>
      <h3 class="main-sentence">
          Quando vincere diventa l'unico traguardo<br>
          accettabile, l'atleta smette di essere<br>
          una persona e diventa solo un numero.
      </h3>
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
        <div class="glass-effect thought-bubble tail-{t.tailDir}">
          {t.text}
        </div>
      </div>
    {/each}

    {#if showScrollHint}
      <!-- Commento solo il PERCHÉ: l'indicatore compare solo a gioco completato per segnalare lo sblocco dello scroll -->
      <div class="scroll-hint-container" transition:fade={{ duration: 400 }}>
        <ScrollHint showText={false} />
      </div>
    {/if}
  </section>
{/if}

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

    /* Glass Effect integrato direttamente tramite la classe globale .glass-effect:
       permette a backdrop-filter di operare sul reale sfondo della pagina poiché nessun
       antenato ha proprietà 'filter' isolate. */
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

  .scroll-hint-container {
    position: absolute;
    bottom: var(--spacing-8);
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
  }

  /* ============================================================
     Variante MOBILE: conveyor a scroll. La sezione è pinnata (altezza viewport, overflow nascosto)
     e il wrapper .thoughts-scroller viene traslato verso l'alto dall'action (finto scroll): la
     colonna resta ancorata e si allunga mentre i fumetti si accendono. La rotazione è da GSAP.
     ============================================================ */
  @media (max-width: 768px) {
    .favorite-section-mobile {
      height: 100vh;
      flex-direction: column;
      justify-content: flex-start;
      overflow: hidden;
    }

    .thoughts-scroller {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      /* Distanza netta tra l'ultimo fumetto e la frase: quest'ultima entra come rivelazione */
      gap: var(--spacing-11);
      /* will-change perché l'action anima y in continuo durante lo scrub */
      will-change: transform;
    }

    .thoughts-stack {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }

    .mobile-thought {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      max-width: 80vw;
      z-index: 10;
    }

    /* Spaziatura verticale volutamente irregolare (ravvicinata), ottenuta variando i token di spacing */
    .mobile-thought + .mobile-thought { margin-top: var(--spacing-4); }
    .mobile-thought:nth-child(2n) { margin-top: var(--spacing-5); }
    .mobile-thought:nth-child(3n) { margin-top: var(--spacing-3); }

    .mobile-thought .thought-bubble {
      width: auto;
      height: auto;
      max-width: 80vw;
      white-space: normal;
      text-align: center;
      /* Padding orizzontale simmetrico (le classi .tail-* usano padding asimmetrico per la coda,
         che sfalserebbe il testo centrato): su mobile la coda resta decorativa in basso. */
      padding-inline: var(--spacing-6);
    }

    .closing-sentence {
      max-width: 80vw;
      text-align: center;
    }

    .main-sentence {
      /* Dimensione mobile allineata alle altre frasi archetipo (variante incoming): text-m per
         leggibilità ed equilibrio con i fumetti, con respiro orizzontale. */
      font-size: var(--text-m);
      padding: 0 var(--spacing-4);
    }
  }
</style>