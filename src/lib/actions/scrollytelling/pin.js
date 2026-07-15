/**
 * createPin: l'UNICO punto del sito in cui si creano pin ScrollTrigger
 * (esente per progetto: shatterGlass.js, che usa CSS sticky per aggirare i
 * ricalcoli del pin-spacer su mobile). Va invocato dentro un callback di
 * gsap.matchMedia() così il trigger viene auto-registrato e ripulito da mm.revert().
 */

import { ScrollTrigger } from '$lib/utils/gsapSetup.js';
import { PIN_LENGTH, SCRUB } from '$lib/actions/scrollytelling/presets.js';

/**
 * @param {HTMLElement} node - la sezione da pinnare
 * @param {{
 *   length?: keyof typeof PIN_LENGTH | string,  // nome preset o override esplicito '+=NNN%'
 *   scrub?: false | 'auto' | number,            // 'auto' → SCRUB per breakpoint corrente
 *   spacing?: boolean,
 *   anticipate?: boolean,
 *   id?: string,
 *   snap?: object,                              // config da buildSnap/buildAsymmetricSnap
 *   animation?: gsap.core.Timeline,             // timeline scrubbata già popolata dalle ricette
 *   isMobile?: boolean,
 *   onUpdate?: (self: ScrollTrigger) => void,   // pass-through (es. notifiche di attraversamento label)
 *   onLeaveBack?: (self: ScrollTrigger) => void // pass-through (es. rilascio di un gate in risalita)
 * }} [opts]
 * @returns {ScrollTrigger}
 */
export function createPin(node, opts = {}) {
	const {
		length = 'short',
		scrub = false,
		spacing = true,
		anticipate = true,
		id,
		snap,
		animation,
		isMobile = false,
		onUpdate,
		onLeaveBack
	} = opts;

	const resolvedScrub = scrub === 'auto' ? (isMobile ? SCRUB.mobile : SCRUB.desktop) : scrub;

	return ScrollTrigger.create({
		trigger: node,
		start: 'top top',
		end: PIN_LENGTH[/** @type {keyof typeof PIN_LENGTH} */ (length)] ?? length,
		pin: true,
		pinSpacing: spacing,
		anticipatePin: anticipate ? 1 : 0,
		// Sempre attivo: dopo la navigazione client le misure del mount sono stantie
		// e vanno rifatte al refresh globale (lezione di performanceReveal/scrollableTextSwap).
		invalidateOnRefresh: true,
		...(id ? { id } : {}),
		...(resolvedScrub !== false ? { scrub: resolvedScrub } : {}),
		...(snap ? { snap } : {}),
		...(animation ? { animation } : {}),
		...(onUpdate ? { onUpdate } : {}),
		...(onLeaveBack ? { onLeaveBack } : {})
	});
}
