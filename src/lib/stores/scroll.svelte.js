/**
 * Store globale basato sui Runes di Svelte 5 (.svelte.js è necessario per usare $state globalmente)
 */
class ScrollState {
	// Progresso di scroll [0-1] sull'intera pagina, usato per la soglia footer (scrollGradient)
	progress = $state(0);
	// Distanza scrollata in unità viewport (px/innerHeight): consumata dal gradiente per un parallasse
	// uniforme tra pagine lunghe e corte (a differenza di progress, non è normalizzato sulla pagina)
	viewports = $state(0);
}

export const scroll = new ScrollState();
