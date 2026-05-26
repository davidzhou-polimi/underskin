import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { scroll } from '$lib/stores/scroll.svelte.js';

// Registrazione di ScrollTrigger, necessaria per i plugin GSAP in framework frontend
if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/**
 * Azione Svelte per tracciare quando una sezione entra nello schermo.
 * Aggiorna lo store globale `scroll.activeSection`.
 * @param {HTMLElement} node L'elemento del DOM a cui è applicata l'azione
 * @param {{ id?: string, trigger?: any }} [params] Opzioni aggiuntive dell'azione
 */
export function trackSection(node, params = {}) {
	const sectionId = params.id || node.id || 'unknown';

	// Creiamo un context GSAP per un cleanup sicuro (regola d'oro di AGENTS.md)
	const ctx = gsap.context(() => {
		ScrollTrigger.create({
			trigger: node,
			start: 'top 50%', // Si attiva quando il top della sezione raggiunge il 50% dello schermo
			end: 'bottom 50%',
			onEnter: () => {
				scroll.activeSection = sectionId;
				scroll.direction = 1;
			},
			onEnterBack: () => {
				scroll.activeSection = sectionId;
				scroll.direction = -1;
			},
			...params.trigger // Permette di sovrascrivere le impostazioni
		});
	}, node);

	return {
		destroy() {
			// Pulizia garantita: killa ScrollTrigger e animazioni interne al context
			ctx.revert();
		}
	};
}
