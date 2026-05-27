import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/**
 * Azione Svelte per la transizione cinematografica dentro al testo tramite ScrollTrigger.
 * @param {HTMLElement} node - Il container principale della sezione
 */
export function zoomTextTransition(node) {
	const firstText = node.querySelector('.first-text');
	const zoomText = node.querySelector('.zoom-text');
	const nextContent = node.querySelector('.next-section-content');
	const targetDigit = node.querySelector('.target-digit');

	if (!zoomText || !firstText || !nextContent || !targetDigit) return;

	const ctx = gsap.context(() => {
		// 1. Calcolo geometrico esatto per centrare lo zero
		const parentRect = zoomText.getBoundingClientRect();
		const digitRect = targetDigit.getBoundingClientRect();

		const originX = (digitRect.left + digitRect.width / 2) - parentRect.left;
		const originY = (digitRect.top + digitRect.height / 2) - parentRect.top;
		const computedOrigin = `${originX}px ${originY}px`;

		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: node,
				start: 'top top',
				end: '+=300%', // Allunghiamo leggermente lo scroll per dare più spazio allo zoom finale
				pin: true,
				scrub: 1,
				anticipatePin: 1
			}
		});

		// Configurazione iniziale: la sezione successiva è nascosta
		gsap.set([firstText, zoomText], { opacity: 0, filter: 'blur(15px)', y: 20 });
		gsap.set(nextContent, { opacity: 0 });

		// Sequenza temporale dello scrollytelling senza sovrapposizioni sgradevoli
		tl.to(firstText, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1 })
		  .to(zoomText, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1 }, '-=0.3')
		  .to(firstText, { opacity: 0, filter: 'blur(10px)', y: -30, duration: 0.5 }, '+=0.3')
		  
		  // Portiamo lo zoom a 250! In questo modo lo spessore dello zero cresce così tanto 
		  // da colorare l'intero schermo di azzurro in modo matematico.
		  .to(zoomText, { 
				scale: 250, 
				transformOrigin: computedOrigin,
				duration: 2.5,
				ease: 'power2.in'
		  })
		  
		  // Solo ORA che lo zoom ha occupato tutto lo schermo facciamo comparire la nuova sezione.
		  // Togliamo il segno "-=" in modo che questa azione aspetti la fine dello zoom.
		  .to(nextContent, { 
				opacity: 1, 
				duration: 0.5 
		  });
	}, node);

	return {
		destroy() {
			ctx.revert();
		}
	};
}