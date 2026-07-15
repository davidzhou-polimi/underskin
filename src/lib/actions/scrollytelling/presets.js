/**
 * Presets della libreria di scrollytelling: l'unico punto di tuning del "feel" di scroll
 * dell'intero sito. Le sezioni dichiarano nomi semantici (length: 'short', dwell: 'medium'…)
 * e i valori reali vivono solo qui — cambiare un valore qui ricalibra tutte le sezioni
 * che usano quel nome. Le stringhe `+=NNN%` restano legali nei descrittori come override
 * esplicito e deliberato, mai come default.
 */

// Unica fonte del breakpoint di comportamento, allineata a stores/mediaQuery.svelte.js (768px).
export const BREAKPOINT = {
	desktop: '(min-width: 769px)',
	mobile: '(max-width: 768px)'
};

// Durata del pin in percentuale di viewport scrollata (ScrollTrigger `end`).
export const PIN_LENGTH = {
	short: '+=100%', // dwell puro di ~una schermata (team, archetipi desktop)
	medium: '+=150%', // reveal + sosta breve (finale)
	long: '+=250%', // scrub multi-beat (conveyor, zoom, burnout)
	xlong: '+=550%' // sequenza lunga di righe (preface)
};

// Smoothing dello scrub: su mobile più alto per assorbire l'inerzia dei flick touch.
export const SCRUB = {
	desktop: 1,
	mobile: 1.5
};

// Ricetta di snap (timing/easing) per breakpoint; il passo (snapTo) si deriva dai beat
// della reveal. Durate lunghe + ease dolce: l'aggancio deve essere una planata, non uno
// strattone. Il delay tiene lo snap fuori dalla coda del gesto: partiva a 0.05s, in piena
// inerzia, ed era la causa principale della sensazione di "aggancio forte".
export const SNAP = {
	desktop: { duration: { min: 0.4, max: 0.8 }, ease: 'power1.inOut', delay: 0.1 },
	// Mobile: l'inerzia touch scarica ben oltre l'ultimo evento; delay più alto = parte a
	// pagina davvero ferma, planata più lunga = mai in lotta col dito.
	mobile: { duration: { min: 0.5, max: 1.0 }, ease: 'power1.inOut', delay: 0.2 }
};

// Code di sosta a contenuto fermo, in beat di timeline scrubbata (tl.to({}, { duration })).
export const DWELL = {
	short: 0.8,
	medium: 1.5,
	long: 2.5
};
