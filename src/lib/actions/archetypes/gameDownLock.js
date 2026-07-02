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

	const trigger = ScrollTrigger.create({
		trigger: node,
		start: 'top top',
		end: 'bottom top',
		onToggle: (self) => setDownLock(self.isActive)
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
