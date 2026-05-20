<script>
  // Permette di passare classi CSS personalizzate dall'esterno
  let className = '';
  export { className as class };
</script>

<div class="glass-material {className}" {...$$restProps}>
  <slot />
</div>

<style>
  .glass-material {
    /* 1. Sfondo e Bordo esatti da Figma (nessuna modifica) */
    background-color: rgba(241, 250, 253, 0.55);
    border: 1px solid rgba(223, 244, 250, 0.5);
    
    /* 2. LA MAGIA: LA RIFRAZIONE SUI BORDI */
    /* Usiamo molteplici ombre interne LAYERED per simulare lo spessore e la curva del vetro, 
       che fa "curvare" visivamente ciò che c'è sotto. */
    box-shadow: 
      /* A. Ombra ESTERNA standard (X:2, Y:2, Blur:4, Nero al 23%) */
      2px 2px 4px rgba(0, 0, 0, 0.23),

      /* B. Ombra INTERNA - Luce spessa (Depth): 
         Una luce bianca diffusa per dare volume e spessore a tutta la card. */
      inset 0 0 10px rgba(255, 255, 255, 0.3),

      /* C. Ombra INTERNA - Riflesso sul bordo (Top-Left): 
         Una luce bianca netta e sottile per l'angolo illuminato a -45°. */
      inset 2px 2px 3px rgba(255, 255, 255, 0.9),

      /* D. Ombra INTERNA - Profondità sul bordo (Bottom-Right): 
         Un'ombra scura/azzurra molto sottile per definire il bordo opposto. */
      inset -1px -1px 3px rgba(223, 244, 250, 0.4);

    /* 3. Frost 13 + Refraction: Sfocatura e saturazione (nessuna modifica) */
    backdrop-filter: blur(13px) saturate(120%);
    -webkit-backdrop-filter: blur(13px) saturate(120%);
    
    /* 4. Gradiente di luce inclinata (nessuna modifica) */
    background-image: linear-gradient(
      -45deg, 
      rgba(255, 255, 255, 0.4) 0%, 
      rgba(255, 255, 255, 0) 30%, 
      rgba(255, 255, 255, 0) 70%, 
      rgba(255, 255, 255, 0.1) 100%
    );
  }
</style>