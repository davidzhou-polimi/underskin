import { gsap } from 'gsap';
import { Draggable } from 'gsap/dist/Draggable';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(Draggable);
}

/**
 * @typedef {Object} ThoughtItem
 * @property {number} id
 * @property {string} text
 * @property {string} cTop
 * @property {string} cLeft
 * @property {string} sTop
 * @property {string} sLeft
 * @property {boolean} isScattered
 * @property {string} tailDir
 */

/**
 * @typedef {Object} DraggableThoughtParams
 * @property {number} id - ID del pensiero
 * @property {HTMLElement} container - Contenitore genitore
 * @property {string} sTop - Posizione top sparsa
 * @property {string} sLeft - Posizione left sparsa
 * @property {string} cTop - Posizione top coperta
 * @property {string} cLeft - Posizione left coperta
 * @property {boolean} isScattered - Stato di sparpagliamento
 * @property {ThoughtItem[]} thoughts - Lista totale dei pensieri per il rilevamento collisioni
 * @property {(id: number) => void} onScatter - Callback per sparpagliare il pensiero
 */

/**
 * Calcola la posizione pixel ottimizzata per un fumetto, garantendo che rimanga
 * interamente dentro il contenitore e non si sovrapponga alla frase centrale.
 * @param {HTMLElement} node Il nodo DOM del fumetto
 * @param {string} targetLeftPct La percentuale di left target
 * @param {string} targetTopPct La percentuale di top target
 * @param {HTMLElement} container Il contenitore genitore
 * @param {HTMLElement | null} textContainer Il contenitore del testo centrale
 * @param {number} margin Margine di sicurezza dai bordi dello schermo in pixel
 */
function getClampedAndAvoidedPosition(node, targetLeftPct, targetTopPct, container, textContainer, paddingX = 8, paddingY = 100) {
  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;
  const nodeWidth = node.offsetWidth;
  const nodeHeight = node.offsetHeight;

  let x = (parseFloat(targetLeftPct) / 100) * containerWidth;
  let y = (parseFloat(targetTopPct) / 100) * containerHeight;

  x = Math.max(paddingX, Math.min(x, containerWidth - nodeWidth - paddingX));
  y = Math.max(paddingY, Math.min(y, containerHeight - nodeHeight - paddingY));

  if (textContainer) {
    const textLeft = textContainer.offsetLeft;
    const textTop = textContainer.offsetTop;
    const textWidth = textContainer.offsetWidth;
    const textHeight = textContainer.offsetHeight;

    const textRight = textLeft + textWidth;
    const textBottom = textTop + textHeight;

    const padding = 32;

    const overlapX = (x + nodeWidth > textLeft - padding) && (x < textRight + padding);
    const overlapY = (y + nodeHeight > textTop - padding) && (y < textBottom + padding);

    if (overlapX && overlapY) {
      const distToLeft = Math.abs((x + nodeWidth) - (textLeft - padding));
      const distToRight = Math.abs(x - (textRight + padding));
      const distToTop = Math.abs((y + nodeHeight) - (textTop - padding));
      const distToBottom = Math.abs(y - (textBottom + padding));

      const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

      if (minDist === distToLeft) {
        x = textLeft - padding - nodeWidth;
      } else if (minDist === distToRight) {
        x = textRight + padding;
      } else if (minDist === distToTop) {
        y = textTop - padding - nodeHeight;
      } else {
        y = textBottom + padding;
      }

      x = Math.max(paddingX, Math.min(x, containerWidth - nodeWidth - paddingX));
      y = Math.max(paddingY, Math.min(y, containerHeight - nodeHeight - paddingY));
    }
  }

  return { x, y };
}

/**
 * Svelte Action per rendere un fumetto trascinabile ed eliminabile tramite collisione/click/drag con GSAP.
 * @param {HTMLElement} node Il nodo DOM del fumetto a cui applicare l'azione
 * @param {DraggableThoughtParams} params Parametri dell'azione
 */
