/**
 * Store globale per il progresso dei movimenti orizzontali guidati dallo scroll.
 * Scritto da burnoutScroll (home) e scrollableTextSwap (about), letto da InteractiveGradient:
 * fa reagire il gradiente di sfondo (depth/parallax X) al movimento orizzontale in corso.
 */
class ScrollXState {
	/** Progresso normalizzato [0-1] della sezione con scroll orizzontale attiva */
	progress = $state(0);
}

export const scrollX = new ScrollXState();
