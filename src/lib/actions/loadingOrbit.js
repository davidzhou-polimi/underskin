import { gsap } from '$lib/utils/gsapSetup.js';

/**
 * @typedef {Object} LoadingOrbitParams
 * @property {boolean} [outro] - quando passa a true innesca l'uscita a spirale
 * @property {() => void} [onReveal] - invocata dopo un breve gap dalla scomparsa completa dell'overlay
 * @property {() => void} [onDone] - invocata a uscita completata (per smontare il loader)
 * @property {boolean} [reducedMotion] - salta orbita/spirale, solo dissolvenza
 */

// Parametri d'animazione (non stile). Il raggio è costante e uguale per tutte: 3 lucine equispaziate
// a 120° che ruotano insieme = un'orbita circolare pulita e compatta (niente respiro del raggio, che
// leggeva come "triangolo che si scala"). ω scelta così che un giro sia percepibile nei ~2s del loader.
const ORBIT_RADIUS = 30;
const OMEGA = (Math.PI * 2) / 3.4; // ~1 giro ogni 3.4s: rotazione lenta ma chiaramente visibile
const WOBBLE_FREQ = 1.1;           // lieve ondulazione condivisa della velocità (mantiene i 120° fissi)
const WOBBLE_AMP = 0.14;
// Pausa dopo la scomparsa totale dell'overlay prima che parta il reveal della pagina sottostante:
// senza questo gap l'entrata (es. introReveal) partirebbe mentre il loader è ancora in dissolvenza,
// leggendosi come un cross-fade indesiderato invece di due fasi nette e separate.
// ⬇ UNICA manopola del ritardo "loader sparito → inizio intro": regola solo questo valore.
const REVEAL_GAP = 0.3;

// Dissolvenza radiale d'uscita dell'overlay: la maschera si apre dal centro con una banda morbida
// (nessun bordo netto), svelando ciò che sta dietro (sfondo piatto in home, contenuto altrove).
const MASK_FEATHER = 50; // ampiezza (%) della banda sfumata: più grande = transizione più morbida
const MASK_END = 130;    // % oltre l'angolo più lontano: garantisce la copertura degli angoli a fine apertura

/**
 * Action sul nodo root dell'overlay: fa ruotare in cerchio 3 "lucine" e, su richiesta, le fa
 * confluire a spirale verso il centro rimpicciolendosi fino a sparire.
 * @param {HTMLElement} node
 * @param {LoadingOrbitParams} [params]
 */
