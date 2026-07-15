/**
 * Contenuto custom per scrollSection nella variante MOBILE del gioco "pensieri intrusivi".
 * Esperienza a conveyor guidata dallo scroll: il pin lo crea la libreria (length 'long',
 * scrub 'auto'); qui il wrapper interno (.thoughts-scroller) viene traslato verso l'alto
 * come un finto scroll. Così la colonna resta ancorata nel viewport e "si allunga" mentre
 * i fumetti si accendono uno alla volta nella metà alta, spingendo sopra i precedenti;
 * superata la pila, appare la frase di chiusura.
 *
 * NB: è un pin scrollytelling standard, NON il lock direzionale (downLockGate):
 * nessun lock/scrollTo, quindi niente feedback-loop/shake.
 *
 * La rotazione obliqua di ciascun fumetto è pilotata qui via GSAP (dal data-attribute `data-rot`)
 * e non in CSS: animando `y`, un `rotate` impostato in CSS verrebbe sovrascritto dalla matrice di
 * trasformazione; gestendo entrambe le proprietà con GSAP la rotazione resta stabile nel reveal.
 *
 * @param {{ node: HTMLElement, gsap: typeof import('gsap').gsap, tl: gsap.core.Timeline | null }} ctx
 */
export function thoughtsConveyor({ node, gsap, tl }) {
  if (!tl) return;

  const scroller = /** @type {HTMLElement} */ (node.querySelector('.thoughts-scroller'));
  const bubbles = node.querySelectorAll('.mobile-thought');
  const sentence = node.querySelector('.closing-sentence');

  if (!scroller || !bubbles.length || !sentence) return;

  // Stato iniziale nascosto impostato sincronamente per prevenire il flash (FOUC) prima
  // dell'attivazione dello ScrollTrigger; la rotazione parte già applicata.
  gsap.set(bubbles, {
    autoAlpha: 0,
    y: 20,
    rotation: (i, el) => parseFloat(/** @type {HTMLElement} */ (el).dataset.rot || '0')
  });
  gsap.set(sentence, { autoAlpha: 0, y: 24 });

  const count = bubbles.length;

  // Finto scroll: la colonna parte con la prima riga a metà schermo (~50vh, responsive perché
  // legata a innerHeight) e sale finché il suo fondo (la frase) raggiunge il basso del viewport.
  // La sezione resta ferma (pin) → la colonna "resta fissa e si allunga". Funzioni per rileggere
  // le misure a ogni refresh (invalidateOnRefresh garantito da scrollytelling/pin.js). Il clamp
  // a 0 protegge il caso di colonna più corta del viewport: senza, il target sarebbe positivo
  // e la colonna scenderebbe invece di salire, invertendo il conveyor.
  tl.fromTo(
    scroller,
    { y: () => window.innerHeight * 0.5 },
    {
      y: () => Math.min(0, window.innerHeight - scroller.scrollHeight),
      ease: 'none',
      duration: count + 2
    },
    0
  );

  // I fumetti si accendono uno alla volta, sincronizzati con la risalita della colonna, così
  // ciascuno compare attorno all'ancora alta-centro. La rotazione (gsap.set) non viene animata.
  tl.to(
    bubbles,
    {
      autoAlpha: 1,
      y: 0,
      duration: 1,
      stagger: 1,
      ease: 'power2.out'
    },
    0
  );

  // Ultimo beat: superata la pila, uno stacco poi la frase di chiusura entra come rivelazione.
  tl.to(sentence, { autoAlpha: 1, y: 0, duration: 1.2, ease: 'power2.out' }, count + 1);
}
