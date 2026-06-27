/**
 * Singleton dello smooth-scroll Lenis condiviso tra actions e componenti non correlati.
 * Espone le helper di lock/unlock e scrollTo così che intro, quiz, navbar ecc. non
 * tocchino mai direttamente l'istanza creata dal layout.
 */

/** @type {import('lenis').default | null} */
let lenis = null;

/** @param {import('lenis').default} instance */
export function setLenis(instance) {
	lenis = instance;
}

export function getLenis() {
	return lenis;
}

export function lockScroll() {
	lenis?.stop();
}

export function unlockScroll() {
	lenis?.start();
}

/**
 * @param {number | string | HTMLElement} target
 * @param {Record<string, any>} [options]
 */
export function scrollTo(target, options = {}) {
	lenis?.scrollTo(target, options);
}

// ─── Lock direzionale "solo verso il basso" ──────────────────────────────────
// Commento solo il PERCHÉ: con syncTouch:false e lo smooth-wheel di Lenis, un preventDefault normale non
// ferma lo scroll virtuale. Lenis però ascolta wheel/touch in fase BUBBLE: intercettando gli stessi eventi
// in fase CAPTURE e fermandone propagazione+default solo quando il gesto è verso il basso, blocchiamo la
// discesa (per wheel, touch e tastiera) lasciando libera la risalita. Usato dai giochini archetipi.

let downLockActive = false;
let downTouchStartY = 0;
/**
 * Callback opzionale invocata quando un gesto verso il basso viene bloccato (es. l'intro la usa per
 * far partire l'animazione di uscita). I giochini non la passano: il blocco resta puro.
 * @type {(() => void) | null}
 */
let downIntentCb = null;

/** @param {WheelEvent} e */
function onWheelCapture(e) {
	if (e.ctrlKey) return; // pinch-zoom su trackpad
	if (e.deltaY > 0) {
		e.preventDefault();
		e.stopPropagation();
		downIntentCb?.();
	}
}

/** @param {TouchEvent} e */
function onTouchStartCapture(e) {
	if (e.touches.length > 0) downTouchStartY = e.touches[0].clientY;
}

/** @param {TouchEvent} e */
function onTouchMoveCapture(e) {
	if (e.touches.length > 1) return; // pinch multitouch
	if (e.touches.length > 0) {
		// dito che sale (clientY diminuisce) ⇒ intento di scorrere verso il basso
		const diff = downTouchStartY - e.touches[0].clientY;
		if (diff > 0) {
			e.preventDefault();
			e.stopPropagation();
			downIntentCb?.();
		}
	}
}

/** @param {KeyboardEvent} e */
function onKeyDownCapture(e) {
	// Shift+Space scorre verso l'alto: va lasciato passare
	if (e.key === ' ' && e.shiftKey) return;
	const blockKeys = ['ArrowDown', 'PageDown', 'End', ' '];
	if (blockKeys.includes(e.key)) {
		e.preventDefault();
		downIntentCb?.();
	}
}

/**
 * Blocca lo scroll verso il basso (wheel/touch/tastiera), lasciando libera la risalita.
 * @param {(() => void)} [onDownIntent] - invocata a ogni gesto-giù bloccato
 */
export function lockScrollDown(onDownIntent) {
	downIntentCb = onDownIntent ?? null;
	if (downLockActive) return;
	downLockActive = true;
	window.addEventListener('wheel', onWheelCapture, { passive: false, capture: true });
	window.addEventListener('touchstart', onTouchStartCapture, { passive: true, capture: true });
	window.addEventListener('touchmove', onTouchMoveCapture, { passive: false, capture: true });
	window.addEventListener('keydown', onKeyDownCapture, { passive: false, capture: true });
}

export function unlockScrollDown() {
	downIntentCb = null;
	if (!downLockActive) return;
	downLockActive = false;
	window.removeEventListener('wheel', onWheelCapture, { capture: true });
	window.removeEventListener('touchstart', onTouchStartCapture, { capture: true });
	window.removeEventListener('touchmove', onTouchMoveCapture, { capture: true });
	window.removeEventListener('keydown', onKeyDownCapture, { capture: true });
}
