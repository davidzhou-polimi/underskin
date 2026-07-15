/**
 * scrollSection: l'action dichiarativa della libreria di scrollytelling.
 * Una sezione dichiara COSA fa (pin, reveal, snap, lock) tramite descrittore e la
 * libreria lo esegue in modo identico ovunque; i valori vengono dai presets, gli
 * override puntuali restano possibili ma espliciti.
 *
 * Regola anti-over-abstraction: se una sezione avesse bisogno di un'opzione di
 * descrittore usata solo da lei, NON si aggiunge l'opzione — si usa `custom(ctx)`,
 * che riceve le stesse primitive (timeline, pin, presets, scrollLock, gate) così
 * anche il codice bespoke condivide meccanica e cleanup. I giochi sono custom per statuto.
 *
 * Contratto di cleanup: un solo gsap.matchMedia() per nodo; ogni primitiva vive dentro
 * mm.add() e viene auto-registrata; destroy() = mm.revert() (+ teardown non-GSAP
 * ritornati da custom, eseguiti dal cleanup del breakpoint).
 *
 * Convenzione id: il trigger desktop si chiama `${id}`, quello mobile `${id}Mobile` —
 * preserva i lookup cross-action esistenti (es. cinematicScroll legge 'archetypeScrollyMobile').
 *
 * @typedef {Object} PinConfig
 * @property {string} [length]                    nome preset (PIN_LENGTH) o override '+=NNN%'
 * @property {false | 'auto' | number} [scrub]    'auto' → SCRUB per breakpoint corrente
 * @property {boolean} [spacing]
 * @property {boolean} [anticipate]
 *
 * @typedef {Object} RevealConfig
 * @property {'fadeIn' | 'fadeInOut' | 'lineSwap' | 'lineStack'} preset
 * @property {string} target                      selettore relativo al nodo della sezione
 * @property {'short' | 'medium' | 'long'} [dwell]
 *
 * @typedef {Object} SectionDescriptor
 * @property {string} id                          OBBLIGATORIO, diventa l'id ScrollTrigger
 * @property {boolean | PinConfig} [pin]          true → { length: 'short' }
 * @property {RevealConfig} [reveal]              richiede pin.scrub
 * @property {boolean | { steps: number }} [snap] true = beat derivati dalla ricetta reveal
 * @property {{ mode: 'down', completed?: boolean }} [lock] delega a downLockGate;
 *                                                `completed` è reattivo via update dell'action
 * @property {false | Record<string, any>} [mobile] override deep-merge; false = solo desktop
 * @property {(ctx: any) => (void | (() => void))} [custom]
 *                                                ctx = { node, gsap, ScrollTrigger, mm, isMobile,
 *                                                tl, pinSt, presets, scrollLock, gate };
 *                                                può ritornare un teardown per risorse non-GSAP
 */

import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';
import * as presets from '$lib/actions/scrollytelling/presets.js';
import { BREAKPOINT } from '$lib/actions/scrollytelling/presets.js';
import { createPin } from '$lib/actions/scrollytelling/pin.js';
import { buildSnap } from '$lib/actions/scrollytelling/snap.js';
import { scheduleScrubResync } from '$lib/actions/scrollytelling/resync.js';
import { createDownLockGate } from '$lib/actions/scrollytelling/downLockGate.js';
import {
	buildFadeIn,
	buildFadeInOut,
	buildLineSwap,
	buildLineStack
} from '$lib/actions/scrollytelling/reveal.js';
import { scrollLock } from '$lib/stores/scrollLock.svelte.js';

const REVEAL_RECIPES = {
	fadeIn: buildFadeIn,
	fadeInOut: buildFadeInOut,
	lineSwap: buildLineSwap,
	lineStack: buildLineStack
};

/**
 * Merge ricorsivo dei soli plain object: tutto il resto (funzioni, nodi, array) si sostituisce.
 * @param {Record<string, any>} base
 * @param {Record<string, any>} override
 * @returns {Record<string, any>}
 */
function deepMerge(base, override) {
	const out = { ...base };
	for (const [key, value] of Object.entries(override)) {
		const prev = out[key];
		if (
			value && prev &&
			typeof value === 'object' && typeof prev === 'object' &&
			!Array.isArray(value) && !Array.isArray(prev) &&
			value.constructor === Object && prev.constructor === Object
		) {
			out[key] = deepMerge(prev, value);
		} else {
			out[key] = value;
		}
	}
	return out;
}

/**
 * @param {HTMLElement} node
 * @param {SectionDescriptor} descriptor
 */
