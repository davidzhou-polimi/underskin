<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children] - Contenuto da visualizzare all'interno dell'effetto vetro.
   * @property {string} [class] - Classi CSS aggiuntive passate dall'esterno.
   */

  /** @type {Props & Record<string, any>} */
  let { 
    children, 
    class: className = '', 
    ...restProps 
  } = $props();
</script>

<div class="glass-material {className}" {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  .glass-material {
    /* Utilizzo del token di colore primario con opacity mix in srgb per coerenza di brand */
    background-color: color-mix(in srgb, var(--neutral-50) 55%, transparent);
    border: 1px solid color-mix(in srgb, var(--neutral-100) 50%, transparent);
    
    /* Ombre stratificate per simulare la rifrazione e lo spessore reale del vetro */
    box-shadow: 
      2px 2px 4px rgba(0, 0, 0, 0.23),
      inset 0 0 10px rgba(255, 255, 255, 0.3),
      inset 2px 2px 3px rgba(255, 255, 255, 0.9),
      inset -1px -1px 3px color-mix(in srgb, var(--neutral-100) 40%, transparent);

    /* Sfocatura dello sfondo per l'effetto frosted glass */
    backdrop-filter: blur(13px) saturate(120%);
    -webkit-backdrop-filter: blur(13px) saturate(120%);
    
    /* Gradiente angolare per simulare la rifrazione e la luce incidente a -45° */
    background-image: linear-gradient(
      -45deg, 
      rgba(255, 255, 255, 0.4) 0%, 
      rgba(255, 255, 255, 0) 30%, 
      rgba(255, 255, 255, 0) 70%, 
      rgba(255, 255, 255, 0.1) 100%
    );
  }
</style>
