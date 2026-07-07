import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';
import { getLenis, lockScrollDown, unlockScrollDown } from '$lib/stores/lenis.svelte.js';

// Secondi di pressione continua per riempire il cerchio; il rilascio svuota più in fretta
// per dare la sensazione che lo "sforzo" vada mantenuto con costanza.
const FILL_SECONDS = 2;
const DECAY_SECONDS = 1.2;

/**
 * Azione Svelte per la variante mobile della sezione Burnout: scrollytelling verticale
 * (reveal di "È la performance.", uscita dei testi, ingresso del cerchio tratteggiato)
 * che culmina in un press-and-hold. Tenendo premuto, un cerchio pieno riempie quello
 * tratteggiato mentre la parola BURNOUT cresce tremolando sullo sfondo; a riempimento
 * completo la parola esplode e svanisce, entrano i testi finali e lo scroll si sblocca.
 *
 * Lo scroll verso il basso è bloccato sul fondo della sezione finché l'interazione non è
 * stata completata almeno una volta (stessa logica direzionale di gameDownLock.js, ma
 * agganciata al bordo di FINE sezione perché il giochino sta in fondo allo scrub).
 *
 * @param {HTMLElement} node - Il contenitore esterno della sezione (sticky interno)
 */
export function burnoutMobile(node) {
	// Persiste fuori dal branch matchMedia: un resize desktop↔mobile non deve far rigiocare l'attività
	let hasCompleted = false;

	const mm = gsap.matchMedia();

	mm.add('(max-width: 768px)', () => {
		const introEl = node.querySelector('.m-intro');
		const titleEl = node.querySelector('.m-title');
		const holdEl = node.querySelector('.m-hold');
		const fillEl = node.querySelector('.m-hold-fill');
		const wordEl = node.querySelector('.m-burnout-word');
		const outroEl = node.querySelector('.m-outro');

		if (!introEl || !titleEl || !holdEl || !fillEl || !wordEl || !outroEl) return;

		const outroChildren = outroEl.children;

		const ctx = gsap.context(() => {}, node);

		/** @param {number} v */
		const clamp01 = (v) => Math.max(0, Math.min(1, v));

		// ─── Fasi guidate dallo scroll ────────────────────────────────────────

		// Ultimo valore della fase di ingresso del cerchio: la pressione è valida solo a scena pronta
		let holdStageReady = 0;

		/** @param {number} progress */
		function apply(progress) {
			// Bande: reveal 0→0.3, plateau di lettura 0.3→0.5, poi scorrimento sequenziale 0.5→0.9.
			// Testi e giochino sono due schermate distinte: niente cross-fade, l'intro scorre via
			// verso l'alto mentre il cerchio entra da sotto, come un normale scroll tra sezioni impilate.
			const reveal = clamp01(progress / 0.3);
			const swap = clamp01((progress - 0.5) / 0.4);
			holdStageReady = swap;

			// "È la performance." emerge sotto il sottotitolo già visibile
			gsap.set(titleEl, {
				opacity: reveal,
				y: (1 - reveal) * 30,
				filter: `blur(${(1 - reveal) * 8}px)`
			});

			gsap.set(introEl, { yPercent: -swap * 100 });

			// Una volta completato il giochino non torna più.
			// autoAlpha (e non opacity): a cerchio invisibile il bersaglio touch-action:none deve
			// anche sparire dal hit-testing per non bloccare i gesti di scroll delle fasi di testo.
			gsap.set(holdEl, {
				autoAlpha: hasCompleted || swap === 0 ? 0 : 1,
				yPercent: (1 - swap) * 100
			});

			// Dopo il completamento i testi finali prendono il posto del cerchio nella seconda
			// schermata, così risalendo si torna ai testi introduttivi senza sovrapposizioni
			if (hasCompleted) {
				gsap.set(outroEl, {
					autoAlpha: swap === 0 ? 0 : 1,
					yPercent: (1 - swap) * 100
				});
			}
		}

		// ─── Lock direzionale sul fondo della sezione ─────────────────────────

		let downLocked = false;

		/**
		 * @param {boolean} active
		 * @param {number} [snapPosition] - posizione scroll del confine di fine sezione
		 */
		function setDownLock(active, snapPosition) {
			if (active && !hasCompleted) {
				if (!downLocked) {
					downLocked = true;
					lockScrollDown();
					// Incolla la sezione al fondo, uccidendo l'eventuale overshoot di inerzia di Lenis
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
			// La pressione conta solo quando il cerchio è pienamente in scena
			if (hasCompleted || holdStageReady < 0.9) return;
			isPressed = true;
		}

		function onPointerUp() {
			isPressed = false;
		}

		holdEl.addEventListener('pointerdown', onPointerDown);
		window.addEventListener('pointerup', onPointerUp);
		window.addEventListener('pointercancel', onPointerUp);
		gsap.ticker.add(tick);

		// ─── Trigger ──────────────────────────────────────────────────────────

		/** @type {ScrollTrigger | undefined} */
		let scrubTrigger;

		ctx.add(() => {
			scrubTrigger = ScrollTrigger.create({
				trigger: node,
				start: 'top top',
				end: 'bottom bottom',
				scrub: true,
				invalidateOnRefresh: true,
				onUpdate: (self) => apply(self.progress)
			});

			// Commento solo il PERCHÉ: callback direzionali (non onToggle) come in gameDownLock.js,
			// per evitare che il jitter sub-pixel sul confine generi cicli unlock→lock→scrollTo.
			// Lo start anticipato di 2px tiene il target dello scrollTo dentro il range attivo.
			let snapPosition = 0;
			ScrollTrigger.create({
				trigger: node,
				start: 'bottom bottom+=2',
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
				onUpdate: (self) => {
					if (downLocked && self.scroll() > snapPosition + 1) {
						getLenis()?.scrollTo(snapPosition, { immediate: true, force: true });
					}
				}
			});
		});

		// Stato iniziale coerente anche se il mount avviene a scroll già avvenuto (refresh/navigazione)
		apply(scrubTrigger ? scrubTrigger.progress : 0);

		return () => {
			holdEl.removeEventListener('pointerdown', onPointerDown);
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
