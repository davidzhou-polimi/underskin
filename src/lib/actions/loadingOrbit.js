import { gsap } from '$lib/utils/gsapSetup.js';

/**
 * @typedef {Object} LoadingOrbitParams
 * @property {boolean} [outro] - quando passa a true innesca l'uscita a spirale
 * @property {() => void} [onReveal] - invocata dopo un breve gap dalla scomparsa completa dell'overlay
 * @property {() => void} [onDone] - invocata a uscita completata (per smontare il loader)
 * @property {boolean} [reducedMotion] - salta orbita/spirale, solo dissolvenza
 */

// Parametri d'animazione (non stile). Il raggio è costante e uguale per tutte: 3 lucine equispaziate
// a 120° che ruotano insieme = un'orbita circolare pulita e compatta. Il raggio NON è una costante:
// è il clamp() responsive di --orbit-radius, letto risolto in px dalla matrice computata delle
// lucine al takeover. ω scelta così che un giro sia percepibile nei ~2s del loader.
const FALLBACK_RADIUS = 30;        // se la matrice CSS è none/degenere (es. stylesheet non applicato)
const OMEGA = (Math.PI * 2) / 3.4; // ~1 giro ogni 3.4s: rotazione lenta ma chiaramente visibile
const WOBBLE_FREQ = 1.1;           // lieve ondulazione condivisa della velocità (mantiene i 120° fissi)
const WOBBLE_AMP = 0.14;
// Finestra (s) su cui il wobble entra da 0 quando GSAP prende lo spin (avvio outro): senza, la sua
// derivata a t=0 (WOBBLE_FREQ·WOBBLE_AMP) aggiungerebbe velocità istantanea alla rotazione, che
// invece deve proseguire alla stessa velocità costante dello spin CSS appena interrotto → niente
// scatto in avanti.
const WOBBLE_RAMP = 1.2;
// Dissolvenza radiale d'uscita dell'overlay: la maschera si apre dal centro con una banda morbida
// (nessun bordo netto), svelando ciò che sta dietro (sfondo piatto in home, contenuto altrove).
const MASK_FEATHER = 50; // ampiezza (%) della banda sfumata: più grande = transizione più morbida
const MASK_END = 130;    // % oltre l'angolo più lontano: garantisce la copertura degli angoli a fine apertura

// Finestra temporale in cui la maschera scopre la pagina: la reveal parte a REVEAL_START e dura
// REVEAL_DURATION (le lucine hanno già raggiunto il centro e si sono spente prima di REVEAL_START,
// così la maschera non le taglia a metà).
const REVEAL_START = 1.5;
const REVEAL_DURATION = 1.2;

// ⬇ UNICA manopola del timing "inizio intro": a che punto del fade-out parte l'entrata della pagina.
// 0 = appena la maschera inizia ad aprirsi, 1 = a maschera del tutto trasparente. A metà (0.5) il
// centro (<40% del raggio) è già scoperto e il gradiente/titolo — centrati — crescono nel varco
// mentre la maschera finisce di aprirsi verso i bordi: overlap voluto, niente sfondo vuoto tra le
// due fasi. onDone/onComplete restano a fine timeline, quindi l'overlay si smonta solo a velo alzato.
const REVEAL_AT = 0.5;

/**
 * Action sul nodo root dell'overlay. Lo spin resta all'animazione CSS (compositor) per TUTTA
 * l'idle: durante il caricamento il main thread è al massimo del carico (hydration, prima draw
 * WebGL del gradiente che compila gli shader) e un clock GSAP lì congelerebbe coi frame per poi
 * recuperare il tempo in un colpo → salto in avanti di qualche frame. All'hydration l'action
 * prende in consegna solo le OPACITÀ (fine della light-appear + twinkle desincronizzato); il
 * transform passa a GSAP solo all'avvio dell'outro — a main thread quieto per costruzione: il
 * gate del loader attende firstFrame del gradiente e i font — per la spirale verso il centro.
 * @param {HTMLElement} node
 * @param {LoadingOrbitParams} [params]
 */
