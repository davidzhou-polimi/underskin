import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';

/**
 * Azione Svelte per gestire il pinning dello schermo nella sezione Preface.
 * Isola l'istanza e garantisce la distruzione del trigger al cambio rotta.
 * @param {HTMLElement} node - Il nodo della sezione da bloccare
 * @param {{ end?: string }} [params] - Parametri opzionali di configurazione
 */
export function prefacePin(node, params = {}) {
	// Il context assicura che qualsiasi trigger o istanza creata venga registrata internamente
	const ctx = gsap.context(() => {
		ScrollTrigger.create({
			trigger: node,
			start: 'top top',
			end: params.end || '+=300%',
			pin: true,
			pinSpacing: true
		});
	}, node);

	return {
		// Revert elimina in automatico sia il pinning che i marker/stili iniettati nel DOM
		destroy() {
			ctx.revert();
		}
	};
}
