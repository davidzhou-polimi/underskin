import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';

/**
 * Action GSAP per lo scrollytelling unificato in ArchetypeSection.
 * Su desktop esegue solo il pinning semplice a schermo intero.
 * Su mobile, coordina la dissolvenza e lo spostamento verso l'alto della citazione
 * e la contemporanea comparsa dal basso del carosello delle card.
 *
 * @param {HTMLElement} node - La sezione principale (.archetype-section)
 */
export function archetypeScrolly(node) {
	const mm = gsap.matchMedia();

	// Desktop: pin della sezione standard
	mm.add('(min-width: 769px)', () => {
		ScrollTrigger.create({
			trigger: node,
			start: 'top top',
			end: '+=100%',
			pin: true,
			pinSpacing: true
		});
	});

	// Mobile: scrollytelling coordinato
	mm.add('(max-width: 768px)', () => {
		const quote = node.querySelector('.perf-quote');
		const carousel = node.querySelector('.archetypes-carousel-container');

		if (!quote || !carousel) return;

		// Commento solo il PERCHÉ: allunga lo spazio di scroll complessivo del pin a 2.5 schermate 
		// per dare tempo all'utente sia di assistere alla transizione sia di interagire con le card
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: node,
				start: 'top top',
				end: '+=250%',
				pin: true,
				pinSpacing: true,
				scrub: 1
			}
		});

		// Commento solo il PERCHÉ: imposta gli stati iniziali prima dell'attivazione dello ScrollTrigger per evitare sfarfallii (FOUC)
		gsap.set(quote, { opacity: 0, filter: 'blur(10px)', y: '5vh' });
		gsap.set(carousel, { opacity: 0, y: '60vh' });

		// Commento solo il PERCHÉ: sfuma ed entra la citazione per renderla leggibile al centro del viewport all'inizio
		tl.to(quote, {
			opacity: 1,
			filter: 'blur(0px)',
			y: 0,
			duration: 1.0,
			ease: 'power2.out'
		});

		// Commento solo il PERCHÉ: crea un momento di stasi (dwell) per consentire all'utente di leggere la citazione da sola
		tl.to({}, { duration: 1.0 });

		// Commento solo il PERCHÉ: sposta la citazione verso l'alto dello schermo facendo contestualmente salire il carosello mobile
		tl.to(quote, {
			y: '-32vh',
			duration: 1.5,
			ease: 'power2.inOut'
		}, 'transition');

		tl.to(carousel, {
			opacity: 1,
			y: '3vh',
			duration: 1.5,
			ease: 'power2.inOut'
		}, 'transition');

		// Commento solo il PERCHÉ: garantisce una sosta di scroll alla fine prima del rilascio del pin, permettendo i gesti touch sulle card
		tl.to({}, { duration: 1.5 });
	});

	return {
		destroy() {
			mm.revert();
		}
	};
}
