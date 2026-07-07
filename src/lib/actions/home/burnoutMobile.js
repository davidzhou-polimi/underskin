import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';
import { getLenis, lockScrollDown, unlockScrollDown } from '$lib/stores/lenis.svelte.js';

// Secondi di pressione continua per riempire il cerchio; il rilascio svuota più in fretta
// per dare la sensazione che lo "sforzo" vada mantenuto con costanza.
const FILL_SECONDS = 2;
const DECAY_SECONDS = 1.2;

/**
 * Azione Svelte per la variante mobile della sezione Burnout, composta da due blocchi
 * sequenziali in flusso:
 * 1. `.m-text-block` — pinnato via sticky: lo scroll rivela "È la performance." sotto il
 *    sottotitolo, poi (esaurito il pin) il blocco scorre via naturalmente verso l'alto.
 * 2. `.m-hold-block` — il press-and-hold: tenendo premuto, un cerchio pieno riempie quello
 *    tratteggiato mentre la parola BURNOUT cresce tremolando sullo sfondo; a riempimento
 *    completo la parola esplode e svanisce, entrano i testi finali e lo scroll si sblocca.
 *
 * Lo scroll verso il basso è bloccato in cima al blocco del cerchio finché l'interazione
 * non è stata completata almeno una volta (pattern direzionale di gameDownLock.js, più il
 * re-ancoraggio anti-fling: preventDefault non ferma un'inerzia già partita).
 *
 * @param {HTMLElement} node - Il contenitore esterno della sezione
 */
