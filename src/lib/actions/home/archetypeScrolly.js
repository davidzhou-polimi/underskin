/* Geometria di riposo della quote sul mobile: siede appena sopra la card, agganciata al carosello.
   CARD_HEADROOM deve combaciare con l'headroom del .carousel-viewport (415px per card da 380);
   QUOTE_GAP equivale a --spacing-4 (i token non sono leggibili da JS senza getComputedStyle)
   e deve restare coerente col termine GAP del margin-top calc in ArchetypeSection. */
const CARD_HEADROOM = 15;
const QUOTE_GAP = 32;

/**
 * Contenuto custom per scrollSection in ArchetypeSection: il pin (desktop bare, mobile
 * scrubbato con id 'archetypeScrollyMobile', letto da cinematicScroll) lo crea la libreria;
 * qui vive solo la coreografia mobile — dissolvenza e aggancio della citazione al carosello
 * che entra dal basso. Su desktop non c'è timeline e la funzione è un no-op.
 *
 * @param {{ node: HTMLElement, gsap: typeof import('gsap').gsap, tl: gsap.core.Timeline | null, isMobile: boolean }} ctx
 */
export function archetypeConveyor({ node, gsap, tl, isMobile }) {
	if (!isMobile || !tl) return;

	const quote = node.querySelector('.perf-quote');
	const carousel = node.querySelector('.archetypes-carousel-container');
	if (!quote || !carousel) return;

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

	// Commento solo il PERCHÉ: dwell moderato per tenere la citazione ferma e leggibile prima
	// della transizione, così uno scroll veloce non la incolla subito al carosello
	tl.to({}, { duration: 1.4 });

	// La quote non sale a una quota fissa ma si aggancia al carosello: il suo bordo inferiore
	// si ferma QUOTE_GAP sopra la card. offsetTop/offsetHeight sono layout puro (ignorano i
	// transform GSAP in corsa) → la misura è affidabile anche a scrub parziale, e se la
	// geometria del carosello cambia la quote la segue senza ritocchi qui.
	// (invalidateOnRefresh è garantito da scrollytelling/pin.js)
	tl.to(
		quote,
		{
			y: () => {
				const cardTop = /** @type {HTMLElement} */ (carousel).offsetTop + CARD_HEADROOM;
				const q = /** @type {HTMLElement} */ (quote);
				return cardTop - QUOTE_GAP - q.offsetHeight - q.offsetTop;
			},
			duration: 1.5,
			ease: 'power2.inOut'
		},
		'transition'
	);

	tl.to(
		carousel,
		{
			opacity: 1,
			// La geometria di riposo vive tutta nel CSS (margin-top calc dell'ensemble):
			// GSAP si limita a portare il carosello lì, senza offset residui che la sporcherebbero.
			y: 0,
			duration: 1.5,
			ease: 'power2.inOut'
		},
		'transition'
	);

	// Commento solo il PERCHÉ: garantisce una sosta di scroll alla fine prima del rilascio del pin, permettendo i gesti touch sulle card
	tl.to({}, { duration: 1.5 });
}
