<script>
  import { onMount } from "svelte";
  import { Delaunay } from "d3-delaunay";
  import { shatterGlass } from "$lib/actions/archetypes/shatterGlass.js";

  const NUM_SHARDS = 30; // Ridotto leggermente per diminuire il carico sul DOM mantenendo l'effetto denso

  /** @type {HTMLElement} */
  let stickyContainer;
  let plateWidth = 0;
  let plateHeight = 0;

  /** @type {Array<any>} */
  let fragments = $state([]);

  function generateVoronoiShards() {
    const width = plateWidth;
    const height = plateHeight;
    const points = [];

    for (let i = 0; i < NUM_SHARDS; i++) {
      const x = (Math.random() * 0.9 + 0.05) * width;
      const y = (Math.random() * 0.9 + 0.05) * height;
      points.push([x, y]);
    }

    // Assicura la copertura completa degli angoli e dei bordi dello schermo
    points.push([0, 0], [width, 0], [width, height], [0, height]);
    points.push(
      [width / 2, 0],
      [width / 2, height],
      [0, height / 2],
      [width, height / 2],
    );

    const delaunay = Delaunay.from(points);
    const voronoi = delaunay.voronoi([0, 0, width, height]);

    const tempFragments = [];

    for (let i = 0; i < points.length; i++) {
      const polygon = voronoi.cellPolygon(i);
      if (polygon) {
        tempFragments.push({
          clipPath: `polygon(${polygon.map(/** @param {[number, number]} p */ (p) => `${p[0]}px ${p[1]}px`).join(", ")})`,
        });
      }
    }
    return tempFragments;
  }

  onMount(() => {
    // Misuriamo il box reale del pannello (CSS 100vh = viewport lungo, stabile rispetto alla URL bar)
    // invece di window.innerHeight (viewport corto al mount): così i frammenti tappezzano tutto il
    // pannello e non lasciano scoperta la striscia inferiore quando la URL bar si ritrae.
    const apply = () => {
      const rect = stickyContainer.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      // Lo show/hide della URL bar non cambia il box 100vh → niente rigenerazione (evita thrash).
      if (w === plateWidth && h === plateHeight) return;
      plateWidth = w;
      plateHeight = h;
      fragments = generateVoronoiShards();
    };

    apply();

    // Rigenera solo su resize/orientation reali (il box 100vh cambia davvero); lo scroll che ritrae
    // la URL bar non tocca il box, quindi il ResizeObserver non scatta.
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let debounce;
    const ro = new ResizeObserver(() => {
      clearTimeout(debounce);
      debounce = setTimeout(apply, 150);
    });
    ro.observe(stickyContainer);

    return () => {
      clearTimeout(debounce);
      ro.disconnect();
    };
  });
</script>

<div
  id="shatter"
  class="scroll-wrapper"
  use:shatterGlass={{ fragments }}
>
  <div class="sticky-container" bind:this={stickyContainer}>
    <div class="content-behind">
      <h3>
        Un infortunio non interrompe solo una carriera,<br />
        ma anche il rapporto con il proprio corpo.
      </h3>
    </div>

    <!-- Lastra intera e unita per avere un unico backdrop-filter super performante -->
    <div class="whole-glass-plate">
      <div class="glass-effect full-plate"></div>
    </div>

    <!-- Contenitore dei frammenti ottimizzati (senza filtri pesanti in movimento) -->
    <div class="shards-container">
      {#each fragments as frag}
        <div class="glass-shard" style="clip-path: {frag.clipPath};"></div>
      {/each}
    </div>
  </div>
</div>

<style>
  h3 {
    line-height: 1.5;
  }

  .scroll-wrapper {
    height: 100vh;
    width: 100%;
    background-color: transparent;
    overflow: hidden;
  }

  .sticky-container {
    position: relative;
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }

  .content-behind {
    position: absolute;
    z-index: 1;
    text-align: center;
    font-family: var(--font-family-base);
    color: var(--content-primary);
    max-width: 80%;

    /* Calibrazione visiva iniziale sfocata per stimolare l'effetto svelamento */
    filter: blur(5px);
    opacity: 0.5;
    will-change: filter, opacity;
  }

  .whole-glass-plate {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9;
    will-change: opacity;
  }

  .whole-glass-plate :global(.glass-effect) {
    /* Spostiamo la maschera direttamente sull'elemento con il backdrop-filter per risolvere il bug di Chrome/Safari */
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 20vh);
    /* Forza la creazione di un layer di composizione hardware per applicare correttamente la maschera al filtro di sfondo */
    transform: translateZ(0);
    /* Rimuove la linea di contorno rigida per consentire una transizione fluida dello sfondo sfocato */
    border: none !important;
  }

  .full-plate {
    width: 100% !important;
    height: 100% !important;
  }

  .shards-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 10;
    pointer-events: none;
    opacity: 0;
  }

  /* Frammenti ottimizzati: colore e bordi vetrosi puri senza pesanti backdrop-filter e box-shadow */
  .glass-shard {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: color-mix(in srgb, var(--neutral-50) 45%, transparent);
    border: 1px solid color-mix(in srgb, var(--neutral-100) 40%, transparent);
    background-image: linear-gradient(
      -45deg,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0) 30%,
      rgba(255, 255, 255, 0) 70%,
      rgba(255, 255, 255, 0.1) 100%
    );
    will-change: transform, opacity;
  }
</style>
