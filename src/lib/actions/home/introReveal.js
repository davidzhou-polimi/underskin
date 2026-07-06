import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';
import { DEFAULT_CONFIG } from '$lib/utils/interactiveGradientRenderer.js';
import { getLenis, lockScrollDown, unlockScrollDown } from '$lib/stores/lenis.svelte.js';
import { navigationState } from '$lib/stores/navigationState.svelte.js';
import { introFocusRadius } from '$lib/stores/scrollGradient.svelte.js';
import { onLoadingComplete } from '$lib/stores/loadingState.svelte.js';
import { heroExit } from '$lib/stores/heroExit.svelte.js';

/**
 * @param {HTMLElement} node
 */
export function introReveal(node) {

	// Commento solo il PERCHÉ: quando si arriva da un archetipo il posizionamento lo gestisce cinematicScroll,
	// quindi l'intro non deve bloccare lo scroll né attivarsi.
	const fromArchetype = navigationState.fromArchetype;

	let isLocked = !fromArchetype && (typeof window !== 'undefined' ? window.scrollY < 10 : true);
	let isTransitioning = false;
	// L'uscita è abilitata solo quando l'animazione di entrata è completa (lo scroll-hint è comparso).
	let introRevealed = false;

	/** @type {gsap.core.Timeline | null} */
	let activeTimeline = null;

	// Dispose dell'$effect.root che avvia l'intro quando il loader alza il velo (vedi in fondo a ctx).
	/** @type {(() => void) | null} */
	let disposeGate = null;

	// Hold su gsap.ticker che tiene il focus del gradiente a 0 finché il loader copre lo schermo
	// (vedi blocco più sotto). Dichiarato qui per poterlo rimuovere anche nel destroy().
	/** @type {(() => void) | null} */
	let holdFocus = null;

	// Commento solo il PERCHÉ: dichiarato fuori da gsap.context per essere accessibile nel destroy().
	// Su mobile (max-width: 768px) la callback non viene mai eseguita, quindi i tween non esistono.
	const mm = gsap.matchMedia();

	const ctx = gsap.context(() => {
		// paused: l'entrata non parte al mount ma quando il loader alza il velo (loadingState.complete),
		// così l'intro non si "pre-gioca" coperta dall'overlay. Sui carichi senza loader (navigazioni
		// client-side) il flag è già true e l'$effect avvia subito.
		const tl = gsap.timeline({
			paused: true,
			defaults: { ease: 'power2.out' },
			onComplete: () => {
				introRevealed = true;
			}
		});

		// Commento solo il PERCHÉ: Anima la crescita del raggio della sfera gradiente da 0 al raggio intro configurato, in sincrono con l'ingresso dei cerchi geometrici.
		const canvas = /** @type {any} */ (document.querySelector('.interactive-gradient-canvas'));
		const gradientRenderer = canvas?.__gradientRenderer;

		// Il raggio d'uscita/exit deriva da DEFAULT_CONFIG.focusRadius (stato hero/body); toRxRy lo normalizza.
		// Il raggio intro viene invece da introFocusRadius() (fonte unica), indipendente dal timing di
		// applicazione della config: al mount renderer.config potrebbe non essere ancora la config intro.
		/** @param {number | number[]} fr */
		const toRxRy = (fr) => (Array.isArray(fr) ? [fr[0], fr[1]] : [fr, fr]);

		// Commento solo il PERCHÉ: l'intro possiede il focus (crescita da 0) solo al primo atterraggio.
		// Arrivando alla home da un'altra pagina il canvas è persistente e il focus lo anima già
		// transitionConfig (morph fluido dallo stato precedente): resettarlo a 0 qui sarebbe uno scatto.
		// Animiamo SOLO u_focus (mai lo stato pieno via applyAnimatableState) per non ridipingere i colori.
		if (gradientRenderer && !navigationState.hasNavigated) {
			const u = gradientRenderer.material.uniforms;
			u.u_focus.value.z = 0.0;
			u.u_focus.value.w = 0.0;
			const [rx, ry] = introFocusRadius();
			const p = { rx: 0, ry: 0 };
			tl.to(p, {
				rx,
				ry,
				duration: 1.8,
				onUpdate: () => { u.u_focus.value.z = p.rx; u.u_focus.value.w = p.ry; }
			}, 0);

			// Commento solo il PERCHÉ: la timeline è in pausa finché il loader copre lo schermo, ma nel
			// frattempo l'$effect di (app)/+page.svelte pubblica la config intro (focusRadius 0.24) che
			// interactiveGradient applica istantaneamente al primo update: senza contromisure la sfera
			// resta cresciuta dietro l'overlay e, quando l'overlay si dissolve, appare già grande per poi
			// collassare di scatto alla ripartenza. Pinniamo il focus a 0 ad ogni frame finché l'entrata
			// non parte: introReveal resta l'unico proprietario del focus durante l'attesa, così alla
			// scomparsa del loader il gradiente è collassato e cresce da 0 con l'intro.
			holdFocus = () => { u.u_focus.value.z = 0.0; u.u_focus.value.w = 0.0; };
			gsap.ticker.add(holdFocus);
		}

		// I .intro-circle e lo .scroll-hint usano tl.from(): con immediateRender:true applica lo stato
		// "from" (opacity:0 ecc.) già alla creazione — anche a timeline in pausa — quindi non lampeggiano
		// sotto il loader. NON pre-nasconderli con gsap.set: un set a opacity:0 prima del from farebbe
		// catturare al from il valore d'arrivo sbagliato (0), lasciandoli invisibili per sempre.
		tl.from(node.querySelectorAll('.intro-circle'), {
			opacity: 0,
			scale: 0.7,
			transformOrigin: 'center center',
			stagger: 0.18,
			duration: 1.2
		});

		const letters = node.querySelectorAll('.intro-letter');
		if (letters.length > 0) {
			// Stato nascosto applicato SUBITO: le tl.set a t=0 non fanno immediate-render con la
			// timeline in pausa, quindi senza questo le lettere lampeggerebbero visibili prima del play.
			gsap.set(letters, { y: 12, xPercent: 0, '--blur-val': '12px', opacity: 0 });

			const centerIdx = (letters.length - 1) / 2;
			letters.forEach((letter, idx) => {
				const offset = idx - centerIdx;
				const delay = Math.abs(offset) * 0.08; // Lo stagger parte dal centro verso l'esterno

				tl.set(letter, {
					y: 12,
					xPercent: 0,
					'--blur-val': '12px',
					opacity: 0
				}, 0);

				// Commento solo il PERCHÉ: Fa salire le lettere dal basso facendole comparire a fuoco a partire dal centro verso l'esterno.
				tl.to(letter, {
					y: 0,
					'--blur-val': '0px',
					opacity: 1,
					duration: 1.4,
					ease: 'power3.out'
				}, 1.16 + delay);
			});
		}

		tl.from(
			node.querySelector('.scroll-hint'),
			{ opacity: 0, y: 12, duration: 1.0 },
			'+=0'
		);

		// Commento solo il PERCHÉ: registriamo l'uscita in heroExit per le navigazioni cross-route via menu.
		// Permette all'intro di sfumare elegantemente in parallelo con il gradiente senza bloccare SvelteKit,
		// esattamente come i titoli interni (heroParallax).
		heroExit.register(() => {
			// Se il nodo è già nascosto dallo scroll (o dal triggerExit interno), evitiamo l'animazione inutile.
			const nodeOpacity = /** @type {number} */ (gsap.getProperty(node, 'opacity'));
			if (nodeOpacity < 0.05) return Promise.resolve();

			const rect = node.getBoundingClientRect();
			const clone = /** @type {HTMLElement} */ (node.cloneNode(true));
			
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
				filter: `blur(4px)`,
				duration: 0.3,
				ease: 'power2.in',
				onComplete: () => clone.remove()
			});

			return Promise.resolve();
		});

		// Commento solo il PERCHÉ: Riproduce il gesto dello scrolling della rotellina tramite una timeline sinusoidale con pausa ritmica
		const mouseWheel = node.querySelector('.mouse-wheel');
		if (mouseWheel) {
			const wheelTl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
			wheelTl.fromTo(mouseWheel,
				{ y: 0 },
				{ y: 8, duration: 1.2, ease: 'sine.inOut' }
			);
			wheelTl.fromTo(mouseWheel,
				{ opacity: 0 },
				{ opacity: 1, duration: 0.4, ease: 'sine.inOut' },
				0
			);
			wheelTl.to(mouseWheel,
				{ opacity: 0, duration: 0.4, ease: 'sine.inOut' },
				0.8
			);
		}



		// Commento solo il PERCHÉ: la rotazione sfasata dei 3 cerchi è solo desktop — su mobile non esiste
		// un cursore che interagisce e il costo GPU non è giustificato. gsap.matchMedia reverta
		// automaticamente i tween (azzerando la rotazione) quando si ridimensiona verso mobile.
		const innerCircle = node.querySelector('.circle-inner');
		const middleCircle = node.querySelector('.circle-middle');
		const outerCircle = node.querySelector('.circle-outer');

		mm.add('(min-width: 769px)', () => {
			if (innerCircle)  gsap.to(innerCircle,  { rotation: 360,  duration: 110, repeat: -1, ease: 'none', transformOrigin: 'center center' });
			if (middleCircle) gsap.to(middleCircle, { rotation: -360, duration: 160, repeat: -1, ease: 'none', transformOrigin: 'center center' });
			if (outerCircle)  gsap.to(outerCircle,  { rotation: 360,  duration: 220, repeat: -1, ease: 'none', transformOrigin: 'center center' });
		});

		const circlesSvg = node.querySelector('.circles-svg');

		// Commento solo il PERCHÉ: centra inizialmente l'SVG dei cerchi concentrici nello schermo
		if (circlesSvg) {
			gsap.set(circlesSvg, { xPercent: -50, yPercent: -50 });
		}

		function triggerExit() {
			if (isTransitioning) return;
			isTransitioning = true;

			// Difensivo: chiude la timeline d'entrata per evitare conflitti di tween con l'uscita.
			tl.kill();
			if (activeTimeline) activeTimeline.kill();

			const timeline = gsap.timeline({
				onComplete: () => {
					isTransitioning = false;
					unlock();
					// Commento solo il PERCHÉ: riposiziona a 105px per aggiornare lo store del gradiente e sbloccare
					// lo scorrimento normale; force perché Lenis è appena ripartito e immediate evita lo scatto animato.
					const lenis = getLenis();
					if (lenis) lenis.scrollTo(105, { immediate: true, force: true });
					else window.scrollTo(0, 105);
				}
			});
			activeTimeline = timeline;

			const introCircles = node.querySelectorAll('.intro-circle');
			const introTitle = node.querySelector('.intro-title');
			const scrollHintEl = node.querySelector('.scroll-hint');

			if (introCircles.length > 0) {
				timeline.to(introCircles, {
					opacity: 0,
					scale: 1.3,
					transformOrigin: 'center center',
					stagger: 0.05,
					duration: 0.8,
					ease: 'power2.inOut'
				}, 0);
			}

			const letters = node.querySelectorAll('.intro-letter');
			if (letters.length > 0) {
				const centerIdx = (letters.length - 1) / 2;
				letters.forEach((letter, idx) => {
					const offset = idx - centerIdx;
					const delay = (centerIdx - Math.abs(offset)) * 0.05; // Gli estremi partono per primi, il centro per ultimo

					// Commento solo il PERCHÉ: Fa salire le lettere verso l'alto dissolvendole a partire dai bordi esterni verso il centro.
					timeline.to(letter, {
						y: -12,
						xPercent: 0,
						'--blur-val': '8px',
						opacity: 0,
						duration: 0.8,
						ease: 'power3.inOut'
					}, delay);
				});
			}

			if (scrollHintEl) {
				timeline.to(scrollHintEl, {
					opacity: 0,
					y: 20,
					duration: 0.6,
					ease: 'power2.inOut'
				}, 0);
			}

			// Commento solo il PERCHÉ: il raggio d'uscita coincide con lo stato hero/body, che lo store
			// eredita da DEFAULT_CONFIG.focusRadius non specificandolo: lo leggiamo da lì invece di duplicarlo.
			// Animiamo SOLO u_focus e u_coverage (non lo stato pieno) per non ridipingere i colori.
			if (gradientRenderer) {
				const u = gradientRenderer.material.uniforms;
				const [exitRx, exitRy] = toRxRy(DEFAULT_CONFIG.focusRadius);
				const p = { rx: u.u_focus.value.z, ry: u.u_focus.value.w, cov: u.u_coverage.value };
				timeline.to(p, {
					rx: exitRx,
					ry: exitRy,
					cov: 0.35,
					duration: 0.8,
					ease: 'power2.inOut',
					onUpdate: () => { u.u_focus.value.z = p.rx; u.u_focus.value.w = p.ry; u.u_coverage.value = p.cov; }
				}, 0);
			}
		}

		function triggerEntry() {
			if (isTransitioning) return;
			isTransitioning = true;
			// Finché l'entrata non è ricompletata, l'uscita resta gatata.
			introRevealed = false;

			if (activeTimeline) activeTimeline.kill();

			const timeline = gsap.timeline({
				onComplete: () => {
					isTransitioning = false;
					introRevealed = true;
				}
			});
			activeTimeline = timeline;

			const introCircles = node.querySelectorAll('.intro-circle');
			const introTitle = node.querySelector('.intro-title');
			const scrollHintEl = node.querySelector('.scroll-hint');

			// Commento solo il PERCHÉ: Fa rientrare per primo il gradiente stringendolo al centro al raggio intro.
			// Animiamo SOLO u_focus e u_coverage (non lo stato pieno) per non ridipingere i colori.
			if (gradientRenderer) {
				const u = gradientRenderer.material.uniforms;
				const [rx, ry] = introFocusRadius();
				const p = { rx: u.u_focus.value.z, ry: u.u_focus.value.w, cov: u.u_coverage.value };
				timeline.to(p, {
					rx,
					ry,
					cov: 1.0,
					duration: 0.8,
					ease: 'power2.out',
					onUpdate: () => { u.u_focus.value.z = p.rx; u.u_focus.value.w = p.ry; u.u_coverage.value = p.cov; }
				}, 0);
			}

			// Commento solo il PERCHÉ: Mostra i cerchi rientrandoli da una scala maggiore di 1.2 per dare un senso di ri-condensazione geometrica (inizia a 0.6s).
			if (introCircles.length > 0) {
				timeline.fromTo(introCircles,
					{ opacity: 0, scale: 1.2 },
					{
						opacity: 1,
						scale: 1,
						transformOrigin: 'center center',
						stagger: 0.08,
						duration: 0.8,
						ease: 'power2.out'
					},
					0.6
				);
			}

			// Commento solo il PERCHÉ: Fa ricomparire i testi solo dopo che i cerchi sono quasi del tutto comparsi per creare una sequenza di svelamento logico-spaziale (inizia a 1.2s/2.2s).
			const letters = node.querySelectorAll('.intro-letter');
			if (letters.length > 0) {
				const centerIdx = (letters.length - 1) / 2;
				letters.forEach((letter, idx) => {
					const offset = idx - centerIdx;
					const delay = Math.abs(offset) * 0.08;

					timeline.set(letter, {
						y: 12,
						xPercent: 0,
						'--blur-val': '12px',
						opacity: 0
					}, 1.2);

					// Commento solo il PERCHÉ: Fa risalire le lettere dal basso svelandole a partire dal centro del titolo durante il rientro.
					timeline.to(letter, {
						y: 0,
						'--blur-val': '0px',
						opacity: 1,
						duration: 1.4,
						ease: 'power3.out'
					}, 1.2 + delay);
				});
			}

			if (scrollHintEl) {
				timeline.fromTo(scrollHintEl,
					{ opacity: 0, y: 12 },
					{
						opacity: 1,
						y: 0,
						duration: 1.0,
						ease: 'power2.out'
					},
					2.2
				);
			}
		}

		// Commento solo il PERCHÉ: stesso meccanismo dei giochini — lock direzionale verso il basso in fase
		// capture (niente lenis.stop(), che lascerebbe la scrollbar limitata al viewport e un blocco non
		// affidabile). La callback rileva l'intento di scendere e fa partire l'uscita, ma solo dopo che lo
		// scroll-hint è comparso (entrata completata). In cima alla pagina lo scroll-su è comunque inerte.
		function lock() {
			isLocked = true;
			lockScrollDown(() => {
				if (isLocked && introRevealed && !isTransitioning) triggerExit();
			});
		}

		function unlock() {
			isLocked = false;
			unlockScrollDown();
		}

		// Lo stato iniziale del lock dipende dalla posizione di scroll al mount (e non da fromArchetype).
		if (isLocked) lock();

		ScrollTrigger.create({
			trigger: node,
			start: 'top top',
			end: 'top -10',
			onEnterBack: () => {
				// Commento solo il PERCHÉ: evita di riattivare il blocco intro se si arriva da un archetipo
				if (navigationState.fromArchetype) return;
				lock();
				triggerEntry();
			}
		});

		// Avvia l'entrata quando il loader alza il velo. La reattività al flag vive nello store
		// (.svelte.js, dove le rune sono valide); qui la consumiamo come callback one-shot.
		disposeGate = onLoadingComplete(() => {
			// Rilascia il pin del focus (era a 0 durante l'attesa): da qui il tween d'entrata ne diventa
			// l'unico scrittore e lo fa crescere 0→raggio intro senza collasso. Va tolto PRIMA di play().
			if (holdFocus) {
				gsap.ticker.remove(holdFocus);
				holdFocus = null;
			}
			tl.play();
		});
	}, node);

	return {
		destroy() {
			heroExit.clear();
			if (disposeGate) disposeGate();
			if (holdFocus) gsap.ticker.remove(holdFocus);
			unlockScrollDown();
			mm.revert();
			// Commento solo il PERCHÉ: kill() ferma tutti i tween e pulisce gli ScrollTrigger del
			// contesto senza ripristinare nessuna proprietà al valore iniziale. A differenza di revert(),
			// non riporta u_focus a 0 (il valore "from" del tween di primo caricamento), lasciando il
			// gradiente WebGL alla sua dimensione corrente durante la transizione verso la pagina successiva.
			// I nodi DOM (cerchi, lettere) vengono smontati da SvelteKit comunque: non serve reverting.
			ctx.kill();
		}
	};
}


