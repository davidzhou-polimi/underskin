import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Interfaccia personalizzata per i parametri dell'azione Svelte
 * @typedef {Object} ScrollActionParams
 * @property {HTMLElement} currentElement - Il primo blocco di testo che deve uscire
 * @property {HTMLElement} nextElement - Il secondo blocco di testo che deve entrare
 * @property {HTMLElement} [trigger] - L'elemento che attiva lo ScrollTrigger (opzionale)
 */

/**
 * Azione Svelte per gestire lo swap orizzontale del testo con pinning dello scroll.
 * * @param {HTMLElement} node - L'elemento HTML su cui è applicata l'azione (use:scrollableTextSwap)
 * @param {ScrollActionParams} params - Gli elementi del DOM necessari per l'animazione
 */
export function scrollableTextSwap(node, params) {
  // Estraiamo i parametri in modo sicuro dopo che l'editor sa che fanno parte di ScrollActionParams
  const currentElement = params?.currentElement;
  const nextElement = params?.nextElement;
  const trigger = params?.trigger;

  if (!currentElement || !nextElement) {
    return { destroy: () => {} };
  }

  const animationPromise = new Promise((resolve) => {
    setTimeout(() => {
      const ctx = gsap.context(() => {
        // Configurazione iniziale dello stato orizzontale degli elementi
        gsap.set(nextElement, { xPercent: 100, opacity: 0 });
        gsap.set(currentElement, { xPercent: 0, opacity: 1 });

        // Timeline con Pinning ancorata alla cima dello schermo
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: trigger || node,
            start: 'top top',
            end: '+=100%',
            scrub: 1,
            pin: true,
            invalidateOnRefresh: true
          }
        });

        // 1. Pausa iniziale per consentire la lettura del primo testo
        tl.to({}, { duration: 0.5 });

        // 2. Transizione in contemporanea dei due testi
        tl.to(
          currentElement,
          {
            xPercent: -100,
            opacity: 0,
            duration: 1,
            ease: 'power1.inOut'
          },
          '>'
        );

        tl.to(
          nextElement,
          {
            xPercent: 0,
            opacity: 1,
            duration: 1,
            ease: 'power1.inOut'
          },
          '<'
        );

        // 3. Piccola sosta finale sul secondo testo prima dello sblocco dello scroll
        tl.to({}, { duration: 0.3 });

      }, node);

      resolve(ctx);
    }, 0);
  });

  return {
    destroy() {
      animationPromise.then((ctx) => {
        if (ctx) ctx.revert();
      });
    }
  };
}