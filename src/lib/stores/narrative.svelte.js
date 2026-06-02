// Commento solo il PERCHÉ: Fornisce lo stato reattivo globale per orchestrare 
// lo scambio di sezioni/rami a livello di pagina singola (single URL).
class NarrativeState {
	activeSection = $state('hero'); // 'hero' | 'favorito'
}

export const narrative = new NarrativeState();
