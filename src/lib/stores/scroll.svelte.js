/**
 * Store globale basato sui Runes di Svelte 5 (.svelte.js è necessario per usare $state globalmente)
 */
class ScrollState {
	// Progresso di scroll [0-1], consumato dal gradiente interattivo
	progress = $state(0);
}

export const scroll = new ScrollState();
