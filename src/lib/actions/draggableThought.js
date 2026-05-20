import { gsap } from 'gsap';
import { Draggable } from 'gsap/dist/Draggable';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(Draggable);
}

/**
 * Calcola la posizione pixel ottimizzata per un fumetto, garantendo che rimanga
 * interamente dentro il contenitore e non si sovrapponga alla frase centrale.
 * @param {HTMLElement} node Il nodo DOM del fumetto
 * @param {string} targetLeftPct La percentuale di left target
 * @param {string} targetTopPct La percentuale di top target
 * @param {HTMLElement} container Il contenitore genitore
 * @param {HTMLElement} textContainer Il contenitore del testo centrale
 * @param {number} margin Margine di sicurezza dai bordi dello schermo in pixel
 */
function getClampedAndAvoidedPosition(node, targetLeftPct, targetTopPct, container, textContainer, margin = 20) {
  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;
  const nodeWidth = node.offsetWidth;
  const nodeHeight = node.offsetHeight;

  // Calcola le coordinate pixel target basate sulle percentuali desiderate
  let x = (parseFloat(targetLeftPct) / 100) * containerWidth;
  let y = (parseFloat(targetTopPct) / 100) * containerHeight;

  // 1. Clamping iniziale per mantenere il box interamente visibile nello schermo
  x = Math.max(margin, Math.min(x, containerWidth - nodeWidth - margin));
  y = Math.max(margin, Math.min(y, containerHeight - nodeHeight - margin));

  // 2. Allontanamento dal testo centrale (collision avoidance)
  if (textContainer) {
    const textLeft = textContainer.offsetLeft;
    const textTop = textContainer.offsetTop;
    const textWidth = textContainer.offsetWidth;
    const textHeight = textContainer.offsetHeight;

    const textRight = textLeft + textWidth;
    const textBottom = textTop + textHeight;

    const padding = 32; // Distanza minima di sicurezza intorno al testo centrale

    // Verifica la sovrapposizione tra le bounding box (estese col padding)
    const overlapX = (x + nodeWidth > textLeft - padding) && (x < textRight + padding);
    const overlapY = (y + nodeHeight > textTop - padding) && (y < textBottom + padding);

    if (overlapX && overlapY) {
      // Calcola le distanze di uscita verso i 4 lati del testo centrale per prendere la strada più breve
      const distToLeft = Math.abs((x + nodeWidth) - (textLeft - padding));
      const distToRight = Math.abs(x - (textRight + padding));
      const distToTop = Math.abs((y + nodeHeight) - (textTop - padding));
      const distToBottom = Math.abs(y - (textBottom + padding));

      const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

      // Sposta il box sul lato più vicino
      if (minDist === distToLeft) {
        x = textLeft - padding - nodeWidth;
      } else if (minDist === distToRight) {
        x = textRight + padding;
      } else if (minDist === distToTop) {
        y = textTop - padding - nodeHeight;
      } else {
        y = textBottom + padding;
      }

      // Esegue nuovamente il clamping post-spostamento per evitare che sia uscito dallo schermo
      x = Math.max(margin, Math.min(x, containerWidth - nodeWidth - margin));
      y = Math.max(margin, Math.min(y, containerHeight - nodeHeight - margin));
    }
  }

  return { x, y };
}

/**
 * Svelte Action per rendere un fumetto trascinabile ed eliminabile con il click tramite GSAP.
 * @param {HTMLElement} node Il nodo DOM del fumetto a cui applicare l'azione
 * @param {Object} params Parametri dell'azione: { id, container, sTop, sLeft, cTop, cLeft, onScatter }
 */
export function draggableThought(node, params = {}) {
  let { id, container, sTop, sLeft, cTop, cLeft, onScatter } = params;
  let isScattered = false;

  const draggableInstance = Draggable.create(node, {
    type: 'x,y',
    edgeResistance: 0.8,
    bounds: container,
    
    onDragEnd: function() {
      if (!isScattered) {
        isScattered = true;
        onScatter(id);
      }
    },
    
    onClick: function() {
      if (!isScattered) {
        isScattered = true;
        onScatter(id);

        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        const textContainer = container.querySelector('.sentence-container');
        
        // Trova le coordinate finali sicure
        const targetPos = getClampedAndAvoidedPosition(
          node,
          sLeft,
          sTop,
          container,
          textContainer
        );

        // Calcola la posizione di partenza iniziale in pixel per ottenere il delta esatto
        const startX = (parseFloat(cLeft) / 100) * containerWidth;
        const startY = (parseFloat(cTop) / 100) * containerHeight;

        const dx = targetPos.x - startX;
        const dy = targetPos.y - startY;

        gsap.to(node, {
          x: dx,
          y: dy,
          rotation: (Math.random() - 0.5) * 12, // Leggera inclinazione naturale
          duration: 1.2,
          ease: 'power2.out',
          onComplete: () => {
            // Rende il layout reattivo azzerando i transform GSAP e applicando le percentuali reali calcolate
            gsap.set(node, { x: 0, y: 0 });
            node.style.left = `${(targetPos.x / containerWidth) * 100}%`;
            node.style.top = `${(targetPos.y / containerHeight) * 100}%`;
          }
        });
      }
    }
  })[0];

  return {
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
      onScatter = newParams.onScatter;
    },
    
    destroy() {
      if (draggableInstance) {
        draggableInstance.kill();
      }
    }
  };
}

