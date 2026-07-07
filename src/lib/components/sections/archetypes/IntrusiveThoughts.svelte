<script>
  import { draggableThought } from '$lib/actions/archetypes/draggableThought.js';
  import { thoughtsIntro } from '$lib/actions/archetypes/thoughtsIntro.js';
  import ScrollHint from '$lib/components/ui/ScrollHint.svelte';
  import { scrollHintAfterUnlock } from '$lib/utils/scrollHintAfterUnlock.js';
  import { media } from '$lib/stores/mediaQuery.svelte.js';
  import { fade } from 'svelte/transition';

  let container = $state();
  
  // Commento solo il PERCHÉ: ogni pensiero ha posizioni distinte per desktop (cTop/cLeft/sTop/sLeft)
  // e per mobile portrait (mTop/mLeft/msTop/msLeft), dove ms = mobile-scattered.
  // showOnMobile: false esclude i 2 fumetti meno incisivi su viewport piccole per non affollare.
  //
  // Layout mobile convergenza: zig-zag — ogni riga ha UN SOLO bubble, alternando sinistra/destra.
  // Motivo: var(--text-xs) = 20px → bubble largo ~244px su 390px viewport.
  //   Due bubble sulla stessa riga si sovrapporrebbero inevitabilmente.
  //   Con lo zig-zag ogni bubble occupa l'intera larghezza della sua riga senza clipping.
  //   col-sx  mLeft:'5%'  → left-edge 19.5px; bubble 244px → right-edge 263px (safe)
  //   col-dx  mLeft:'36%' → left-edge 140px;  bubble 244px → right-edge 384px (6px safe margin)
  //   Row spacing ~10% = ~85px su 844px viewport.
  //
  // Scatter finale: id:1 e id:2 in alto (7%), id:3, id:4, id:7 in basso (70-85%).
  let thoughts = $state([
    {
      id: 1, text: '"È IMBATTIBILE"',
      cTop: '32%', cLeft: '28%', sTop: '10%', sLeft: '14%',
      mTop: '8%',  mLeft: '5%',  msTop: '5%',  msLeft: '4%',
      isScattered: false, tailDir: 'left', showOnMobile: true
    },
    {
      id: 2, text: '"È OVVIO CHE VINCA"',
      cTop: '35%', cLeft: '48%', sTop: '12%', sLeft: '58%',
      mTop: '18%', mLeft: '36%', msTop: '7%',  msLeft: '36%',
      isScattered: false, tailDir: 'right', showOnMobile: true
    },
    {
      id: 3, text: '"NON PUÒ SBAGLIARE"',
      cTop: '45%', cLeft: '22%', sTop: '30%', sLeft: '6%',
      mTop: '28%', mLeft: '5%',  msTop: '72%', msLeft: '4%',
      isScattered: false, tailDir: 'left', showOnMobile: true
    },
    {
      id: 4, text: '"TUTTI LO GUARDANO"',
      cTop: '45%', cLeft: '52%', sTop: '28%', sLeft: '68%',
      mTop: '38%', mLeft: '36%', msTop: '70%', msLeft: '36%',
      isScattered: false, tailDir: 'right', showOnMobile: true
    },
    {
      id: 5, text: '"È UNA VITTORIA FACILE"',
      cTop: '55%', cLeft: '32%', sTop: '72%', sLeft: '35%',
      mTop: '63%', mLeft: '8%',  msTop: '78%', msLeft: '5%',
      isScattered: false, tailDir: 'right', showOnMobile: false
    },
    {
      id: 6, text: '"È IL MIGLIORE"',
      cTop: '58%', cLeft: '55%', sTop: '74%', sLeft: '70%',
      mTop: '65%', mLeft: '48%', msTop: '80%', msLeft: '52%',
      isScattered: false, tailDir: 'right', showOnMobile: false
    },
    {
      id: 7, text: '"DEVE VINCERE"',
      cTop: '62%', cLeft: '25%', sTop: '68%', sLeft: '10%',
      mTop: '44%', mLeft: '5%',  msTop: '83%', msLeft: '5%',
      isScattered: false, tailDir: 'left', showOnMobile: true
    }
  ]);

  // Commento solo il PERCHÉ: filtriamo solo i pensieri visibili per l'iterazione nel template e
  // le azioni GSAP, evitando di montare fumetti nascosti nel DOM su mobile.
  const visibleThoughts = $derived(
    media.isMobile ? thoughts.filter(t => t.showOnMobile) : thoughts
  );

  let isIntroDone = $state(false);
  let hasCompletedOnce = $state(false);
  // Commento solo il PERCHÉ: activeCount si basa su visibleThoughts per calcolare blur/opacità
  // in modo proporzionale al numero di fumetti effettivamente mostrati, non sempre 7.
  let activeCount = $derived(visibleThoughts.filter(t => !t.isScattered).length);
  let totalVisible = $derived(visibleThoughts.length);
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

  // Il testo rimane nitido finché l'animazione di copertura non è completata.
  // Commento solo il PERCHÉ: i coefficienti sono proporzionali ai fumetti visibili (non fissi a 7)
  // per garantire che blur e opacità abbiano lo stesso impatto visivo su mobile (5) e desktop (7).
  let blurAmount = $derived(isIntroDone ? activeCount * (10.5 / totalVisible) : 0);
  let opacityAmount = $derived(isIntroDone ? (activeCount === 0 ? 1 : 0.4 + ((totalVisible - activeCount) * (0.56 / totalVisible))) : 1);

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

