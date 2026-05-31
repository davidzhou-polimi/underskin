import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/**
 * Azione Svelte per la transizione cinematografica dentro al testo tramite ScrollTrigger.
 * Ritmo e sovrapposizioni ottimizzate per eliminare i tempi morti e lo spazio vuoto.
 * @param {HTMLElement} node - Il container principale della sezione
 */
export function zoomTextTransition(node) {
	const firstText = node.querySelector('.first-text');
	const zoomText = node.querySelector('.zoom-text');
	const nextContent = node.querySelector('.next-section-content');

	if (!zoomText || !firstText || !nextContent) return;

	const ctx = gsap.context(() => {
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: node,
				start: 'top top',    
				end: '+=180%',       // Ridotto da +=300% a +=180% per rendere lo scroll molto più reattivo e veloce!
				pin: true,           
				scrub: 1,            // Sincronizzazione millimetrica dello scroll
				anticipatePin: 1
			}
		});

		// Configurazione iniziale di partenza (ripristinato il testo standard)
		gsap.set(zoomText, { 
			transformOrigin: '48.5% 76.5%', // Il tuo asse perfetto!
			scale: 1, 
			opacity: 0, 
			filter: 'blur(15px)',
			y: 20,
			// Disabilita la creazione del layer 3D compositato per garantire una renderizzazione vettoriale fluida
			force3D: false
		});
		
		gsap.set(firstText, { opacity: 0, filter: 'blur(15px)', y: 20 });
		gsap.set(nextContent, { opacity: 0 });

		// ==========================================================================
		// TIMELINE CORE: RITMO, SPAZI E VELOCITÀ RIDEFINITI
		// ==========================================================================
		
		// 1. Entrano INSIEME sia "Alcuni casi a" che "Milano Cortina 2026"
		tl.to(firstText, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1 })
		  // Il parametro "<" dice a GSAP di partire ESATTAMENTE insieme all'animazione precedente
		  .to(zoomText, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1 }, '<')
		  
		  // 2. Lo zoom parte IMMEDIATAMENTE dopo la comparsa (ridotto il tempo di attesa a zero)
		  // E contemporaneamente facciamo il FADE OUT di "Alcuni casi a"
		  .to(zoomText, { 
				scale: 250, 
				duration: 2, // Velocizzato il movimento dello zoom per nascondere la sgranatura
				ease: 'power2.in',
				// Evita la bitmap-rasterizzazione durante la transizione per mantenere i vettori nitidi
				force3D: false
		  }, '+=0.1') // Piccolo stacco quasi impercettibile di 0.1s giusto per far leggere i testi
		  
		  // Questo fade out parte ESATTAMENTE insieme allo zoom in (grazie al puntatore "<")
		  .to(firstText, { 
				opacity: 0, 
				filter: 'blur(10px)', 
				y: -40, 
				duration: 0.8,
				ease: 'power2.out'
		  }, '<')
		  
		  // 3. Rivelazione finale fluida della nuova sezione azzurra
		  .to(nextContent, { 
				opacity: 1, 
				duration: 0.4 
		  }, '-=0.2'); // Inizia a comparire leggermente prima che lo zoom sia finito per dare continuità
	}, node);

	return {
		destroy() {
			ctx.revert();
		}
	};
}