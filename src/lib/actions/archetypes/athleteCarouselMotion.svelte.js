import { gsap } from 'gsap';

/* Sincronizzato con l'intervallo di 3.5s di TeamCarousel per coerenza visiva globale */
const AUTOPLAY_INTERVAL = 3500; // ms
const DRAG_RESISTANCE = 1.0; // smorzamento: rimosso per un feedback 1-a-1 più pronto
const PIXELS_PER_INDEX = 180; // ridotto per far muovere più card a parità di movimento del mouse
const MAX_CARDS_PER_DRAG = 4.5; // limita lo span di un singolo gesto di drag
const MAX_INERTIA_SPEED = 0.35; // clamp per evitare swipe troppo veloci

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
			onRepeat: () => this.next()
		});

		// Interpola displayedIndex verso targetIndex applicando drag, inerzia e snap finale.
		this.#tickHandler = () => {
			const len = this.#getLen();

			if (this.isDragging) {
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

	pauseAutoplay() {
		this.#autoplayTween?.pause();
	}

	resumeAutoplay() {
		this.#autoplayTween?.play();
	}

	restartAutoplay() {
		this.#autoplayTween?.restart();
	}

	/** @param {number} target */
	navigateTo(target) {
		this.#autoplayTween?.pause();

		const len = this.#getLen();
		if (len === 0) return;

		// Commento solo il PERCHÉ: allineiamo gli indici sul percorso circolare più breve per evitare rotazioni inverse complete
		let diff = target - this.displayedIndex;
		const halfLen = len / 2;
		if (diff > halfLen) {
			this.displayedIndex += len;
		} else if (diff < -halfLen) {
			this.displayedIndex -= len;
		}

		this.#navigationTween?.kill();

		const proxy = { val: this.displayedIndex };
		this.#navigationTween = gsap.to(proxy, {
			val: target,
			duration: 0.6,
			ease: 'power2.out',
			onUpdate: () => {
				this.displayedIndex = proxy.val;
			},
			onComplete: () => {
				this.displayedIndex = wrapIndex(this.displayedIndex, len);
				this.targetIndex = this.displayedIndex;
				this.#navigationTween = null;
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
		this.#dragStartTarget = this.targetIndex;
		this.#dragVelocity = 0;
		this.#lastDragIndex = this.targetIndex;
		this.#lastDragTime = performance.now();
		this.inertiaVelocity = 0;
		this.#autoplayTween?.pause();
	}

	/** @param {number} clientX */
	drag(clientX) {
		if (!this.isDragging) return;
		const deltaX = (clientX - this.#dragStartX) * DRAG_RESISTANCE;
		let newTarget = this.#dragStartTarget - deltaX / PIXELS_PER_INDEX;

		const offset = newTarget - this.#dragStartTarget;
		if (Math.abs(offset) > MAX_CARDS_PER_DRAG) {
			newTarget = this.#dragStartTarget + Math.sign(offset) * MAX_CARDS_PER_DRAG;
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
