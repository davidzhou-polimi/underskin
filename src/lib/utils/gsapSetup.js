import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Observer } from 'gsap/dist/Observer';
import { Draggable } from 'gsap/dist/Draggable';

// Unico punto di registrazione dei plugin GSAP: garantisce una sola istanza di ogni
// plugin (percorso dist/ ovunque) ed elimina i blocchi registerPlugin duplicati nelle
// action. Import type-safe: `import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js'`.
if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger, Observer, Draggable);
}

export { gsap, ScrollTrigger, Observer, Draggable };
