// Segnale globale della loading screen: passa a true quando il loader inizia a scoprire il sito.
// La home lo legge in introReveal per rinviare la timeline d'entrata (sfera + cerchi + titolo)
// finché il loader non ha alzato il velo, così l'intro non si "pre-gioca" coperta dall'overlay.
export const loadingState = $state({ complete: false });

/**
 * Esegue `cb` una volta, quando il caricamento è concluso (subito se già concluso), e ritorna un
 * dispose. Vive qui (.svelte.js) perché le rune non sono disponibili nelle action `.js`: espone
 * l'attesa reattiva del flag come API imperativa consumabile da `introReveal`.
 * @param {() => void} cb
 * @returns {() => void}
 */
export function onLoadingComplete(cb) {
	let done = false;
	return $effect.root(() => {
		$effect(() => {
			if (loadingState.complete && !done) {
				done = true;
				cb();
			}
		});
	});
}
