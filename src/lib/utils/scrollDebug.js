/**
 * Strumentazione dev-only per la migrazione dello scrollytelling: trasforma gli
 * slittamenti di pin-spacer/cuciture in diff numerici confrontabili tra fasi,
 * invece di affidarsi all'ispezione visiva a memoria. Non importare in produzione.
 */

import { ScrollTrigger } from '$lib/utils/gsapSetup.js';

/**
 * Fotografa tutti gli ScrollTrigger attivi: da eseguire (via window.__scrollSnapshot()
 * in console) su ogni rotta e breakpoint PRIMA di una fase di migrazione e di nuovo
 * DOPO, poi diffare i JSON. Gate di fase: diff nullo sui trigger non migrati.
 * @returns {{ url: string, viewport: string, scrollHeight: number, triggers: object[] }}
 */
export function snapshotScrollTriggers() {
	const triggers = ScrollTrigger.getAll()
		.map((st) => ({
			id: st.vars.id ?? null,
			trigger: describeElement(st.trigger ?? null),
			start: Math.round(st.start),
			end: Math.round(st.end),
			pin: !!st.pin,
			pinSpacing: st.vars.pinSpacing ?? null,
			scrub: st.vars.scrub ?? false,
			snap: !!st.vars.snap
		}))
		.sort((a, b) => a.start - b.start);

	return {
		url: window.location.pathname,
		viewport: `${window.innerWidth}x${window.innerHeight}`,
		scrollHeight: document.documentElement.scrollHeight,
		triggers
	};
}

/** @param {Element | null} el */
function describeElement(el) {
	if (!el) return null;
	const id = el.id ? `#${el.id}` : '';
	const cls = el.classList?.length ? `.${[...el.classList].slice(0, 2).join('.')}` : '';
	return `${el.tagName.toLowerCase()}${id}${cls}`;
}
