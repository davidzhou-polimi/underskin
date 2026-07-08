import { gsap } from '$lib/utils/gsapSetup.js';
import { media } from '$lib/stores/mediaQuery.svelte.js';

/* Sincronizzato con l'intervallo di 3.5s di TeamCarousel per coerenza visiva globale */
const AUTOPLAY_INTERVAL = 3500; // ms
const DRAG_RESISTANCE = 1.0; // smorzamento: rimosso per un feedback 1-a-1 più pronto
const PIXELS_PER_INDEX = 180; // ridotto per far muovere più card a parità di movimento del mouse
const MAX_CARDS_PER_DRAG = 4.5; // limita lo span di un singolo gesto di drag
const MAX_INERTIA_SPEED = 0.35; // clamp per evitare swipe troppo veloci

/* Modalità deck (mobile): uno swipe = una card, senza inerzia. La corsa completa del gesto
   equivale a una card intera; sotto la soglia di commit la card torna al suo posto. */
const DECK_SWIPE_SPAN = 220; // px di corsa del dito per una card intera
const DECK_COMMIT_PROGRESS = 0.3; // frazione di corsa oltre cui il rilascio committa la card
const DECK_COMMIT_FLICK = 0.045; // velocità (indici/frame) oltre cui anche un gesto corto committa

/**
 * Helper per gestire correttamente il modulo negativo
 * @param {number} val
 * @param {number} max
 */
function wrapIndex(val, max) {
	return ((val % max) + max) % max;
}

/**
 * Controller del carosello atleti: possiede tutto il GSAP (autoplay, loop di interpolazione su
 * `gsap.ticker`, tween di navigazione, inerzia del drag), tenuto fuori dal componente come da AGENTS.md.
 * Espone lo stato di movimento come runes `$state`, così il componente vi reagisce nel template;
 * il componente conserva invece lo stato di UI (hover, flip, tooltip) e chiama i metodi qui sotto.
 */
export class AthleteCarouselMotion {
	displayedIndex = $state(0);
	targetIndex = $state(0);
	isDragging = $state(false);
	inertiaVelocity = $state(0);
	autoplayProgress = $state(0);
	autoplayDisabled = $state(false);
	/** Lato d'uscita della card sfogliata (deck mobile): 1 = sinistra (default), -1 = destra. */
	exitDir = $state(/** @type {1 | -1} */ (1));

	/** @type {() => number} */
	#getLen;
	/** @type {gsap.core.Tween | null} */
	#autoplayTween = null;
	/** @type {gsap.core.Tween | null} */
	#navigationTween = null;
	/** @type {(() => void) | null} */
	#tickHandler = null;

	#dragVelocity = 0;
	#lastDragTime = 0;
	#lastDragIndex = 0;
	#dragStartX = 0;
	#dragStartTarget = 0;

	/** @param {() => number} getLen - ritorna il numero di atleti attualmente filtrati */
	constructor(getLen) {
		this.#getLen = getLen;
	}

