import { gsap } from '$lib/utils/gsapSetup.js';

/**
 * Cenno di swipe sulla card attiva del carosello atleti (mobile, al posto dell'autoplay):
 * al primo reveal la card in cima si sporge verso destra e rientra, suggerendo il gesto.
 * Suona una sola volta per atterraggio e muore al primo tocco sul track — da lì in poi
 * il controllo è dell'utente.
 *
 * @param {HTMLElement} node - Il track del carosello (.carousel-track)
 * @param {{ active?: boolean, getIndex?: () => number }} [params]
 */
export function athleteSwipeHint(node, params = {}) {
	let active = params.active ?? false;
	let getIndex = params.getIndex;
	let played = false;
	/** @type {Element | null} */
	let hintCard = null;
	/** @type {gsap.core.Timeline | null} */
	let tl = null;
	/** @type {gsap.core.Tween | null} */
	let delayCall = null;

	const play = () => {
		delayCall = null;
		hintCard = node.querySelectorAll('.carousel-item')[getIndex ? getIndex() : 0] ?? null;
		if (!hintCard) return;
		// Sporgenza rapida e rientro più lento con una punta di rotazione: la stessa cinematica
		// dello sfoglio reale (carousel.js specchia x e rotation insieme), così il cenno si legge
		// come anteprima del gesto e non come glitch.
		tl = gsap.timeline({ onComplete: () => { tl = null; } });
		tl.to(hintCard, { x: 48, rotation: 4, duration: 0.5, ease: 'power2.out' })
		  .to(hintCard, { x: 0, rotation: 0, duration: 0.7, ease: 'power3.inOut' }, '+=0.15');
	};

	const schedule = () => {
		if (played) return;
		played = true;
		// Respiro dopo il crossfade di reveal: il cenno parte a scena ferma, non dentro la dissolvenza.
		delayCall = gsap.delayedCall(0.8, play);
	};

	const cancel = () => {
		if (delayCall) { delayCall.kill(); delayCall = null; }
		if (tl) {
			tl.kill();
			tl = null;
			// Rientro esplicito: un tap o uno scroll verticale non fanno passare il layout del
			// carosello (che scrive x solo al cambio di indice) e la card resterebbe sporgente.
			if (hintCard) gsap.to(hintCard, { x: 0, rotation: 0, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
		}
	};

	const onTouchStart = () => {
		played = true;
		cancel();
	};
	node.addEventListener('touchstart', onTouchStart, { passive: true });

	if (active) schedule();

	return {
		/** @param {{ active?: boolean, getIndex?: () => number }} newParams */
		update(newParams) {
			getIndex = newParams.getIndex;
			const newActive = newParams.active ?? false;
			if (newActive && !active) schedule();
			active = newActive;
		},
		destroy() {
			node.removeEventListener('touchstart', onTouchStart);
			cancel();
		}
	};
}