export function loadingOrbit(node, params = {}) {
	let onReveal = params.onReveal;
	let onDone = params.onDone;

	const lights = /** @type {HTMLElement[]} */ (Array.from(node.querySelectorAll('.loading-light')));
	const n = lights.length;
	const baseAngle = lights.map((_, i) => (i / Math.max(n, 1)) * Math.PI * 2);

	// t = clock in secondi; radiusScale = 1→0 nel collasso finale.
	const state = { t: 0, radiusScale: 1 };

	function render() {
		// Rotazione condivisa (+ lieve ondulazione): tutte ruotano insieme, spaziatura 120° costante.
		const rot = state.t * OMEGA + Math.sin(state.t * WOBBLE_FREQ) * WOBBLE_AMP;
		const rad = ORBIT_RADIUS * state.radiusScale;
		for (let i = 0; i < n; i++) {
			const ang = baseAngle[i] + rot;
			gsap.set(lights[i], { x: Math.cos(ang) * rad, y: Math.sin(ang) * rad });
		}
	}

	// Le lucine sono centrate dal CSS (top/left 50%); qui si centrano sul proprio baricentro una volta,
	// poi il render muove solo x/y. Partono a opacity 0 (anche in CSS): l'HTML è prerenderizzato e senza
	// questo, prima dell'hydration, i punti si vedrebbero impilati al centro. Le "accendiamo" in orbita.
	gsap.set(lights, { xPercent: -50, yPercent: -50, opacity: 0 });
	render();
	gsap.to(lights, { opacity: 1, duration: 0.5, stagger: 0.08, ease: 'sine.out' });

	/** @type {gsap.core.Tween | null} */
	let clock = null;
	/** @type {gsap.core.Tween[]} */
	let twinkles = [];

	if (!params.reducedMotion) {
		// Clock monotòno: t avanza di 1 unità/secondo per anni — nessun loop percepibile.
		clock = gsap.to(state, { t: 1e6, duration: 1e6, ease: 'none', onUpdate: render });
		// Twinkle soft e desincronizzato (solo opacità, niente scale per non dare senso di "scaling").
		twinkles = lights.map((el, i) =>
			gsap.to(el, {
				opacity: 0.72,
				duration: 1.8 + i * 0.35,
				ease: 'sine.inOut',
				yoyo: true,
				repeat: -1,
				delay: 0.7 + i * 0.4
			})
		);
	}

	let outroStarted = false;

	function playOutro() {
		if (outroStarted) return;
		outroStarted = true;
		twinkles.forEach((t) => t.kill());

		if (params.reducedMotion) {
			clock?.kill();
			const tl = gsap.timeline({ onComplete: () => onDone?.() });
			tl.to(node, { autoAlpha: 0, duration: 0.6, ease: 'power1.inOut' });
			// Gap netto: il reveal della pagina parte solo dopo che l'overlay è del tutto sparito.
			tl.call(() => onReveal?.(), [], `+=${REVEAL_GAP}`);
			return;
		}

		// NON si killa il clock: le lucine continuano a girare alla STESSA velocità mentre il raggio si
		// riduce → spirale dolce che confluisce al centro, niente vortice accelerato.
		const tl = gsap.timeline({
			onComplete: () => {
				clock?.kill();
				onDone?.();
			}
		});

		tl.to(state, { radiusScale: 0, duration: 1.5, ease: 'power2.in', onUpdate: render }, 0);

		// Le lucine si spengono rimpicciolendosi appena raggiungono il centro.
		tl.to(lights, {
			scale: 0,
			opacity: 0,
			duration: 0.9,
			ease: 'power2.in',
			stagger: 0.05
		}, 0.7);

		// L'overlay si dissolve con una maschera radiale che si apre dal centro: la banda morbida
		// (MASK_FEATHER) evita il bordo netto e dà un'apertura fluida. Parte a 1.5s, quando le lucine
		// hanno già raggiunto il centro e si sono spente, così la maschera non le taglia a metà.
		const reveal = { p: 0 };
		tl.to(reveal, {
			p: 1,
			duration: 1.2,
			ease: 'power2.inOut',
			onUpdate: () => {
				const inner = -MASK_FEATHER + (MASK_END + MASK_FEATHER) * reveal.p;
				const outer = inner + MASK_FEATHER;
				const mask = `radial-gradient(circle at 50% 50%, transparent ${inner}%, #000 ${outer}%)`;
				// Autoprefixer non processa gli stili inline/JS: prefisso -webkit- manuale, prima dello standard.
				node.style.webkitMaskImage = mask;
				node.style.maskImage = mask;
			}
		}, 1.5);

		// Gap netto DOPO che l'overlay è del tutto invisibile: solo qui si avvisa che si può partire
		// con l'entrata della pagina (es. introReveal), evitando che si sovrapponga alla dissolvenza.
		tl.call(() => onReveal?.(), [], `+=${REVEAL_GAP}`);
	}

	if (params.outro) playOutro();

	return {
		/** @param {LoadingOrbitParams} newParams */
		update(newParams) {
			onReveal = newParams.onReveal ?? onReveal;
			onDone = newParams.onDone ?? onDone;
			if (newParams.outro) playOutro();
		},
		destroy() {
			clock?.kill();
			twinkles.forEach((t) => t.kill());
			gsap.killTweensOf([node, ...lights, state]);
		}
	};
}
