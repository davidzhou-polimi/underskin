import { ScrollTrigger } from '$lib/utils/gsapSetup.js';

/**
 * Azione Svelte per "fissare" (pin) una sezione nel viewport per un tratto di scroll, poi rilasciarla.
 * Nessuna interazione richiesta: è il pin puro che dà alla sezione un momento di permanenza (dwell).
 * Vale su tutti i viewport: anche su mobile la sosta è voluta (es. carosello team in /about).
 *
 * @param {HTMLElement} node - La sezione da pinnare
 * @param {{ end?: string }} [params] - `end` controlla la durata del dwell (default ~1 schermata)
 */
export function sectionPin(node, params = {}) {
	const trigger = ScrollTrigger.create({
		trigger: node,
		start: 'top top',
		end: params.end || '+=100%',
		pin: true,
		pinSpacing: true
	});

	return {
		// kill elimina pin, spacer e marker iniettati nel DOM
		destroy() {
			trigger.kill();
		}
	};
}
