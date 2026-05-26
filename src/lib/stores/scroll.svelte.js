/**
 * Store globale basato sui Runes di Svelte 5 (.svelte.js è necessario per usare $state globalmente)
 */
class ScrollState {
	// Variabile reattiva globale che traccia l'id della sezione attiva
	/** @type {string | null} */
	activeSection = $state(null);
	// Altre variabili utili per lo scrollytelling
	progress = $state(0);
	direction = $state(1); // 1 = giù, -1 = su
}

export const scroll = new ScrollState();
