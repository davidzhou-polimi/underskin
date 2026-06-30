import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/**
 * Azione Svelte per la transizione cinematografica dentro al testo SVG tramite ScrollTrigger.
 * Risolve il problema della sgranatura/pixel dei font durante lo scale elevato.
 * @param {HTMLElement} node - Il container principale della sezione
 */
export function zoomTextTransition(node) {
	const firstText = node.querySelector('.first-text');
	const zoomSvg = node.querySelector('.zoom-svg');
	const nextContent = node.querySelector('.next-section-content');

	if (!zoomSvg || !firstText || !nextContent) return;

	/** @type {gsap.Context | null} */
	let ctx = null;
	let rafId = 0;

	// Stato visivo nascosto impostato immediatamente per prevenire flash durante il frame di attesa
	gsap.set(zoomSvg, { 
		opacity: 0, 
		filter: 'blur(15px)',
		y: 20,
		attr: { viewBox: '0 0 1000 400' }
	});
	gsap.set(firstText, { opacity: 0, filter: 'blur(15px)', y: 30 });
	// Impedisce il rendering e l'interazione con l'intera sezione finché lo zoom non è completato
	gsap.set(nextContent, { autoAlpha: 0 });

	// Differisce la creazione dello ScrollTrigger al prossimo frame di rendering,
	// garantendo che tutti i pin-spacer a monte (es. ShatterGlass) siano già nel DOM
	// e che GSAP calcoli la posizione di start corretta
	rafId = requestAnimationFrame(() => {
		ctx = gsap.context(() => {
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: node,
					start: 'top top',    
					/* Allunga lo spazio complessivo di pinning per ridurre la velocità dello scroll ed evitare passaggi repentini */
					end: '+=400%',       
					pin: true,           
					scrub: 1,            
					anticipatePin: 1
				}
			});

			// ==========================================================================
			// TIMELINE CORE
			// ==========================================================================
			
			// 1. Comparsa iniziale sincronizzata
			tl.to(firstText, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1 })
			  .to(zoomSvg, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1 }, '<')
			  
			  // 2. Zoom cinematografico super-nitido tramite animazione del viewBox nativo
			  .to(zoomSvg, { 
					attr: { viewBox: '418 333 50 20' },
					/* La durata maggiorata rende lo zoom più graduale e cinematografico */
					duration: 2.5, 
					ease: 'power2.out' 
			  }, '+=1.5') /* Evita l'avvio immediato dello zoom per consentire la lettura del testo iniziale */
			  
			  // Scomparsa contemporanea del testo di intro
			  .to(firstText, { 
					opacity: 0, 
					filter: 'blur(10px)', 
					y: -40, 
					duration: 1.0 
			  }, '<')
			  
			  // 3. Dissolvenza in ingresso della sezione successiva dentro lo zero
			  .to(nextContent, { 
					// Rende l'elemento visibile all'inizio del tween e ne anima la comparsa fluida
					autoAlpha: 1, 
					duration: 1.0,
					ease: 'power1.out'
			  }, '-=0.8')
			  
			  // 4. Buffer di riposo (resting state) per dare stabilità alla sezione una volta rivelata
			  // Evita che uno scroll brusco o l'inerzia dello scroll superino immediatamente la sezione
			  .to({}, { duration: 2.5 });
		});
	});

	return {
		destroy() {
			cancelAnimationFrame(rafId);
			if (ctx) ctx.revert();
		}
	};
}