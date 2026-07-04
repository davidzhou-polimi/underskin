// hasNavigated: distingue il primo atterraggio (l'intro della home possiede il focus, cresce da 0)
// dalle navigazioni client interne (il focus lo anima fluidamente transitionConfig, senza scatto).
export const navigationState = $state({ fromArchetype: false, hasNavigated: false });
