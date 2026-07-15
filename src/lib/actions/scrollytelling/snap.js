/**
 * Costruttori della configurazione `snap` di ScrollTrigger: il passo varia per sezione,
 * ma timing/easing vengono sempre dalla ricetta SNAP dei presets (per breakpoint) — è
 * questo che rende lo snap "uguale ovunque" a prescindere da quanti beat abbia la timeline.
 */

import { SNAP } from '$lib/actions/scrollytelling/presets.js';

/**
 * @param {number | number[]} stepsOrPoints - numero di intervalli uniformi, oppure array
 *   di punti di progress [0..1] (i beat reali della ricetta, normalizzati da scrollSection)
 * @param {boolean} [isMobile] - seleziona la variante di ricetta del breakpoint
 * @returns {object | undefined} config snap per ScrollTrigger, o undefined se non snappabile
 */
export function buildSnap(stepsOrPoints, isMobile = false) {
	const recipe = isMobile ? SNAP.mobile : SNAP.desktop;
	if (Array.isArray(stepsOrPoints)) {
		if (stepsOrPoints.length < 2) return undefined;
		return { snapTo: stepsOrPoints, ...recipe };
	}
	if (!stepsOrPoints || stepsOrPoints < 1) return undefined;
	return { snapTo: 1 / stepsOrPoints, ...recipe };
}

/**
 * Variante per snap non uniformi guidati da funzione (es. zoomTextTransition desktop,
 * che aggancia punti asimmetrici): la funzione decide il punto, la ricetta condivisa
 * decide il feel. `timing` permette a uno snap "cinematografico" deliberato di
 * sovrascrivere la ricetta standard — override esplicito, mai default.
 * @param {(value: number, st: ScrollTrigger) => number} fn
 * @param {Partial<typeof SNAP.desktop>} [timing]
 * @param {boolean} [isMobile]
 */
export function buildAsymmetricSnap(fn, timing = {}, isMobile = false) {
	const recipe = isMobile ? SNAP.mobile : SNAP.desktop;
	return { snapTo: fn, ...recipe, ...timing };
}
