import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';
import { DEFAULT_CONFIG } from '$lib/utils/interactiveGradientRenderer.js';
import { getLenis, lockScrollDown, unlockScrollDown } from '$lib/stores/lenis.svelte.js';
import { navigationState } from '$lib/stores/navigationState.svelte.js';

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

	const ctx = gsap.context(() => {
		const tl = gsap.timeline({
			defaults: { ease: 'power2.out' },
			onComplete: () => { introRevealed = true; }
		});

		// Commento solo il PERCHÉ: Anima la crescita del raggio della sfera gradiente da 0 al raggio intro configurato, in sincrono con l'ingresso dei cerchi geometrici.
		const canvas = /** @type {any} */ (document.querySelector('.interactive-gradient-canvas'));
		const gradientRenderer = canvas?.__gradientRenderer;

		// Commento solo il PERCHÉ: i raggi target sono letti dalle config (unica fonte di verità)
		// anziché hardcoded qui: così modificare focusRadius nello store/DEFAULT_CONFIG ridimensiona
		// davvero la sfera, senza essere sovrascritto dai tween di questa action.
		/** @param {number | number[]} fr */
		const toRxRy = (fr) => (Array.isArray(fr) ? [fr[0], fr[1]] : [fr, fr]);
		const introRadius = () => toRxRy(gradientRenderer?.config?.focusRadius ?? 0.25);

		if (gradientRenderer) {
			const u = gradientRenderer.material.uniforms;
			u.u_focus.value.z = 0.0;
			u.u_focus.value.w = 0.0;
			const [rx, ry] = introRadius();
			const proxy = gradientRenderer.getAnimatableState();
			tl.to(proxy, {
				focusRx: rx,
				focusRy: ry,
				duration: 1.8,
				onUpdate: () => gradientRenderer.applyAnimatableState(proxy)
			}, 0);
		}

		tl.from(node.querySelectorAll('.intro-circle'), {
			opacity: 0,
			scale: 0.7,
			transformOrigin: 'center center',
			stagger: 0.18,
			duration: 1.2
		});

		tl.from(
			node.querySelector('.intro-title'),
			{ opacity: 0, yPercent: 15, duration: 1.6 },
			'-=0.4'
		);

		tl.from(
			node.querySelector('.scroll-hint'),
			{ opacity: 0, y: 12, duration: 1.0 },
			'+=0'
		);

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



		// Commento solo il PERCHÉ: Crea una rotazione continua e sfasata dei cerchi per generare un dinamismo geometrico e cinetico tridimensionale
		const innerCircle = node.querySelector('.circle-inner');
		const middleCircle = node.querySelector('.circle-middle');
		const outerCircle = node.querySelector('.circle-outer');

		if (innerCircle) {
			gsap.to(innerCircle, {
				rotation: 360,
				duration: 110,
				repeat: -1,
				ease: 'none',
				transformOrigin: 'center center'
			});
		}
		if (middleCircle) {
			gsap.to(middleCircle, {
				rotation: -360,
				duration: 160,
				repeat: -1,
				ease: 'none',
				transformOrigin: 'center center'
			});
		}
		if (outerCircle) {
			gsap.to(outerCircle, {
				rotation: 360,
				duration: 220,
				repeat: -1,
				ease: 'none',
				transformOrigin: 'center center'
			});
		}

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

			activeTimeline = gsap.timeline({
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

			const introCircles = node.querySelectorAll('.intro-circle');
			const introTitle = node.querySelector('.intro-title');
			const scrollHintEl = node.querySelector('.scroll-hint');

			if (introCircles.length > 0) {
				activeTimeline.to(introCircles, {
					opacity: 0,
					scale: 1.3,
					transformOrigin: 'center center',
					stagger: 0.05,
					duration: 0.8,
					ease: 'power2.inOut'
				}, 0);
			}

			if (introTitle) {
				activeTimeline.to(introTitle, {
					opacity: 0,
					yPercent: -15,
					duration: 0.8,
					ease: 'power2.inOut'
				}, 0);
			}

			if (scrollHintEl) {
				activeTimeline.to(scrollHintEl, {
					opacity: 0,
					y: 20,
					duration: 0.6,
					ease: 'power2.inOut'
				}, 0);
			}

			// Commento solo il PERCHÉ: il raggio d'uscita coincide con lo stato hero/body, che lo store
			// eredita da DEFAULT_CONFIG.focusRadius non specificandolo: lo leggiamo da lì invece di duplicarlo.
			if (gradientRenderer) {
				const [exitRx, exitRy] = toRxRy(DEFAULT_CONFIG.focusRadius);
				const proxy = gradientRenderer.getAnimatableState();
				activeTimeline.to(proxy, {
					focusRx: exitRx,
					focusRy: exitRy,
					coverage: 0.35,
					duration: 0.8,
					ease: 'power2.inOut',
					onUpdate: () => gradientRenderer.applyAnimatableState(proxy)
				}, 0);
			}
		}

		function triggerEntry() {
			if (isTransitioning) return;
			isTransitioning = true;
			// Finché l'entrata non è ricompletata, l'uscita resta gatata.
			introRevealed = false;

			if (activeTimeline) activeTimeline.kill();

			activeTimeline = gsap.timeline({
				onComplete: () => {
					isTransitioning = false;
					introRevealed = true;
				}
			});

			const introCircles = node.querySelectorAll('.intro-circle');
			const introTitle = node.querySelector('.intro-title');
			const scrollHintEl = node.querySelector('.scroll-hint');

			// Commento solo il PERCHÉ: Fa rientrare per primo il gradiente stringendolo al centro al raggio intro configurato.
			if (gradientRenderer) {
				const [rx, ry] = introRadius();
				const proxy = gradientRenderer.getAnimatableState();
				activeTimeline.to(proxy, {
					focusRx: rx,
					focusRy: ry,
					coverage: 1.0,
					duration: 0.8,
					ease: 'power2.out',
					onUpdate: () => gradientRenderer.applyAnimatableState(proxy)
				}, 0);
			}

			// Commento solo il PERCHÉ: Mostra i cerchi rientrandoli da una scala maggiore di 1.2 per dare un senso di ri-condensazione geometrica (inizia a 0.6s).
			if (introCircles.length > 0) {
				activeTimeline.fromTo(introCircles,
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

			// Commento solo il PERCHÉ: Fa ricomparire i testi solo dopo che i cerchi sono quasi del tutto comparsi per creare una sequenza di svelamento logico-spaziale (inizia a 1.2s/1.5s).
			if (introTitle) {
				activeTimeline.fromTo(introTitle,
					{ opacity: 0, yPercent: 15 },
					{
						opacity: 1,
						yPercent: 0,
						duration: 1.4,
						ease: 'power2.out'
					},
					1.2
				);
			}

			if (scrollHintEl) {
				activeTimeline.fromTo(scrollHintEl,
					{ opacity: 0, y: 12 },
					{
						opacity: 1,
						y: 0,
						duration: 1.0,
						ease: 'power2.out'
					},
					1.5
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
	}, node);

	return {
		destroy() {
			unlockScrollDown();
			ctx.revert();
		}
	};
}