export function burnoutMobile(node) {
	// Persiste fuori dal branch matchMedia: un resize desktop↔mobile non deve far rigiocare l'attività
	let hasCompleted = false;

	const mm = gsap.matchMedia();

	mm.add('(max-width: 768px)', () => {
		const textBlockEl = node.querySelector('.m-text-block');
		const titleEl = node.querySelector('.m-title');
		const holdPinEl = node.querySelector('.m-hold-pin');
		const holdEl = node.querySelector('.m-hold');
		const holdTargetEl = node.querySelector('.m-hold-target');
		const fillEl = node.querySelector('.m-hold-fill');
		const wordEl = node.querySelector('.m-burnout-word');
		const outroEl = node.querySelector('.m-outro');

		if (
			!textBlockEl || !titleEl || !holdPinEl || !holdEl ||
			!holdTargetEl || !fillEl || !wordEl || !outroEl
		) return;

		const outroChildren = outroEl.children;

		const ctx = gsap.context(() => {}, node);

		/** @param {number} v */
		const clamp01 = (v) => Math.max(0, Math.min(1, v));

		// ─── Reveal del titolo lungo il pin del blocco testi ──────────────────

		/** @param {number} progress */
		function applyReveal(progress) {
			// Il reveal occupa il primo 60% del pin; il resto è plateau di lettura
			// prima che il blocco scorra via.
			const reveal = clamp01(progress / 0.6);
			gsap.set(titleEl, {
				opacity: reveal,
				y: (1 - reveal) * 30,
				filter: `blur(${(1 - reveal) * 8}px)`
			});
		}

		// ─── Lock direzionale in cima al blocco del cerchio ───────────────────

		let downLocked = false;

		/**
		 * @param {boolean} active
		 * @param {number} [snapPosition] - posizione scroll che allinea il blocco a schermo intero
		 */
		function setDownLock(active, snapPosition) {
			if (active && !hasCompleted) {
				if (!downLocked) {
					downLocked = true;
					lockScrollDown();
					// Incolla il blocco al top, uccidendo l'eventuale overshoot di inerzia di Lenis
					if (snapPosition !== undefined) {
						getLenis()?.scrollTo(snapPosition, { immediate: true, force: true });
					}
				}
			} else if (downLocked) {
				downLocked = false;
				unlockScrollDown();
			}
		}

		// ─── Press-and-hold ───────────────────────────────────────────────────

		let isPressed = false;
		let holdProgress = 0;

		function renderHold() {
			gsap.set(fillEl, { scale: holdProgress });

			// Commento solo il PERCHÉ: il tremolio è rumore casuale per-frame con ampiezza
			// proporzionale al progresso (tecnica di shatterGlass.js): più si preme, più trema.
			const amp = holdProgress * 6;
			gsap.set(wordEl, {
				opacity: holdProgress,
				scale: 0.6 + holdProgress * 0.5,
				x: (Math.random() - 0.5) * amp,
				y: (Math.random() - 0.5) * amp,
				rotation: (Math.random() - 0.5) * amp * 0.15
			});
		}

		function complete() {
			if (hasCompleted) return;
			hasCompleted = true;
			isPressed = false;
			gsap.ticker.remove(tick);
			setDownLock(false);

			ctx.add(() => {
				const tl = gsap.timeline();
				// La parola esplode verso l'osservatore e svanisce; il cerchio la segue
				tl.to(wordEl, { scale: 2, autoAlpha: 0, duration: 0.9, ease: 'power2.in' })
					.to(holdEl, { autoAlpha: 0, scale: 0.85, duration: 0.5, ease: 'power2.out' }, '<')
					.set(outroEl, { opacity: 1 })
					.fromTo(
						outroChildren,
						{ y: 24, autoAlpha: 0 },
						{ y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.15, ease: 'power2.out' },
						'-=0.25'
					);
			});
		}

		/**
		 * @param {number} _time
		 * @param {number} deltaTime
		 */
		function tick(_time, deltaTime) {
			if (hasCompleted) return;
			if (!isPressed && holdProgress <= 0) return;

			const dt = deltaTime / 1000;
			holdProgress = isPressed
				? Math.min(1, holdProgress + dt / FILL_SECONDS)
				: Math.max(0, holdProgress - dt / DECAY_SECONDS);

			renderHold();
			if (holdProgress >= 1) complete();
		}

		function onPointerDown() {
			if (hasCompleted) return;
			isPressed = true;
		}

		function onPointerUp() {
			isPressed = false;
		}

		holdTargetEl.addEventListener('pointerdown', onPointerDown);
		window.addEventListener('pointerup', onPointerUp);
		window.addEventListener('pointercancel', onPointerUp);
		gsap.ticker.add(tick);

		// ─── Trigger ──────────────────────────────────────────────────────────

		/** @type {ScrollTrigger | undefined} */
		let scrubTrigger;

		ctx.add(() => {
			scrubTrigger = ScrollTrigger.create({
				trigger: textBlockEl,
				start: 'top top',
				end: 'bottom bottom',
				scrub: true,
				invalidateOnRefresh: true,
				onUpdate: (self) => applyReveal(self.progress)
			});

			// Commento solo il PERCHÉ: callback direzionali (non onToggle) come in gameDownLock.js,
			// per evitare che il jitter sub-pixel sul confine generi cicli unlock→lock→scrollTo.
			// Lo start spostato di 2px tiene il target dello scrollTo dentro il range attivo.
			let snapPosition = 0;
			ScrollTrigger.create({
				// Il trigger è il wrapper del pin (in flusso): il blocco sticky al suo interno
				// si muove e darebbe confini instabili
				trigger: holdPinEl,
				start: 'top top+=2',
				end: 'bottom top',
				onEnter: (self) => {
					snapPosition = self.start + 2;
					setDownLock(true, snapPosition);
				},
				onEnterBack: (self) => {
					snapPosition = self.start + 2;
					setDownLock(true, snapPosition);
				},
				onLeaveBack: () => setDownLock(false),
				// Commento solo il PERCHÉ: preventDefault non ferma un fling già partito (a dito
				// sollevato non arrivano più touchmove da bloccare), quindi rientrando con inerzia
				// il confine veniva superato. Finché il lock è attivo, ogni frame oltre il confine
				// viene riagganciato: il fling muore contro il muro invece di attraversarlo.
				// Il ramo !downLocked è il failsafe per gli ingressi che sfuggono ai callback
				// direzionali (es. secondo tentativo dopo una risalita): dentro il range senza
				// lock e senza completamento = stato illegale, si ri-aggancia subito.
				onUpdate: (self) => {
					if (hasCompleted) return;
					if (!downLocked && self.isActive) {
						snapPosition = self.start + 2;
						setDownLock(true, snapPosition);
					} else if (downLocked && self.scroll() > snapPosition + 1) {
						getLenis()?.scrollTo(snapPosition, { immediate: true, force: true });
					}
				}
			});
		});

		// Stato iniziale coerente anche se il mount avviene a scroll già avvenuto o dopo un
		// resize desktop↔mobile successivo al completamento
		applyReveal(scrubTrigger ? scrubTrigger.progress : 0);
		if (hasCompleted) {
			ctx.add(() => {
				gsap.set(holdEl, { autoAlpha: 0 });
				gsap.set(outroEl, { opacity: 1 });
			});
		}

		return () => {
			holdTargetEl.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('pointerup', onPointerUp);
			window.removeEventListener('pointercancel', onPointerUp);
			gsap.ticker.remove(tick);
			setDownLock(false);
			ctx.revert();
		};
	});

	return {
		destroy() {
			mm.revert();
		}
	};
}