<section class="favorite-section" bind:this={container} use:thoughtsIntro={{ thoughts: visibleThoughts, onIntroChange: handleIntroChange, onReset: resetThoughts, hasCompletedOnce }}>
  
  <div class="sentence-container" style:--blur-amount="{blurAmount}px" style:--opacity-amount={opacityAmount}>
    <h3 class="main-sentence">
      {#if media.isMobile}
        Quando vincere diventa l'unico<br>
        traguardo accettabile, l'atleta<br>
        smette di essere una persona<br>
        e diventa solo un numero.
      {:else}
        Quando vincere diventa l'unico traguardo<br>
        accettabile, l'atleta smette di essere<br>
        una persona e diventa solo un numero.
      {/if}
    </h3>
  </div>

  {#each visibleThoughts as t (t.id)}
    <div 
      use:draggableThought={{ 
        id: t.id, 
        container, 
        sTop: media.isMobile ? t.msTop : t.sTop, 
        sLeft: media.isMobile ? t.msLeft : t.sLeft, 
        cTop: media.isMobile ? t.mTop : t.cTop, 
        cLeft: media.isMobile ? t.mLeft : t.cLeft, 
        isScattered: t.isScattered,
        thoughts: visibleThoughts,
        onScatter: markAsScattered 
      }}
      class="thought-box" 
      data-id={t.id} 
      style:--c-top={media.isMobile ? t.mTop : t.cTop}
      style:--c-left={media.isMobile ? t.mLeft : t.cLeft}
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

  /* --- Mobile responsive overrides --- */
  @media (max-width: 768px) {
    .main-sentence {
      /* Commento solo il PERCHÉ: aumenta il font della frase a text-m (20px su mobile) per renderla
         più visibile ed equilibrata rispetto alle nuvolette di pensiero */
      font-size: var(--text-m);
      line-height: 1.5;
      padding: 0 var(--spacing-4);
    }

    .thought-box {
      /* Commento solo il PERCHÉ: manteniamo nowrap per tenere il testo su una riga sola.
         Nessun max-width: i fumetti si allargano quanto serve per contenere il testo. */
      white-space: nowrap;
    }

    .thought-bubble {
      /* Commento solo il PERCHÉ: var(--text-xs) è 1rem (16px) su mobile — sufficiente per
         leggibilità ma abbastanza compatto da tenere anche i testi più lunghi su una riga
         senza uscire dai bordi su viewport ≥ 360px. */
      font-size: var(--text-xs);
    }

    /* Override padding compatto per i clip-path su mobile */
    .tail-left {
      padding: var(--spacing-2) var(--spacing-5) var(--spacing-2) var(--spacing-6);
    }

    .tail-right {
      padding: var(--spacing-2) var(--spacing-6) var(--spacing-2) var(--spacing-5);
    }
  }
</style>
