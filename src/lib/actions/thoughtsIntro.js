import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * @typedef {Object} Thought
 * @property {number} id - Identificatore unico
 * @property {string} text - Testo del pensiero
 * @property {string} cTop - Posizione top coperta
 * @property {string} cLeft - Posizione left coperta
 * @property {string} sTop - Posizione top sparsa
 * @property {string} sLeft - Posizione left sparsa
 * @property {boolean} isScattered - Se il pensiero è stato allontanato
 * @property {string} tailDir - Direzione della coda fumetto
 */

/**
 * @typedef {Object} ThoughtsIntroParams
 * @property {Thought[]} thoughts - Array di pensieri intrusivi
 * @property {(val: boolean) => void} onIntroChange - Callback per notificare il cambiamento di stato dell'intro
 * @property {() => void} onReset - Callback per reimpostare i pensieri
 */

/**
 * Svelte Action per l'animazione di entrata e ripristino dei pensieri intrusivi.
 * Posiziona i box in modalità sparsa e invisibile fin dall'avvio, e attiva la convergenza
 * e la sfocatura progressiva solo al raggiungimento dello scroll trigger.
 * Se l'utente torna in su, ripristina lo stato originale.
 * 
 * @param {HTMLElement} node - Il contenitore della sezione
 * @param {ThoughtsIntroParams} params - I parametri di configurazione
 */
export function thoughtsIntro(node, params) {
  const { thoughts, onIntroChange, onReset } = params;

  // Utilizzo del context per isolare le istanze e garantire un revert pulito in caso di distruzione del DOM
  const ctx = gsap.context(() => {
    const boxes = node.querySelectorAll('.thought-box');
    const sentenceContainer = node.querySelector('.sentence-container');

    if (!boxes.length || !sentenceContainer) return;

    const containerWidth = node.offsetWidth;
    const containerHeight = node.offsetHeight;

    /**
     * Calcola gli offset individuali di ciascun box rispetto al centro
     * @param {Thought} thought
     */
    const getOffsets = (thought) => {
      const cLeftPx = (parseFloat(thought.cLeft) / 100) * containerWidth;
      const cTopPx = (parseFloat(thought.cTop) / 100) * containerHeight;
      const sLeftPx = (parseFloat(thought.sLeft) / 100) * containerWidth;
      const sTopPx = (parseFloat(thought.sTop) / 100) * containerHeight;

      return {
        dx: sLeftPx - cLeftPx,
        dy: sTopPx - cTopPx
      };
    };

    // Imposta subito lo stato iniziale (fumetti esterni e invisibili, testo pulito)
    // per prevenire flash visivi in fase di caricamento iniziale
    boxes.forEach(box => {
      const idAttr = box.getAttribute('data-id');
      const id = parseInt(idAttr || '0', 10);
      const thought = thoughts.find(t => t.id === id);
      if (!thought) return;

      const { dx, dy } = getOffsets(thought);
      gsap.set(box, { x: dx, y: dy, opacity: 0, scale: 0.8 });
    });

    gsap.set(sentenceContainer, {
      '--blur-amount': '0px',
      '--opacity-amount': 1
    });

    // ScrollTrigger per controllare in modo flessibile sia l'ingresso che il ripristino delle animazioni
    ScrollTrigger.create({
      trigger: node,
      start: 'top 75%', // Si attiva non appena la sezione inizia a entrare significativamente nello schermo
      end: 'bottom 25%',
      onEnter: () => {
        onIntroChange(false);

        const activeCount = thoughts.filter(t => !t.isScattered).length;
        const targetBlur = activeCount * 1.5;
        const targetOpacity = activeCount === 0 ? 1 : 0.4 + ((7 - activeCount) * 0.08);

        // Timeline sincronizzata per iniziare con il congelamento/sfocatura del testo, seguito dall'assalto dei box
        const tl = gsap.timeline({
          onComplete: () => {
            onIntroChange(true);
            // Pulisce i transform per consentire alla logica di drag nativa di funzionare
            gsap.set(boxes, { x: 0, y: 0 });
          }
        });

        // 1. Inizia immediatamente l'effetto di sfocatura/ghiaccio sulla frase centrale
        tl.to(sentenceContainer, {
          '--blur-amount': `${targetBlur}px`,
          '--opacity-amount': targetOpacity,
          duration: 0.7,
          ease: 'power2.out'
        }, 0);

        // 2. Subito dopo (a 0.2s), i box partono all'impazzata e coprono la frase ormai sfocata
        boxes.forEach((box, index) => {
          const idAttr = box.getAttribute('data-id');
          const id = parseInt(idAttr || '0', 10);
          const thought = thoughts.find(t => t.id === id);
          if (!thought) return;

          const { dx, dy } = getOffsets(thought);

          // Assicura che riparta dallo stato sparso prima di volare in avanti
          gsap.set(box, { x: dx, y: dy, opacity: 0, scale: 0.8 });

          tl.to(box, {
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.35,
            ease: 'expo.out'
          }, 0.2 + index * 0.03); // Sciame fulmineo con stagger leggero a partire da 0.2s
        });
      },
      onLeaveBack: () => {
        // Ripristina lo stato logico di Svelte (rimuove il drag e azzera gli scattered)
        onReset();

        // Cancella qualsiasi tween in esecuzione sui nodi
        gsap.killTweensOf(boxes);
        gsap.killTweensOf(sentenceContainer);

        // Riporta fisicamente i box allo stato iniziale (sparsi e invisibili)
        boxes.forEach(box => {
          const idAttr = box.getAttribute('data-id');
          const id = parseInt(idAttr || '0', 10);
          const thought = thoughts.find(t => t.id === id);
          if (!thought) return;

          const { dx, dy } = getOffsets(thought);
          gsap.set(box, { x: dx, y: dy, opacity: 0, scale: 0.8 });
        });

        // Ripristina la nitidezza del testo
        gsap.set(sentenceContainer, {
          '--blur-amount': '0px',
          '--opacity-amount': 1
        });
      }
    });

  }, node);

  return {
    destroy() {
      // Revert di GSAP per rimuovere tutti i gestori ed evitare leak di memoria
      ctx.revert();
    }
  };
}
