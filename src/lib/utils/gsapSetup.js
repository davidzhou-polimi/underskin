import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Observer } from 'gsap/dist/Observer';
import { Draggable } from 'gsap/dist/Draggable';

// Unico punto di registrazione dei plugin GSAP: garantisce una sola istanza di ogni
// plugin (percorso dist/ ovunque) ed elimina i blocchi registerPlugin duplicati nelle
// action. Import type-safe: `import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js'`.
if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger, Observer, Draggable);
	// Su touch lo show/hide della barra URL emette resize di sola altezza: il refresh completo
	// che ne seguirebbe ricalcola i pin-spacer mentre si è DENTRO un pin scrubbed (es. shatter
	// glass) riavvolgendone il progresso in loop. Ignora i resize senza cambio di larghezza.
	ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, Observer, Draggable };