export function draggableThought(node, params) {
  let { id, container, sTop, sLeft, cTop, cLeft, isScattered, thoughts, onScatter } = params;
  let hasFlown = isScattered;

  /**
   * Esegue l'animazione di allontanamento (volo) del fumetto verso i bordi dello schermo.
   */
  function flyToScattered() {
    if (hasFlown) return;
    hasFlown = true;

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const textContainer = /** @type {HTMLElement | null} */ (container.querySelector('.sentence-container'));
    
    // Trova le coordinate finali sicure calcolate
    const spacing1Raw = window.getComputedStyle(document.documentElement).getPropertyValue('--spacing-1') || '8px';
    const paddingX = parseFloat(spacing1Raw) || 8;
    const paddingY = containerHeight * 0.15; // 15% di margine sopra e sotto per evitare di uscire dalla fascia centrale

    const targetPos = getClampedAndAvoidedPosition(
      node,
      sLeft,
      sTop,
      container,
      textContainer,
      paddingX,
      paddingY
    );

    // Calcola la posizione di partenza iniziale in pixel per determinare i delta esatti
    const startX = (parseFloat(cLeft) / 100) * containerWidth;
    const startY = (parseFloat(cTop) / 100) * containerHeight;

    const dx = targetPos.x - startX;
    const dy = targetPos.y - startY;

    // Killa qualsiasi animazione in corso prima di iniziare la traiettoria di sparo
    gsap.killTweensOf(node);

    gsap.to(node, {
      x: dx,
      y: dy,
      rotation: (Math.random() - 0.5) * 12, // Inclinazione naturale
      duration: 1.2,
      ease: 'power2.out',
      onComplete: () => {
        // Ripristina l'allineamento reattivo percentuale puro azzerando i transform
        gsap.set(node, { x: 0, y: 0 });
        node.style.left = `${(targetPos.x / containerWidth) * 100}%`;
        node.style.top = `${(targetPos.y / containerHeight) * 100}%`;
      }
    });
  }

  // Creazione del Draggable GSAP
  const draggableInstance = Draggable.create(node, {
    type: 'x,y',
    edgeResistance: 1,
    bounds: container,
    
    onPress: function() {
      // Commento solo il PERCHÉ: calcola dinamicamente all'inizio del drag i confini del translate
      // applicando un padding di sicurezza dal bordo pari al token --spacing-1 sull'asse X
      // e il 15% dell'altezza della sezione sull'asse Y per confinarli nella fascia centrale.
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      const nodeWidth = node.offsetWidth;
      const nodeHeight = node.offsetHeight;

      const spacing1Raw = window.getComputedStyle(document.documentElement).getPropertyValue('--spacing-1') || '8px';
      const paddingX = parseFloat(spacing1Raw) || 8;
      const paddingY = containerHeight * 0.05;

      const startLeft = node.offsetLeft;
      const startTop = node.offsetTop;

      this.applyBounds({
        minX: paddingX - startLeft,
        maxX: containerWidth - nodeWidth - paddingX - startLeft,
        minY: paddingY - startTop,
        maxY: containerHeight - nodeHeight - paddingY - startTop
      });
    },

    onDrag: function() {
      // Ottiene il baricentro del fumetto attualmente trascinato
      const rect1 = node.getBoundingClientRect();
      const cx1 = rect1.left + rect1.width / 2;
      const cy1 = rect1.top + rect1.height / 2;

      // Seleziona gli altri fumetti presenti nel container
      const otherBoxes = container.querySelectorAll('.thought-box:not([data-id="' + id + '"])');

      otherBoxes.forEach(otherBox => {
        const otherIdAttr = otherBox.getAttribute('data-id');
        const otherId = parseInt(otherIdAttr || '0', 10);
        
        // Cerca lo stato dell'altro pensiero per verificare che non sia già sparpagliato
        const otherThought = thoughts.find(t => t.id === otherId);
        if (otherThought && !otherThought.isScattered) {
          const rect2 = otherBox.getBoundingClientRect();
          const cx2 = rect2.left + rect2.width / 2;
          const cy2 = rect2.top + rect2.height / 2;

          // Calcola la distanza euclidea tra i due baricentri
          const distance = Math.hypot(cx1 - cx2, cy1 - cy2);

          // Soglia magnetica di allontanamento (130px)
          if (distance < 130) {
            onScatter(otherId);
          }
        }
      });
    },

    onDragEnd: function() {
      if (!isScattered) {
        onScatter(id);
      }
    },
    
    onClick: function() {
      if (!isScattered) {
        onScatter(id);
      }
    }
  })[0];

  return {
    /**
     * @param {DraggableThoughtParams} newParams
     */
    update(newParams) {
      if (draggableInstance && newParams.container) {
        draggableInstance.vars.bounds = newParams.container;
        draggableInstance.update();
      }

      id = newParams.id;
      container = newParams.container;
      sTop = newParams.sTop;
      sLeft = newParams.sLeft;
      cTop = newParams.cTop;
      cLeft = newParams.cLeft;
      thoughts = newParams.thoughts;
      onScatter = newParams.onScatter;

      // Gestione della reattività dello stato di sparpagliamento
      if (newParams.isScattered && !isScattered) {
        isScattered = true;
        flyToScattered();
      } else if (!newParams.isScattered) {
        // Se viene ripristinato l'intro (es. scroll-up), si azzera lo stato locale dell'azione
        isScattered = false;
        hasFlown = false;

        // Ripristina gli stili di posizionamento relativi, lasciando il transform sotto il controllo coordinato di thoughtsIntro
        node.style.left = '';
        node.style.top = '';
      }
    },
    
    destroy() {
      if (draggableInstance) {
        draggableInstance.kill();
      }
    }
  };
}
