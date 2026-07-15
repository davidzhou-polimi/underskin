/**
 * Gate direzionale "scendi solo dopo aver completato": generalizzazione di
 * gameDownLock.js sul ScrollLockManager. Finché l'attività non è stata completata
 * almeno una volta, lo scroll verso il basso è bloccato quando la sezione è in cima
 * alla viewport; la risalita resta sempre libera.
 * La geometria del trigger è portata VERBATIM dall'originale: è il design anti-shake
 * collaudato, non toccarla senza ripetere il regression test su touch reale.
 */

import { ScrollTrigger } from '$lib/utils/gsapSetup.js';
import { scrollLock } from '$lib/stores/scrollLock.svelte.js';

/**
 * @param {HTMLElement} node - la sezione gated
 * @param {{ id: string, initialCompleted?: boolean }} opts
 * @returns {{ setCompleted: (completed: boolean) => void, destroy: () => void }}
 */
export function createDownLockGate(node, { id, initialCompleted = false }) {
	let hasCompletedOnce = initialCompleted;
	let engaged = false;

	/** @param {boolean} active */
	function setDownLock(active) {
		if (active && !hasCompletedOnce) {
			if (!engaged) {
				// anchor: incolla la sezione al top uccidendo l'overshoot di inerzia di Lenis —
				// un solo scrollTo, all'acquire (mai su eventi successivi).
				engaged = scrollLock.acquire(id, { mode: 'down', anchor: node });
			}
		} else if (engaged) {
			engaged = false;
			scrollLock.release(id);
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
