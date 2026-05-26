<script>
  import { onMount } from "svelte";
  import { Delaunay } from "d3-delaunay";
  import GlassEffect from "$lib/components/ui/GlassEffect.svelte";
  import { shatterGlass } from "$lib/actions/shatterGlass.js";
  import { trackSection } from "$lib/actions/trackSection.js";

  const NUM_SHARDS = 30; // Ridotto leggermente per diminuire il carico sul DOM mantenendo l'effetto denso
  let windowWidth = 0;
  let windowHeight = 0;

  /** @type {Array<any>} */
  let fragments = $state([]);

  function generateVoronoiShards() {
    const width = windowWidth;
    const height = windowHeight;
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
          clipPath: `polygon(${polygon.map((p) => `${p[0]}px ${p[1]}px`).join(", ")})`,
        });
      }
    }
    return tempFragments;
  }

  onMount(() => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    // Calcolo reattivo sul client dopo il caricamento iniziale del layout
    fragments = generateVoronoiShards();
  });
</script>

<div id="shatter" class="scroll-wrapper" use:trackSection use:shatterGlass={{ fragments }}>
  <div class="sticky-container">
    <div class="content-behind">
      <p>
        Un infortunio non interrompe solo una carriera,<br />
        ma anche il rapporto con il proprio corpo.
      </p>
    </div>

    <!-- Lastra intera e unita per avere un unico backdrop-filter super performante -->
    <div class="whole-glass-plate">
      <GlassEffect class="full-plate" />
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
  .scroll-wrapper {
    height: 100vh;
    width: 100%;
    /* Luce soffusa rossa per evocare lo stato emotivo dell'infortunio mantenendo la leggibilità */
    background: radial-gradient(
        circle at 80% 20%,
        color-mix(in srgb, var(--archetipi-infortunato) 15%, transparent) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 15% 85%,
        color-mix(in srgb, var(--archetipi-infortunato) 8%, transparent) 0%,
        transparent 60%
      ),
      var(--background-primary);
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
    color: var(--content-secondary);
    font-size: var(--text-m);
    font-weight: 500;
    line-height: 1.5;
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

  :global(.full-plate) {
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
