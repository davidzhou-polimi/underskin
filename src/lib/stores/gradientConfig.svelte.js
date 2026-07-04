import { TOTAL_COLORS } from '$lib/stores/scrollGradient.svelte.js';

// La config attiva del gradiente, scritta dalla pagina corrente e letta dal canvas unico
// nel root layout. Il canvas persiste tra le rotte: cambiando pagina questo valore cambia e
// l'action interactiveGradient anima la transizione fluida invece di un salto secco.
// Seed a piena pagina (stato di riposo): evita la finestra di config vuota alla costruzione
// del canvas, sostituito dalla config della rotta al mount.
export const gradientConfig = $state({
	/** @type {import('$lib/utils/interactiveGradientRenderer.js').GradientConfig} */
	config: { colors: TOTAL_COLORS, coverage: 0.35, focusRadius: 2.0 }
});
