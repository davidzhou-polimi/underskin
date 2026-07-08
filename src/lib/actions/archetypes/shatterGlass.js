import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';

/**
 * Azione Svelte per coordinare la timeline di rottura del vetro con GSAP.
 * Gestisce l'effetto di parallax e caduta dei frammenti.
 * @param {HTMLElement} node L'elemento del DOM a cui è applicata l'azione
 * @param {{ fragments?: Array<any> }} [params] Parametri dell'azione
 */
export function shatterGlass(node, params = { fragments: [] }) {
	/** @type {any} */
	let ctx;

	/**
	 * @param {Array<any> | undefined} fragments
	 */
	function init(fragments) {
		if (!fragments || fragments.length === 0) return;

		// Rilascia le risorse delle timeline precedenti per evitare collisioni durante gli hot reload o cambi di stato
		if (ctx) ctx.revert();

		ctx = gsap.context(() => {
			// Altezza del pannello sticky (CSS 100vh = viewport lungo) e non del wrapper 300vh né di
			// window.innerHeight (corto al mount): i frammenti cadono oltre il bordo del pannello
			// anche a URL bar ritratta.
			const panel = node.querySelector('.sticky-container');
			const fallHeight = panel ? panel.getBoundingClientRect().height : window.innerHeight;

			// Sfuma la lastra di vetro iniziale in base alla vicinanza allo scroll per dare fisicità prima dell'impatto
			gsap.fromTo(
				'.whole-glass-plate',
				{ opacity: 0 },
				{
					opacity: 1,
					scrollTrigger: {
						trigger: node,
						/* Commento solo il PERCHÉ: allunga la transizione a metà schermo (50%) per renderla estremamente progressiva */
						start: 'top 50%',
						end: 'top top',
						scrub: true
					}
				}
			);

			// Anima in parallelo il raggio di sfocatura (blur) del backdrop-filter
			// Commento solo il PERCHÉ: riducendo il raggio di sfocatura man mano che si sale, 
			// aggiriamo il bug dei browser che rende visibile il bordo netto del filtro di sfondo
			gsap.fromTo(
				'.whole-glass-plate .glass-effect',
				{
					backdropFilter: 'blur(0px)',
					webkitBackdropFilter: 'blur(0px)'
				},
				{
					backdropFilter: 'blur(8px)',
					webkitBackdropFilter: 'blur(8px)',
					scrollTrigger: {
						trigger: node,
						start: 'top 50%',
						end: 'top top',
						scrub: true
					}
				}
			);

			// Timeline principale a scrub sul wrapper 300vh: il fermo-immagine è affidato allo sticky
			// CSS del componente, NON al pin GSAP — niente pin-spacer, quindi nessun ricalcolo ai
			// refresh mobile che riavvolgeva lo scrub e rompeva il vetro in loop.
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: node,
					start: 'top top',
					end: 'bottom bottom',
					/* Commento solo il PERCHÉ: imposta scrub a true per sincronizzare istantaneamente l'animazione di rottura
					   con il movimento dello scrollbar, prevenendo sfasamenti o lag grafici quando si risale velocemente */
					scrub: true
				}
			});

			tl.addLabel('shatter');

			// Rende invisibile la lastra unita per sostituirla con i singoli frammenti pronti a cadere separatamente
			tl.to(
				'.whole-glass-plate',
				{
					opacity: 0,
					duration: 0.15,
					ease: 'power1.out'
				},
				'shatter'
			);

			// Rivela i frammenti pre-tagliati ma allineati nella medesima griglia Voronoi
			tl.fromTo(
				'.shards-container',
				{
					opacity: 0
				},
				{
					opacity: 1,
					duration: 0.15,
					ease: 'power1.out'
				},
				'shatter'
			);

			// Disperde i frammenti spingendoli verso il basso con movimenti caotici sull'asse X e rotazioni per simulare gravità e collisioni reali
			tl.to(
				'.glass-shard',
				{
					y: fallHeight * 1.5,
					x: () => (Math.random() - 0.5) * 160,
					rotation: () => (Math.random() - 0.5) * 45,
					opacity: 0,
					duration: 1.5,
					stagger: {
						each: 0.04,
						from: 'random'
					},
					ease: 'power3.in'
				},
				'shatter'
			);


			// Rivela progressivamente il testo emotivo retrostante rimuovendo la sfocatura in sincrono con lo shatter
			tl.to(
				'.content-behind',
				{
					filter: 'blur(0px)',
					opacity: 1,
					duration: 2,
					ease: 'power2.inOut'
				},
				'shatter'
			);
		}, node);
	}

	init(params.fragments);
	let lastFragments = params.fragments;

	return {
		/**
		 * @param {{ fragments?: Array<any> }} newParams
		 */
		update(newParams) {
			// update() scatta a ogni flush reattivo del componente (l'oggetto params è sempre nuovo):
			// il revert+rebuild del trigger pinnato va fatto solo se i frammenti sono davvero cambiati,
			// altrimenti il ricalcolo del pin-spacer riavvolge lo scrub in corso.
			if (newParams.fragments === lastFragments) return;
			lastFragments = newParams.fragments;
			init(newParams.fragments);
		},
		destroy() {
			// Previene leak di memoria distruggendo sia i trigger che i tween associati
			if (ctx) ctx.revert();
		}
	};
}