	/**
	 * Avvia autoplay e il loop di interpolazione su gsap.ticker.
	 * @returns {() => void} funzione di cleanup (da restituire in onMount)
	 */
	start() {
		// GSAP sospende i tween basati su rAF quando la tab va in background,
		// riprendendo esattamente dal punto di pausa al ritorno — nessun tick accumulato.
		this.#autoplayTween = gsap.to({}, {
			duration: AUTOPLAY_INTERVAL / 1000,
			repeat: -1,
			ease: 'none',
			onUpdate: () => {
				if (this.#autoplayTween) {
					this.autoplayProgress = this.#autoplayTween.progress();
				}
			},
			onRepeat: () => this.next()
		});

		// Interpola displayedIndex verso targetIndex applicando drag, inerzia e snap finale.
		this.#tickHandler = () => {
			const len = this.#getLen();

			if (this.isDragging) {
				// Deck (mobile): tracking 1:1 del dito, NIENTE lerp. Col lerp, all'inversione di lato
				// exitDir flippa istantaneo mentre il progress residuo decade piano: la x della card
				// (funzione di entrambi) salterebbe di segno — lo "snap al centro" a metà gesto.
				// Seguendo il dito, progress ed exitDir passano per lo 0 nello stesso frame.
				if (media.isMobile) {
					this.displayedIndex = this.targetIndex;
					return;
				}
				// Stato 1: drag attivo. displayedIndex segue targetIndex (mouse) in modo reattivo
				let diff = this.targetIndex - this.displayedIndex;
				if (len > 0) {
					const halfLen = len / 2;
					if (diff > halfLen) {
						this.displayedIndex += len;
						diff -= len;
					} else if (diff < -halfLen) {
						this.displayedIndex -= len;
						diff += len;
					}
				}
				this.displayedIndex += diff * 0.35;
			} else if (Math.abs(this.inertiaVelocity) > 0.005) {
				// Stato 2: coasting per inerzia con attrito/decadimento
				this.displayedIndex += this.inertiaVelocity;
				this.inertiaVelocity *= 0.65;
				if (len > 0) this.displayedIndex = wrapIndex(this.displayedIndex, len);
				// Sincronizziamo targetIndex per evitare salti a fine slide
				this.targetIndex = this.displayedIndex;
			} else if (this.inertiaVelocity !== 0) {
				// Stato 3: assestamento. Aggancia alla card più vicina con la transizione GSAP
				this.inertiaVelocity = 0;
				this.navigateTo(wrapIndex(Math.round(this.displayedIndex), len));
			}
		};
		gsap.ticker.add(this.#tickHandler);

		return () => this.destroy();
	}

	destroy() {
		this.#autoplayTween?.kill();
		if (this.#tickHandler) gsap.ticker.remove(this.#tickHandler);
		this.#navigationTween?.kill();
	}

	disableAutoplay() {
		this.autoplayDisabled = true;
		this.#autoplayTween?.kill();
		this.#autoplayTween = null;
		this.autoplayProgress = 0;
	}

	pauseAutoplay() {
		this.#autoplayTween?.pause();
	}

	resumeAutoplay() {
		if (this.autoplayDisabled) return;
		this.#autoplayTween?.play();
	}

	restartAutoplay() {
		if (this.autoplayDisabled) return;
		this.#autoplayTween?.restart();
	}

	/**
	 * @param {number} target
	 * @param {{ forwardOnly?: boolean, exitDir?: 1 | -1 }} [opts] - forwardOnly: avanza sempre lungo
	 *   il loop (deck mobile, dai dot); exitDir: lato d'uscita imposto per questa navigazione.
	 */
	navigateTo(target, opts = {}) {
		this.#autoplayTween?.pause();

		const len = this.#getLen();
		if (len === 0) return;

		let duration = 0.6;
		let ease = 'power2.out';

		if (opts.forwardOnly) {
			// Deck (dot mobile): mai card che rientrano dal lato opposto — il target "dietro"
			// si raggiunge continuando a sfogliare in avanti lungo il loop.
			this.displayedIndex = wrapIndex(this.displayedIndex, len);
			const base = Math.round(this.displayedIndex);
			const forward = wrapIndex(target - wrapIndex(base, len), len);
			if (forward === 0) return;
			target = base + forward;
			// Sfogliata leggibile, non raffica: la durata cresce con le card da attraversare
			// (0.6s fissi scaricavano 4-5 card in un burst) e l'inOut distribuisce il movimento
			// lungo tutta la corsa invece di concentrarlo nei primi frame.
			if (forward > 1) {
				duration = Math.min(0.6 + 0.35 * (forward - 1), 2);
				ease = 'power1.inOut';
			}
		} else {
			// Commento solo il PERCHÉ: allineiamo gli indici sul percorso circolare più breve per evitare rotazioni inverse complete
			let diff = target - this.displayedIndex;
			const halfLen = len / 2;
			if (diff > halfLen) {
				this.displayedIndex += len;
			} else if (diff < -halfLen) {
				this.displayedIndex -= len;
			}
		}
		if (opts.exitDir) this.exitDir = opts.exitDir;

		this.#navigationTween?.kill();

		const proxy = { val: this.displayedIndex };
		this.#navigationTween = gsap.to(proxy, {
			val: target,
			duration,
			ease,
			onUpdate: () => {
				this.displayedIndex = proxy.val;
			},
			onComplete: () => {
				this.displayedIndex = wrapIndex(this.displayedIndex, len);
				this.targetIndex = this.displayedIndex;
				this.#navigationTween = null;
				// A movimento assestato la card sfogliata è già fuori (opacità 0): si torna al
				// lato d'uscita di default senza flip visibili.
				this.exitDir = 1;
			}
		});
	}

	next() {
		this.navigateTo(wrapIndex(this.targetIndex + 1, this.#getLen()));
	}

	prev() {
		this.navigateTo(wrapIndex(this.targetIndex - 1, this.#getLen()));
	}

	/** @param {number} index */
	selectIndex(index) {
		this.navigateTo(index);
	}

	/** @param {number} clientX */
	startDrag(clientX) {
		this.isDragging = true;
		this.#navigationTween?.kill();
		this.#navigationTween = null;
		this.#dragStartX = clientX;
		// Deck (mobile): l'ancora è la card visivamente in cima — una presa a metà commit riparte
		// da lì; targetIndex durante il tween di navigazione è ancora il valore stale pre-commit.
		this.#dragStartTarget = media.isMobile ? Math.round(this.displayedIndex) : this.targetIndex;
		if (media.isMobile) this.targetIndex = this.#dragStartTarget;
		this.#dragVelocity = 0;
		this.#lastDragIndex = this.targetIndex;
		this.#lastDragTime = performance.now();
		this.inertiaVelocity = 0;
		this.#autoplayTween?.pause();
	}

	/** @param {number} clientX */
	drag(clientX) {
		if (!this.isDragging) return;
		const rawDeltaX = clientX - this.#dragStartX;

		let newTarget;
		if (media.isMobile) {
			// Deck: entrambe le direzioni AVANZANO (al massimo di una card); il lato d'uscita
			// segue il dito. A progress 0 la card è centrata, quindi il flip di lato è invisibile.
			if (rawDeltaX !== 0) this.exitDir = rawDeltaX < 0 ? 1 : -1;
			const progress = Math.min(1, Math.abs(rawDeltaX) / DECK_SWIPE_SPAN);
			newTarget = this.#dragStartTarget + progress;
		} else {
			const deltaX = rawDeltaX * DRAG_RESISTANCE;
			newTarget = this.#dragStartTarget - deltaX / PIXELS_PER_INDEX;
			const offset = newTarget - this.#dragStartTarget;
			if (Math.abs(offset) > MAX_CARDS_PER_DRAG) {
				newTarget = this.#dragStartTarget + Math.sign(offset) * MAX_CARDS_PER_DRAG;
			}
		}

		const now = performance.now();
		const dt = now - this.#lastDragTime;
		if (dt > 0) {
			const instantV = (newTarget - this.#lastDragIndex) / dt; // indici per ms
			this.#dragVelocity = this.#dragVelocity * 0.4 + instantV * 0.6; // media mobile smussata
		}

		this.targetIndex = newTarget;
		this.#lastDragIndex = newTarget;
		this.#lastDragTime = now;
	}

	/** Termina il drag: converte la velocità in inerzia o aggancia subito la card più vicina. */
	endDrag() {
		if (!this.isDragging) return;
		this.isDragging = false;

		if (media.isMobile) {
			// Deck: NIENTE inerzia — il rilascio committa al più UNA card (per corsa o per flick,
			// purché il gesto stesse davvero avanzando), altrimenti la card torna al suo posto.
			const progress = this.targetIndex - this.#dragStartTarget;
			const flickV = this.#dragVelocity * 16.67;
			const commit = progress >= DECK_COMMIT_PROGRESS || (flickV > DECK_COMMIT_FLICK && progress > 0.05);
			this.inertiaVelocity = 0;
			this.navigateTo(wrapIndex(this.#dragStartTarget + (commit ? 1 : 0), this.#getLen()));
			return;
		}

		// Da indici/ms a indici/frame (assumendo 60fps -> 16.67ms per frame)
		let velocityPerFrame = this.#dragVelocity * 16.67;

		if (Math.abs(velocityPerFrame) > MAX_INERTIA_SPEED) {
			velocityPerFrame = Math.sign(velocityPerFrame) * MAX_INERTIA_SPEED;
		}
		this.inertiaVelocity = velocityPerFrame;

		// Commento solo il PERCHÉ: se la velocità di rilascio è sotto soglia, agganciamo subito la card più vicina con navigateTo
		if (Math.abs(this.inertiaVelocity) <= 0.005) {
			this.navigateTo(wrapIndex(Math.round(this.displayedIndex), this.#getLen()));
		}
	}
}
