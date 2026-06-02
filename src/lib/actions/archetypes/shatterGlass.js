import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

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
			const windowHeight = window.innerHeight;

			// Sfuma la lastra di vetro iniziale in base alla vicinanza allo scroll per dare fisicità prima dell'impatto
			gsap.fromTo(
				'.whole-glass-plate',
				{ opacity: 0 },
				{
					opacity: 1,
					scrollTrigger: {
						trigger: node,
						start: 'top 80%',
						end: 'top top',
						scrub: true
					}
				}
			);

			// Timeline principale bloccata nello scroll per scandire il ritmo del racconto visivo dello shatter
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: node,
					start: 'top top',
					end: '+=200%',
					scrub: 1,
					pin: true
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
					y: windowHeight * 1.5,
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

	return {
		/**
		 * @param {{ fragments?: Array<any> }} newParams
		 */
		update(newParams) {
			init(newParams.fragments);
		},
		destroy() {
			// Previene leak di memoria distruggendo sia i trigger che i tween associati
			if (ctx) ctx.revert();
		}
	};
}
