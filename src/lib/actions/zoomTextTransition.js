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
		transformOrigin: '44.2% 85%',
		transformBox: 'view-box',
		scale: 1, 
		opacity: 0, 
		filter: 'blur(15px)',
		y: 20,
		force3D: false
	});
	gsap.set(firstText, { opacity: 0, filter: 'blur(15px)', y: 30 });
	gsap.set(nextContent, { opacity: 0 });

	// Differisce la creazione dello ScrollTrigger al prossimo frame di rendering,
	// garantendo che tutti i pin-spacer a monte (es. ShatterGlass) siano già nel DOM
	// e che GSAP calcoli la posizione di start corretta
	rafId = requestAnimationFrame(() => {
		ctx = gsap.context(() => {
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

			// ==========================================================================
			// TIMELINE CORE
			// ==========================================================================
			
			// 1. Comparsa iniziale sincronizzata
			tl.to(firstText, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1 })
			  .to(zoomSvg, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1 }, '<')
			  
			  // 2. Zoom cinematografico super-nitido (essendo SVG rimarrà vettoriale)
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
			  }, '-=0.8');
		});
	});

	return {
		destroy() {
			cancelAnimationFrame(rafId);
			if (ctx) ctx.revert();
		}
	};
}