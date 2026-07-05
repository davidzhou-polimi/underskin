/**
 * Store globale per i movimenti orizzontali guidati dallo scroll.
 * Scritto da burnoutScroll (home) e scrollableTextSwap (about), letto da InteractiveGradient:
 * fa reagire il gradiente di sfondo (depth/parallax X) al movimento orizzontale in corso.
 */
class ScrollXState {
	/**
	 * Viewport scrollati (verticalmente) consumati dalla sezione pinnata = progress * lunghezza in
	 * viewport. In unità viewport (non normalizzato [0-1]): così il gradiente si muove della stessa
	 * quantità per schermata scrollata, indipendentemente dalla lunghezza della sezione.
	 */
	viewports = $state(0);
}

export const scrollX = new ScrollXState();
