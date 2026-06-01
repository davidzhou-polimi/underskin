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

	const ctx = gsap.context(() => {
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: node,
				start: 'top top',    
				end: '+=180%',       
				pin: true,           
				scrub: 1,            
				anticipatePin: 1
			}
		});

		// Configurazione iniziale (il testo SVG parte invisibile e leggermente sfocato)
		gsap.set(zoomSvg, { 
			// Calibrato sul centro dello '0' di '2026' dentro la viewbox SVG
			transformOrigin: '44.2% 85%',
			transformBox: 'view-box',
			scale: 1, 
			opacity: 0, 
			filter: 'blur(15px)',
			y: 20,
			// Disabilita la creazione del layer 3D compositato per garantire una renderizzazione vettoriale fluida
			force3D: false
		});
		
		gsap.set(firstText, { 
			opacity: 0, 
			filter: 'blur(15px)',
			y: 30
		});
		
		gsap.set(nextContent, { opacity: 0 });

		// ==========================================================================
		// TIMELINE CORE
		// ==========================================================================
		
		// 1. Comparsa iniziale sincronizzata
		tl.to(firstText, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1 })
		  .to(zoomSvg, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1 }, '<')
		  
		  // 2. Zoom cinematografico super-nitido (essendo SVG rimarrà vettoriale)
		  // Ridotto leggermente il target di scale massimo poiché SVG risponde diversamente alle proporzioni rispetto al CSS del font
		  .to(zoomSvg, { 
				scale: 20, 
				duration: 2, 
				ease: 'power2.in' 
		  }, '+=0.1')
		  
		  // Scomparsa contemporanea del testo di intro
		  .to(firstText, { 
				opacity: 0, 
				filter: 'blur(10px)', 
				y: -40, 
				duration: 0.8 
		  }, '<')
		  
		  // 3. Dissolvenza in ingresso della sezione successiva dentro lo zero
		  .to(nextContent, { 
				opacity: 1, 
				duration: 1.2,
				ease: 'power1.out'
		  }, '-=0.8'); // Inizia leggermente prima che lo zoom finisca per fluidità
	});

	return {
		destroy() {
			ctx.revert();
		}
	};
}