// hasNavigated: distingue il primo atterraggio (l'intro della home possiede il focus, cresce da 0)
// dalle navigazioni client interne (il focus lo anima fluidamente transitionConfig, senza scatto).
// gradientDelay: ritardo teatrale (s) della PROSSIMA transizione del gradiente, armato a ogni
// onNavigate e consumato one-shot da transitionConfig — così ritarda solo il cambio pagina,
// mai le transizioni scroll-driven successive (hero che si schiarisce, footer).
export const navigationState = $state({ fromArchetype: false, hasNavigated: false, fromHome: false, gradientDelay: 0 });
