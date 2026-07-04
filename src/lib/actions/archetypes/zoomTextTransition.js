import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';

/**
 * Azione Svelte per la transizione cinematografica dentro al testo SVG tramite ScrollTrigger.
 * Risolve il problema della sgranatura/pixel dei font durante lo scale elevato.
 * Utilizza la funzionalità di snap nativo di ScrollTrigger con soglie e target asimmetrici
 * calibrati sulla direzione dello scroll. Garantisce che in risalita il testo rimanga visibile
 * al 100% senza vuoti e rende l'animazione estremamente morbida e priva di scatti.
 * 
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
	gsap.set(nextContent, { autoAlpha: 0 });

	// Differisce la creazione dello ScrollTrigger al prossimo frame di rendering,
	// garantendo che tutti i pin-spacer a monte (es. ShatterGlass) siano già nel DOM
	// e che GSAP calcoli la posizione di start corretta
	rafId = requestAnimationFrame(() => {
		ctx = gsap.context(() => {
			const tl = gsap.timeline({
				scrollTrigger: {
					id: 'zoomTrigger',
					trigger: node,
					start: 'top top',    
					/* Spazio di pinning ottimizzato per bilanciare fluidità di lettura ed efficacia dello snap */
					end: '+=250%',       
					pin: true,           
					scrub: 1.5, // Aumentato lo scrub per rendere l'inseguimento dell'animazione estremamente morbido          
					anticipatePin: 1,
					// Commento solo il PERCHÉ: lo snap asimmetrico gestisce i target in modo intelligente.
					// Al ritorno (direzione -1), snappiamo a 0.20 (zona in cui il testo ha completato il fade-in ed è stabile)
					// invece di 0.0 (inizio assoluto in cui l'opacità è 0 per il reset), evitando il vuoto visivo.
					snap: {
						snapTo: (value) => {
							const trigger = ScrollTrigger.getById('zoomTrigger');
							const direction = trigger ? trigger.direction : 1;

							if (direction === 1) {
								// In discesa: se supera il 30% del percorso, completa lo zoom fino a 1.0. Altrimenti si ferma a 0.20 (testo visibile).
								return value > 0.30 ? 1.0 : 0.20;
							} else {
								// In risalita: se scende sotto l'80% del percorso, torna a 0.20 (testo visibile). Altrimenti ri-aggancia a 1.0.
								return value < 0.80 ? 0.20 : 1.0;
							}
						},
						duration: { min: 0.8, max: 1.4 }, // Allungata la durata per rendere la transizione di snap molto più dolce e graduale
						delay: 0.02, // Reattività immediata al rilascio dello scroll
						ease: 'power3.out' // Easing più morbido per attutire l'aggancio finale
					}
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
			  .to(zoomSvg, {
					/* Commento solo il PERCHÉ: sfuma l'SVG zoomato contemporaneamente all'ingresso del carosello per liberare lo sfondo ed evitare che il colore rimanga visibile nei micro-gap del pinning */
					opacity: 0,
					duration: 1.0,
					ease: 'power1.out'
			  }, '<')
			  
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