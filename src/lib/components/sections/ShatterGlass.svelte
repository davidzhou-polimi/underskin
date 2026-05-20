<script>
  import { onMount, tick } from "svelte";
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  import { Delaunay } from "d3-delaunay";
  import GlassEffect from "$lib/components/sections/GlassEffect.svelte";

  /** @type {HTMLElement} */
  let scrollWrapper;

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

  onMount(async () => {
    await tick();

    gsap.registerPlugin(ScrollTrigger);

    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    fragments = generateVoronoiShards();

    await tick();

    // Svanisce gradualmente in entrata la lastra di vetro iniziale
    gsap.fromTo(
      ".whole-glass-plate",
      { opacity: 0 },
      {
        opacity: 1,
        scrollTrigger: {
          trigger: scrollWrapper,
          start: "top 80%",
          end: "top top",
          scrub: true,
        },
      },
    );

    initAnimation();
  });

  function initAnimation() {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scrollWrapper,
        start: "top top",
        end: "+=200%",
        scrub: 1,
        pin: true,
      },
    });

    tl.addLabel("shatter");

    // Nasconde all'istante la lastra intera pesante all'inizio dello scroll di rottura
    tl.to(
      ".whole-glass-plate",
      {
        opacity: 0,
        duration: 0.15,
        ease: "power1.out",
      },
      "shatter",
    );

    // Mostra all'istante i frammenti leggeri pronti a cadere
    tl.fromTo(
      ".shards-container",
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 0.15,
        ease: "power1.out",
      },
      "shatter",
    );

    // Anima la caduta caotica e fluida dei frammenti vettoriali leggeri a 60 FPS
    tl.to(
      ".glass-shard",
      {
        y: windowHeight * 1.5,
        x: () => (Math.random() - 0.5) * 160,
        rotation: () => (Math.random() - 0.5) * 45,
        opacity: 0,
        duration: 1.5,
        stagger: {
          each: 0.04,
          from: "random",
        },
        ease: "power3.in",
      },
      "shatter",
    );

    // Ripristina la nitidezza del testo in coincidenza con la rottura dei primi pezzi
    tl.to(
      ".content-behind",
      {
        filter: "blur(0px)",
        opacity: 1,
        duration: 2,
        ease: "power2.inOut",
      },
      "shatter",
    );
  }
</script>

<div class="scroll-wrapper" bind:this={scrollWrapper}>
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
    font-family: system-ui, sans-serif;
    color: #0c2137;
    font-size: 1.8rem;
    font-weight: 500;
    line-height: 1.5;
    max-width: 80%;

    /* Calibrazione visiva iniziale sfocata */
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
    background-color: rgba(241, 250, 253, 0.45);
    border: 1px solid rgba(223, 244, 250, 0.4);
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