export function scrollSection(node, descriptor = /** @type {SectionDescriptor} */ ({})) {
	if (!descriptor.id) {
		if (import.meta.env.DEV) {
			console.warn('[scrollSection] descrittore senza id obbligatorio: sezione ignorata.', node);
		}
		return {};
	}

	const mm = gsap.matchMedia();
	/** @type {{ setCompleted: (completed: boolean) => void, destroy: () => void } | null} */
	let gate = null;

	/**
	 * @param {SectionDescriptor} desc - descrittore già risolto per il breakpoint
	 * @param {boolean} isMobile
	 */
	function setup(desc, isMobile) {
		/** @type {Array<() => void>} */
		const cleanups = [];
		/** @type {gsap.core.Timeline | null} */
		let tl = null;
		/** @type {ScrollTrigger | null} */
		let pinSt = null;

		if (desc.pin) {
			const pinOpts = desc.pin === true ? {} : desc.pin;
			const wantsScrub = pinOpts.scrub !== undefined && pinOpts.scrub !== false;

			/** @type {number[]} */
			let snapPoints = [];
			if (wantsScrub) {
				tl = gsap.timeline();
				if (desc.reveal) {
					// Cast: le ricette hanno firme diverse (Element vs { lines }); il ramo sotto
					// instrada quella giusta in base al preset.
					const recipe = /** @type {any} */ (REVEAL_RECIPES[desc.reveal.preset]);
					if (recipe) {
						const opts = { dwell: desc.reveal.dwell };
						if (desc.reveal.preset === 'lineSwap' || desc.reveal.preset === 'lineStack') {
							const lines = node.querySelectorAll(desc.reveal.target);
							({ snapPoints } = recipe(tl, { lines }, opts));
						} else {
							const target = node.querySelector(desc.reveal.target);
							if (target) ({ snapPoints } = recipe(tl, target, opts));
						}
					} else if (import.meta.env.DEV) {
						console.warn(`[scrollSection:${desc.id}] preset reveal sconosciuto:`, desc.reveal.preset);
					}
				}
			} else if (desc.reveal && import.meta.env.DEV) {
				console.warn(`[scrollSection:${desc.id}] reveal richiede pin.scrub: ignorato.`);
			}

			let snapCfg;
			if (desc.snap) {
				if (desc.snap === true) {
					// Beat della ricetta (tempi di timeline) → progress normalizzato; fine del pin
					// sempre inclusa come punto di riposo, così un'eventuale coda di dwell non
					// crea rubber-banding verso l'ultimo beat.
					const total = tl?.duration() ?? 0;
					const points = total > 0 ? snapPoints.map((t) => t / total) : [];
					if (points.length && points[points.length - 1] < 1) points.push(1);
					snapCfg = buildSnap(points, isMobile);
				} else {
					snapCfg = buildSnap(desc.snap.steps, isMobile);
				}
			}

			pinSt = createPin(node, {
				...pinOpts,
				isMobile,
				id: isMobile ? `${desc.id}Mobile` : desc.id,
				snap: snapCfg,
				animation: tl ?? undefined
			});

			if (tl) cleanups.push(scheduleScrubResync(tl));
		}

		if (desc.lock) {
			gate = createDownLockGate(node, {
				id: desc.id,
				initialCompleted: !!desc.lock.completed
			});
			const currentGate = gate;
			cleanups.push(() => {
				currentGate.destroy();
				if (gate === currentGate) gate = null;
			});
		}

		if (desc.custom) {
			const teardown = desc.custom({
				node,
				gsap,
				ScrollTrigger,
				mm,
				isMobile,
				tl,
				pinSt,
				presets,
				scrollLock,
				gate
			});
			if (typeof teardown === 'function') cleanups.push(teardown);
		}

		return () => {
			for (const fn of cleanups) fn();
		};
	}

	mm.add(BREAKPOINT.desktop, () => setup(descriptor, false));

	if (descriptor.mobile !== false) {
		const mobileDesc = descriptor.mobile
			? /** @type {SectionDescriptor} */ (deepMerge(descriptor, descriptor.mobile))
			: descriptor;
		mm.add(BREAKPOINT.mobile, () => setup(mobileDesc, true));
	}

	return {
		/**
		 * L'unico parametro reattivo del descrittore è lock.completed (rilascio del gate).
		 * @param {SectionDescriptor} newDescriptor
		 */
		update(newDescriptor) {
			if (gate && newDescriptor?.lock) {
				gate.setCompleted(!!newDescriptor.lock.completed);
			}
		},
		destroy() {
			mm.revert();
			// Cintura di sicurezza: se un custom ha acquisito il lock con l'id di sezione
			// e non l'ha rilasciato nel suo teardown, la pagina non deve restare bloccata.
			scrollLock.release(descriptor.id);
		}
	};
}
