import { ScrollTrigger } from '$lib/utils/gsapSetup.js';
import { getLenis, lockScrollDown, unlockScrollDown } from '$lib/stores/lenis.svelte.js';

/**
 * Blocco direzionale condiviso dai giochini archetipo (pensieri intrusivi, perfection game):
 * finché l'attività non è stata completata almeno una volta, lo scroll verso il basso è
 * bloccato quando la sezione è in cima alla viewport; la risalita resta sempre libera.
 * Centralizza la logica prima duplicata tra thoughtsIntro.js e perfectionIntro.js.
 *
 * @param {HTMLElement} node - La sezione del giochino
 * @param {boolean} [initialCompleted] - Se l'utente ha già completato l'attività
 */
export function createGameDownLock(node, initialCompleted = false) {
	let hasCompletedOnce = initialCompleted;
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

	// Commento solo il PERCHÉ: usiamo callback DIREZIONALI invece di onToggle(isActive).
	// setDownLock esegue uno scrollTo immediato sul bordo 'start' dello stesso trigger che
	// governa il lock: con onToggle il jitter sub-pixel su quel confine faceva oscillare isActive
	// (true→false→true) generando un ciclo unlock→lock→scrollTo = schermo che trema. Ingaggiando
	// solo su ingresso (enter/enterBack) e rilasciando solo su risalita genuina (leaveBack) o a
	// completamento, una disattivazione spuria non ricrea più il ciclo e lo scrollTo parte una volta sola.
	// Lo start spostato di 2px tiene il target dello scrollTo dentro il range attivo, evitando il micro-jitter di confine.
	const trigger = ScrollTrigger.create({
		trigger: node,
		start: 'top top+=2',
		end: 'bottom top',
		onEnter: () => setDownLock(true),
		onEnterBack: () => setDownLock(true),
		onLeaveBack: () => setDownLock(false)
	});

	return {
		/**
		 * Da chiamare nell'update dell'action: completata l'attività, rilascia subito il blocco.
		 * @param {boolean} completed
		 */
		setCompleted(completed) {
			hasCompletedOnce = completed;
			if (completed) setDownLock(false);
		},
		/** Da chiamare nel destroy dell'action, prima del revert del contesto GSAP. */
		destroy() {
			setDownLock(false);
			trigger.kill();
		}
	};
}