export function loadingOrbit(node, params = {}) {
	let onReveal = params.onReveal;
	let onDone = params.onDone;

	const orbit = /** @type {HTMLElement | null} */ (node.querySelector('.loading-orbit'));
	const lights = /** @type {HTMLElement[]} */ (Array.from(node.querySelectorAll('.loading-light')));
	const n = lights.length;

	/** @param {Element | null} el */
	function computedMatrix(el) {
		const t = el ? getComputedStyle(el).transform : 'none';
		return t && t !== 'none' ? new DOMMatrixReadOnly(t) : null;
	}

	// t = clock in secondi; radiusScale = 1→0 nel collasso finale.
	const state = { t: 0, radiusScale: 1 };

	// Popolati al takeover del transform (avvio outro): render() non è raggiungibile prima
	// (clock e timeline nascono lì dentro).
	let radius = FALLBACK_RADIUS;
	/** @type {number[]} */
	let startAngle = [];

	/** @type {gsap.core.Tween | null} */
	let clock = null;
	/** @type {gsap.core.Tween[]} */
	let twinkles = [];

	function render() {
		// Rotazione condivisa (+ lieve ondulazione): tutte ruotano insieme, spaziatura 120° costante.
		// Il wobble entra da 0 (wobbleGain) così a t=0 la velocità è la sola OMEGA — identica allo
		// spin CSS appena interrotto, senza scatto (posizione già continua perché rot(0)=0).
		const wobbleGain = Math.min(1, state.t / WOBBLE_RAMP);
		const rot = state.t * OMEGA + Math.sin(state.t * WOBBLE_FREQ) * WOBBLE_AMP * wobbleGain;
		const rad = radius * state.radiusScale;
		for (let i = 0; i < n; i++) {
			const ang = startAngle[i] + rot;
			gsap.set(lights[i], { x: Math.cos(ang) * rad, y: Math.sin(ang) * rad });
		}
	}

	let hydrated = false;

	function hydrate() {
		if (hydrated) return;
		hydrated = true;

		// Misura PRIMA di toccare le classi, così il flush di stile legge la light-appear a metà;
		// `is-hydrated` spegne l'animazione delle lucine (fill both: batterebbe le opacity inline).
		// Lo spin del wrapper NON si tocca: continua in CSS sul compositor.
		const startOpacity = lights.map((el) => parseFloat(getComputedStyle(el).opacity) || 0);
		node.classList.add('is-hydrated');
		lights.forEach((el, i) => gsap.set(el, { opacity: startOpacity[i] }));
		// Completa l'accensione se l'hydration cade a metà della light-appear CSS (no-op se già a 1).
		gsap.to(lights, { opacity: 1, duration: 0.3, ease: 'sine.out' });

		if (!params.reducedMotion) {
			// Twinkle soft e desincronizzato (solo opacità, niente scale per non dare senso di
			// "scaling"). Un eventuale stall del main thread qui produce solo un catch-up di
			// opacità: invisibile, nessun salto spaziale.
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
	}

	// rAF: dentro il long task di hydration misura (frame time stale) e commit degli stili (a fine
	// task) hanno basi tempi diverse; nel callback rAF misura, commit e paint condividono lo stesso
	// frame timestamp — handoff atomico.
	const hydrateRafId = requestAnimationFrame(hydrate);

	let outroStarted = false;
	let outroRafId = 0;

	function playOutro() {
		if (outroStarted) return;
		outroStarted = true;
		cancelAnimationFrame(hydrateRafId);
		hydrate();
		twinkles.forEach((t) => t.kill());

		if (params.reducedMotion) {
			const fadeDuration = 0.6;
			const tl = gsap.timeline({ onComplete: () => onDone?.() });
			tl.to(node, { autoAlpha: 0, duration: fadeDuration, ease: 'power1.inOut' });
			// Coerente col ramo animato: l'intro parte a REVEAL_AT del fade dell'overlay, non a fine.
			tl.call(() => onReveal?.(), [], fadeDuration * REVEAL_AT);
			return;
		}

		// Takeover del transform: SOLO ORA GSAP prende rotazione e raggio, per la spirale. In rAF
		// per la stessa atomicità dell'hydrate (misura, commit della classe e paint nello stesso
		// frame); il ritardo di ≤1 frame sull'avvio dell'outro è irrilevante.
		outroRafId = requestAnimationFrame(() => {
			// Angolo corrente dello spin CSS del wrapper: `is-collapsing` lo riporta a identity,
			// quindi phi va assorbito negli angoli per-lucina per non far scattare l'anello.
			const orbitMatrix = computedMatrix(orbit);
			const phi = orbitMatrix ? Math.atan2(orbitMatrix.b, orbitMatrix.a) : 0;

			// La matrice di `rotate(θ) translateY(−r)` ha traslazione (r·sinθ, −r·cosθ): hypot =
			// raggio (è così che il clamp() responsive di --orbit-radius arriva risolto in px),
			// atan2 = angolo polare di partenza. Con t che parte da 0 il wobble vale 0: nessuno scatto.
			startAngle = lights.map((el, i) => {
				const m = computedMatrix(el);
				if (!m || (m.e === 0 && m.f === 0)) return (i / Math.max(n, 1)) * Math.PI * 2;
				radius = Math.hypot(m.e, m.f);
				return Math.atan2(m.f, m.e) + phi;
			});

			// Handoff atomico (stesso tick → un solo recalc): la classe spegne lo spin CSS (che
			// batterebbe gli inline style) e render() ripianta le stesse posizioni via GSAP.
			node.classList.add('is-collapsing');
			render();

			// Clock monotòno: t avanza di 1 unità/secondo — le lucine continuano a girare alla
			// STESSA velocità mentre il raggio si riduce → spirale dolce che confluisce al centro,
			// niente vortice accelerato.
			clock = gsap.to(state, { t: 1e6, duration: 1e6, ease: 'none', onUpdate: render });

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
			// (MASK_FEATHER) evita il bordo netto e dà un'apertura fluida. Parte a REVEAL_START, quando le
			// lucine hanno già raggiunto il centro e si sono spente, così la maschera non le taglia a metà.
			const reveal = { p: 0 };
			tl.to(reveal, {
				p: 1,
				duration: REVEAL_DURATION,
				ease: 'power2.inOut',
				onUpdate: () => {
					const inner = -MASK_FEATHER + (MASK_END + MASK_FEATHER) * reveal.p;
					const outer = inner + MASK_FEATHER;
					const mask = `radial-gradient(circle at 50% 50%, transparent ${inner}%, #000 ${outer}%)`;
					// Autoprefixer non processa gli stili inline/JS: prefisso -webkit- manuale, prima dello standard.
					node.style.webkitMaskImage = mask;
					node.style.maskImage = mask;
				}
			}, REVEAL_START);

			// L'entrata della pagina (es. introReveal) parte a REVEAL_AT del fade-out: in overlap con la
			// maschera che finisce di aprirsi, così l'intro cresce nel centro già scoperto invece di
			// comparire dopo un vuoto. Posizione assoluta sulla timeline, non appesa alla fine.
			tl.call(() => onReveal?.(), [], REVEAL_START + REVEAL_DURATION * REVEAL_AT);
		});
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
			cancelAnimationFrame(hydrateRafId);
			cancelAnimationFrame(outroRafId);
			clock?.kill();
			twinkles.forEach((t) => t.kill());
			gsap.killTweensOf([node, ...lights, state]);
		}
	};
}
