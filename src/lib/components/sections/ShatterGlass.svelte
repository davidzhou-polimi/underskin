<script>
  import { onMount, tick } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { Delaunay } from 'd3-delaunay';

  /** @type {HTMLElement} */
  let scrollWrapper;
  /** @type {HTMLCanvasElement} */
  let canvas;
  /** @type {CanvasRenderingContext2D} */
  let ctx;

  const NUM_SHARDS = 35; 
  let windowWidth = 0;
  let windowHeight = 0;
  
  const textureSrc = '/textures/ice_texture.png'; 
  /** @type {HTMLImageElement} */
  let textureImage;
  let imageLoaded = false; 

  /** @type {Array<any>} */
  let fragments = [];

  function generateVoronoiShards() {
    const width = windowWidth;
    const height = windowHeight;
    const points = [];
    
    for (let i = 0; i < NUM_SHARDS; i++) {
      const x = (Math.random() * 0.9 + 0.05) * width; 
      const y = (Math.random() * 0.9 + 0.05) * height;
      points.push([x, y]);
    }
    
    points.push([0, 0], [width, 0], [width, height], [0, height]);
    points.push([width/2, 0], [width/2, height], [0, height/2], [width, height/2]);

    const delaunay = Delaunay.from(points);
    const voronoi = delaunay.voronoi([0, 0, width, height]);
    
    const tempFragments = [];

    for (let i = 0; i < points.length; i++) {
      const polygon = voronoi.cellPolygon(i);
      if (polygon) {
        tempFragments.push({
          path: polygon,       
          y: 0,                 
          opacity: 1
        });
      }
    }
    return tempFragments;
  }

  onMount(async () => {
    await tick();

    if (!canvas) return;

    gsap.registerPlugin(ScrollTrigger);

    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    canvas.width = windowWidth;
    canvas.height = windowHeight;
    ctx = canvas.getContext('2d');

    fragments = generateVoronoiShards();

    // Effetto congelamento in entrata (Mantenuto, è fluido)
    gsap.fromTo(canvas, 
      { opacity: 0 }, 
      { 
        opacity: 1,
        scrollTrigger: {
          trigger: scrollWrapper,
          start: 'top 80%', 
          end: 'top top',   
          scrub: true
        }
      }
    );

    initAnimation();

    textureImage = new Image();
    textureImage.onload = () => {
      imageLoaded = true;
      drawCanvas(); 
    };
    textureImage.src = textureSrc;
  });

  function drawCanvas() {
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    fragments.forEach(frag => {
      ctx.save(); 
      ctx.translate(0, frag.y); 

      ctx.beginPath();
      const startPoint = frag.path[0];
      ctx.moveTo(startPoint[0], startPoint[1]);
      for (let i = 1; i < frag.path.length; i++) {
        ctx.lineTo(frag.path[i][0], frag.path[i][1]);
      }
      ctx.closePath();
      
      ctx.globalAlpha = frag.opacity; 
      ctx.clip(); 

      if (imageLoaded && textureImage.complete) {
        ctx.drawImage(textureImage, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = "rgba(223, 244, 250, 0.95)";
        ctx.fill();
      }
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'; 
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore(); 
    });
  }

  function initAnimation() {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scrollWrapper,
        start: 'top top',
        end: '+=200%', 
        scrub: 1,
        pin: true,
      }
    });

    tl.addLabel("shatter");

    // 1. Caduta del ghiaccio (Manteniamo la caduta lenta e caotica per 2s)
    tl.to(fragments, {
      y: windowHeight * 1.5,
      opacity: 0,
      duration: 2, 
      stagger: {
        each: 0.04,
        from: "random"
      },
      ease: 'power3.in',
      onUpdate: drawCanvas 
    }, "shatter");

    // 2. CALIBRAZIONE TEMPORALE TESTO: Messa a fuoco rapidissima!
    tl.to('.content-behind', {
      filter: 'blur(0px)',
      opacity: 1,
      // Accorciamo drasticamente da 2s a 0.6s. 
      // Il testo va a fuoco quasi subito mentre i primi pezzi cadono.
      duration: 0.6, 
      ease: 'power2.inOut'
    }, "shatter"); 

    drawCanvas();
  }
</script>

<div class="scroll-wrapper" bind:this={scrollWrapper}>
  <div class="sticky-container">
    
    <div class="content-behind">
      <p>
        Un infortunio non interrompe solo una carriera,<br>
        ma anche il rapporto con il proprio corpo.
      </p>
    </div>
    
    <canvas bind:this={canvas} class="puzzle-canvas"></canvas>
  </div>
</div>

<style>
  .scroll-wrapper {
    height: 100vh;
    width: 100%;
    background-color: #f4f8fb;
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
    
    /* CALIBRAZIONE VISIVA INIZIALE: Meno sfocato, più visibile */
    filter: blur(3px); /* Ridotto da 15px */
    opacity: 0.5;      /* Aumentato da 0.3 */
    will-change: filter, opacity;
  }

  .puzzle-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 10;
    pointer-events: none;
  }
</style>