import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';

/**
 * Azione Svelte per "fissare" (pin) una sezione nel viewport per un tratto di scroll, poi rilasciarla.
 * Nessuna interazione richiesta: è il pin puro che dà alla sezione un momento di permanenza (dwell).
 *
 * @param {HTMLElement} node - La sezione da pinnare
 * @param {{ end?: string }} [params] - `end` controlla la durata del dwell (default ~1 schermata)
 */
export function sectionPin(node, params = {}) {
	const mm = gsap.matchMedia();

	// Desktop: pin della sezione per garantire il dwell time
	mm.add('(min-width: 769px)', () => {
		ScrollTrigger.create({
			trigger: node,
			start: 'top top',
			end: params.end || '+=100%',
			pin: true,
			pinSpacing: true
		});
	});

	// Mobile: nessun pin per consentire uno scorrimento fluido
	mm.add('(max-width: 768px)', () => {
		// Nessun pin su mobile
	});

	return {
		// revert elimina pin, spacer e marker iniettati nel DOM
		destroy() {
			mm.revert();
		}
	};
}
