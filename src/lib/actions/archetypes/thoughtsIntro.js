import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { getLenis, lockScrollDown, unlockScrollDown } from '$lib/stores/lenis.svelte.js';

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
 * @property {boolean} [hasCompletedOnce] - Indica se l'interazione è già stata completata con successo
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
  let hasCompletedOnce = params.hasCompletedOnce ?? false;

  // Commento solo il PERCHÉ: blocco direzionale verso il basso mentre la sezione è in cima e l'attività non è
  // completata; la risalita resta libera. Centralizzato nello store (listener in fase capture, Lenis-aware).
  let downLocked = false;
  /** @param {boolean} active */
  function setDownLock(active) {
    if (active && !hasCompletedOnce) {
      if (!downLocked) {
        downLocked = true;
        lockScrollDown();
        // Incolla la sezione al top, uccidendo l'eventuale overshoot di inerzia di Lenis
        getLenis()?.scrollTo(node, { immediate: true, force: true });
      }
    } else if (downLocked) {
      downLocked = false;
      unlockScrollDown();
    }
  }

  // Utilizzo del context per isolare le istanze e garantire un revert pulito in caso di distruzione del DOM
  const ctx = gsap.context(() => {
    const boxes = node.querySelectorAll('.thought-box');
    const sentenceContainer = node.querySelector('.sentence-container');

    if (!boxes.length || !sentenceContainer) return;

    // Traccia lo stato locale dell'intro per prevenire riattivazioni indesiderate dovute a oscillazioni dello scrolling
    let introCompleted = false;
    // Memorizza il riferimento alla timeline attiva per consentirne la distruzione immediata in fase di reset
    /** @type {any} */
    let activeTimeline = null;

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

    // Utilizziamo due ScrollTrigger separati per implementare l'isteresi ed evitare rimbalzi accidentali (chattering) al confine della sezione.
    // Il primo attiva l'entrata quando si scende e la sezione occupa il 75% della viewport.
    ScrollTrigger.create({
      trigger: node,
      start: 'top 75%',
      onEnter: () => {
        // Se l'utente ha già disperso tutti i pensieri, non attiviamo più l'entrata degli stessi
        if (hasCompletedOnce) return;

        // Se l'intro è già stata completata, si blocca l'esecuzione per evitare di scatenare un loop di snap
        if (introCompleted) return;

        // Se è già presente una timeline attiva da un tentativo parziale precedente, la distruggiamo subito
        if (activeTimeline) {
          activeTimeline.kill();
        }

        onIntroChange(false);

        const activeCount = thoughts.filter(t => !t.isScattered).length;
        const targetBlur = activeCount * 1.5;
        const targetOpacity = activeCount === 0 ? 1 : 0.4 + ((7 - activeCount) * 0.08);

        // La timeline coordinata garantisce che la sfocatura parta prima e i box la seguano in sequenza
        activeTimeline = gsap.timeline({
          onComplete: () => {
            introCompleted = true;
            onIntroChange(true);
            // I transform vengono resettati per lasciare il controllo alle Svelte Actions di drag
            gsap.set(boxes, { x: 0, y: 0 });
            activeTimeline = null;
          }
        });

        // La sfocatura ammorbidisce visivamente l'impatto grafico prima dell'arrivo dei fumetti
        activeTimeline.to(sentenceContainer, {
          '--blur-amount': `${targetBlur}px`,
          '--opacity-amount': targetOpacity,
          duration: 1.5,
          ease: 'power2.out'
        }, 0);

        // Lo stagger dilazionato previene un effetto visivo caotico o frammentato nel volo dei singoli pensieri
        boxes.forEach((box, index) => {
          const idAttr = box.getAttribute('data-id');
          const id = parseInt(idAttr || '0', 10);
          const thought = thoughts.find(t => t.id === id);
          if (!thought) return;

          const { dx, dy } = getOffsets(thought);

          gsap.set(box, { x: dx, y: dy, opacity: 0, scale: 0.8 });

          activeTimeline.to(box, {
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'power3.out'
          }, 0.5 + index * 0.1);
        });
      }
    });

    // Il secondo ScrollTrigger gestisce il reset e il rilascio dello scroll solo quando si risale quasi interamente (al 95%) verso la Hero.
    // La distanza tra 75% e 95% crea un cuscinetto che immunizza il sistema dai micro-rimbalzi inerziali dello scrolling dei browser.
    ScrollTrigger.create({
      trigger: node,
      start: 'top 95%',
      onLeaveBack: () => {
        // Se l'utente ha già disperso tutti i pensieri, preserviamo lo stato sparso ed evitiamo il reset
        if (hasCompletedOnce) return;

        introCompleted = false;

        // La timeline attiva viene interrotta istantaneamente per impedire la chiamata tardiva al callback di completezza
        if (activeTimeline) {
          activeTimeline.kill();
          activeTimeline = null;
        }

        onReset();

        gsap.killTweensOf(boxes);
        gsap.killTweensOf(sentenceContainer);

        // I posizionamenti inline residui vengono rimossi per consentire il ricalcolo dinamico degli offset corretti
        boxes.forEach(box => {
          const idAttr = box.getAttribute('data-id');
          const id = parseInt(idAttr || '0', 10);
          const thought = thoughts.find(t => t.id === id);
          if (!thought) return;

          const htmlBox = /** @type {HTMLElement} */ (box);
          htmlBox.style.left = '';
          htmlBox.style.top = '';
          gsap.set(htmlBox, { clearProps: 'transform' });

          const { dx, dy } = getOffsets(thought);
          gsap.set(box, { x: dx, y: dy, opacity: 0, scale: 0.8, rotation: 0 });
        });

        gsap.set(sentenceContainer, {
          '--blur-amount': '0px',
          '--opacity-amount': 1
        });
      }
    });

    // Terzo ScrollTrigger: blocca lo scroll verso il basso quando la sezione è in cima alla viewport,
    // finché l'utente non ha disperso tutti i pensieri. La risalita resta sempre consentita.
    ScrollTrigger.create({
      trigger: node,
      start: 'top top',
      end: 'bottom top',
      onToggle: (self) => setDownLock(self.isActive)
    });

  }, node);

  return {
    /**
     * Sincronizza lo stato dell'azione quando le proprietà reattive in Svelte cambiano
     * @param {ThoughtsIntroParams} newParams
     */
    update(newParams) {
      hasCompletedOnce = newParams.hasCompletedOnce ?? false;
      // Completata l'attività, rilascia subito il blocco verso il basso
      if (hasCompletedOnce) setDownLock(false);
    },
    destroy() {
      // Rilascia il blocco e fa il revert di GSAP per evitare leak di memoria/listener orfani
      setDownLock(false);
      ctx.revert();
    }
  };
}
