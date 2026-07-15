/**
 * Riallineamento di una timeline scrubbata allo scroll reale, centralizzato
 * (prima duplicato verbatim nei due rami breakpoint di scrollReveal.js).
 */

/**
 * Commento solo il PERCHÉ — due resync distinti:
 * 1) Immediato: se il breakpoint cambia a metà scroll (es. rotazione del telefono), la
 *    timeline appena creata riparte dal suo stato iniziale; il resync forzato la allinea
 *    subito al progress reale invece di mostrare per un frame lo stato "inizio".
 * 2) Differito a doppio rAF: al re-mount dopo navigazione client il trigger nasce con lo
 *    scroll ancora alla Y della pagina precedente, e il reset autoritativo di afterNavigate
 *    (scrollTo(0)+refresh) arriva DOPO — lo scrub rientrerebbe con smoothing visibile.
 *    A doppio rAF lo scroll è quiescente e l'allineamento è istantaneo; sull'hard load è un no-op.
 *
 * @param {gsap.core.Timeline} tl - timeline con scrollTrigger già creato
 * @returns {() => void} cleanup da eseguire al revert del breakpoint
 */
export function scheduleScrubResync(tl) {
	if (!tl.scrollTrigger) return () => {};

	tl.scrollTrigger.refresh();
	tl.progress(tl.scrollTrigger.progress, true);

	let raf = requestAnimationFrame(() => {
		raf = requestAnimationFrame(() => {
			if (tl.scrollTrigger) tl.progress(tl.scrollTrigger.progress, true);
		});
	});
	return () => cancelAnimationFrame(raf);
}
