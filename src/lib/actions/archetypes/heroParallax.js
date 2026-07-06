import { gsap } from '$lib/utils/gsapSetup.js';
import { onLoadingComplete } from '$lib/stores/loadingState.svelte.js';
import { heroExit } from '$lib/stores/heroExit.svelte.js';
import { navigationState } from '$lib/stores/navigationState.svelte.js';

/**
 * Action per l'effetto fade reveal d'entrata del titolo nella Hero,
 * seguita dall'effetto parallasse scroll-driven.
 * Entrambe le fasi sono gestite interamente da GSAP per garantire
 * affidabilità su hard load e navigazioni client-side.
 *
 * @param {HTMLElement} node - L'elemento del titolo da animare.
 * @param {Object} [params] - I parametri dell'animazione.
 * @param {HTMLElement | null} [params.trigger] - L'elemento contenitore che fa da trigger per lo scroll.
 * @param {number} [params.duration] - Durata dell'animazione di entrata in secondi (default: 0.5)
 * @param {number} [params.blur] - Livello di sfocatura iniziale in pixel (default: 4)
 */
export function heroParallax(node, params = {}) {
	const triggerElement = params.trigger;
	if (!triggerElement) return;

	const duration = params.duration ?? 0.5;
	const blurVal = params.blur ?? 4;

	// Commento solo il PERCHÉ: applicato sincrono al mount (prima del paint) per prevenire FOUC —
	// il titolo viene nascosto e sfocato usando i valori dei design token, senza spostamento verticale.
	gsap.set(node, { opacity: 0, filter: `blur(${blurVal}px)` });

	/** @type {gsap.core.Tween | null} */
	let entryTween = null;
	/** @type {gsap.Context | null} */
	let scrollCtx = null;
	/** @type {(() => void) | null} */
	let disposeGate = null;

	// Commento solo il PERCHÉ: onLoadingComplete si attiva quando il loader alza il velo (hard load)
	// oppure immediatamente (navigazione client-side, flag già true). GSAP è affidabile in entrambi
	// i contesti perché non dipende da timing CSS o paint tick come le CSS transition.
	disposeGate = onLoadingComplete(() => {
		// Commento solo il PERCHÉ: l'utente ha richiesto che il titolo entrante appaia a METÀ
		// della transizione del gradiente, per un effetto di compenetrazione più morbido.
		// La transizione del gradiente dura 0.8s, quindi la metà è 0.4s.
		// Se veniamo dalla Home, il gradiente parte a 0.6s -> il titolo entra a 1.0s.
		// Altrimenti, il gradiente parte a 0.3s -> il titolo entra a 0.7s.
		// Se è un hard load, nessun ritardo.
		let delay = 0;
		if (navigationState.hasNavigated) {
			const gradientStart = navigationState.fromHome ? 0.6 : 0.3;
			delay = gradientStart + 0.4; // attende metà della transizione del gradiente
		}

		entryTween = gsap.to(node, {
			opacity: 1,
			filter: 'blur(0px)',
			duration,
			delay,
			ease: 'power2.out',
			onComplete: () => {
				// Commento solo il PERCHÉ: lo ScrollTrigger viene inizializzato solo dopo che l'entrata
				// è completata per evitare conflict di ownership tra il tween di entrata e lo scrub.
				// gsap.context isola i tween e li distrugge atomicamente nel destroy().
				scrollCtx = gsap.context(() => {
					gsap.fromTo(node,
						{ opacity: 1, y: 0 },
						{
							opacity: 0,
							y: -50,
							scrollTrigger: {
								trigger: triggerElement,
								start: 'top top',
								end: 'bottom 50%',
								scrub: true
							}
						}
					);
				}, node);

				// Commento solo il PERCHÉ: registriamo la funzione in heroExit che verrà chiamata dal layout
				// in onNavigate, *prima* che Svelte smonti la pagina. Questo garantisce che getBoundingClientRect()
				// restituisca valori esatti e che il container non sia ancora collassato (evitando rect nulli).
				// Creiamo un clone ("fantasma") del titolo in position:fixed per animarlo in uscita 
				// parallelamente alla transizione del gradiente senza bloccare SvelteKit.
				heroExit.register(() => {
					const currentOpacity = /** @type {number} */ (gsap.getProperty(node, 'opacity'));
					if (currentOpacity < 0.05) return Promise.resolve();

					const rect = node.getBoundingClientRect();
					const clone = /** @type {HTMLElement} */ (node.cloneNode(true));
					
					// Rimuoviamo il transform dal clone perché rect.top/left includono già lo spostamento di scroll,
					// applicandolo eviteremmo di raddoppiare la traslazione GSAP.
					clone.style.transform = 'none';
					
					Object.assign(clone.style, {
						position: 'fixed',
						top: `${rect.top}px`,
						left: `${rect.left}px`,
						width: `${rect.width}px`,
						height: `${rect.height}px`,
						margin: '0',
						zIndex: '9999',
						pointerEvents: 'none'
					});
					
					document.body.appendChild(clone);

					gsap.to(clone, {
						opacity: 0,
						filter: `blur(${blurVal}px)`,
						duration: 0.3,
						ease: 'power2.in',
						onComplete: () => clone.remove()
					});

					// Ritorniamo undefined sincrono (non Promise) così onNavigate non viene bloccato!
					return Promise.resolve();
				});
			}
		});
	});

	return {
		destroy() {
			heroExit.clear();
			if (disposeGate) disposeGate();
			if (entryTween) entryTween.kill();
			if (scrollCtx) scrollCtx.revert();
		}
	};
}
