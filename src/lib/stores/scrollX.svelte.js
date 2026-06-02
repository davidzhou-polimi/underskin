/**
 * Store globale per il progresso dello scroll orizzontale.
 * Scritto dall'azione horizontalScroll, letto da InteractiveGradient.
 */
class ScrollXState {
	/** Progresso normalizzato [0-1] della sezione con scroll orizzontale attiva */
	progress = $state(0);
}

export const scrollX = new ScrollXState();
