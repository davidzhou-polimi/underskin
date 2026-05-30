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
    border = true,
    ...restProps 
  } = $props();
</script>

<div class="glass-material {className}" class:has-border={border} {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  .glass-material {
    /* Estrazione del canale alpha dal token esistente per evitare color-mix e nuovi token */
    background-color: rgb(from var(--neutral-100) r g b / 0.5);

    /* Sfocatura minimale dello sfondo per un effetto vetro pulito ed essenziale */
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .glass-material.has-border {
    /* Il bordo viene renderizzato condizionatamente per consentire il mascheramento di forme complesse senza artefatti geometrici */
    border: 1px solid rgb(from var(--neutral-50) r g b / 0.3);
  }
</style>
