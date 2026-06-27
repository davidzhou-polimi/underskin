import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/**
 * @param {HTMLElement} node
 */
export function introReveal(node) {
	let isIntroActive = true;
	/** @type {((e: MouseEvent) => void) | undefined} */
	let handleMouseMove;
	/** @type {(() => void) | undefined} */
	let handleMouseLeave;

	/** @type {((e: WheelEvent) => void) | undefined} */
	let handleWheel;
	/** @type {((e: TouchEvent) => void) | undefined} */
	let handleTouchStart;
	/** @type {((e: TouchEvent) => void) | undefined} */
	let handleTouchMove;

	let isLocked = typeof window !== 'undefined' ? window.scrollY < 10 : true;
	let isTransitioning = false;
	let startY = 0;

	/** @type {gsap.core.Timeline | null} */
	let activeTimeline = null;

	const ctx = gsap.context(() => {
		const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

		// Commento solo il PERCHÉ: Anima la crescita del raggio della sfera gradiente da 0 a 0.25 all'avvio in sincrono con l'ingresso dei cerchi geometrici.
		const canvas = /** @type {any} */ (document.querySelector('.interactive-gradient-canvas'));
		const gradientRenderer = canvas?.__gradientRenderer;
		if (gradientRenderer) {
			const u = gradientRenderer.material.uniforms;
			u.u_focus.value.z = 0.0;
			u.u_focus.value.w = 0.0;
			const proxy = gradientRenderer.getAnimatableState();
			tl.to(proxy, {
				focusRx: 0.25,
				focusRy: 0.25,
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
			node.querySelector('.scroll-hint-content'),
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

		// Commento solo il PERCHÉ: Crea una pulsazione sinusoidale sulla label che dura esattamente il doppio del ciclo del mouse (3.6s complessivi) per evitare sfarfallii e rendere il ritmo calmo ed elegante
		const scrollLabel = node.querySelector('.scroll-label');
		if (scrollLabel) {
			gsap.fromTo(scrollLabel,
				{ opacity: 0.6 },
				{
					opacity: 0.3,
					duration: 1.8,
					repeat: -1,
					yoyo: true,
					ease: 'sine.inOut'
				}
			);
		}

		// Commento solo il PERCHÉ: Crea una rotazione continua e sfasata dei cerchi per generare un dinamismo geometrico e cinetico tridimensionale
		const innerCircle = node.querySelector('.circle-inner');
		const middleCircle = node.querySelector('.circle-middle');
		const outerCircle = node.querySelector('.circle-outer');

		if (innerCircle) {
			gsap.to(innerCircle, {
				rotation: 360,
				duration: 140,
				repeat: -1,
				ease: 'none',
				transformOrigin: 'center center'
			});
		}
		if (middleCircle) {
			gsap.to(middleCircle, {
				rotation: -360,
				duration: 180,
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

		const title = node.querySelector('.intro-title');
		const circlesSvg = node.querySelector('.circles-svg');
		const scrollHint = node.querySelector('.scroll-hint');

		// Commento solo il PERCHÉ: Inizializza placeholder di quickTo per renderli disponibili in ambito lessicale in tutte le funzioni del blocco
		let titleX = (/** @type {number} */ _v) => {};
		let titleY = (/** @type {number} */ _v) => {};
		let titleRotX = (/** @type {number} */ _v) => {};
		let titleRotY = (/** @type {number} */ _v) => {};
		let circlesX = (/** @type {number} */ _v) => {};
		let circlesY = (/** @type {number} */ _v) => {};
		let circlesRotX = (/** @type {number} */ _v) => {};
		let circlesRotY = (/** @type {number} */ _v) => {};

		// Commento solo il PERCHÉ: Traccia il movimento del mouse per inclinare e traslare gli elementi su più livelli di profondità (effetto tilt 3D)
		if (title && circlesSvg) {
			// Aumentiamo la duration a 1.2s e 1.5s per dare un senso di inerzia e pesantezza (effetto premium)
			titleX = gsap.quickTo(title, 'x', { duration: 1.2, ease: 'power2.out' });
			titleY = gsap.quickTo(title, 'y', { duration: 1.2, ease: 'power2.out' });
			titleRotX = gsap.quickTo(title, 'rotateX', { duration: 1.2, ease: 'power2.out' });
			titleRotY = gsap.quickTo(title, 'rotateY', { duration: 1.2, ease: 'power2.out' });

			circlesX = gsap.quickTo(circlesSvg, 'x', { duration: 1.5, ease: 'power2.out' });
			circlesY = gsap.quickTo(circlesSvg, 'y', { duration: 1.5, ease: 'power2.out' });
			circlesRotX = gsap.quickTo(circlesSvg, 'rotateX', { duration: 1.5, ease: 'power2.out' });
			circlesRotY = gsap.quickTo(circlesSvg, 'rotateY', { duration: 1.5, ease: 'power2.out' });

			/**
			 * @param {MouseEvent} e
			 */
			handleMouseMove = (e) => {
				if (!isIntroActive) return;

				const rect = node.getBoundingClientRect();
				const width = rect.width;
				const height = rect.height;

				const mouseX = ((e.clientX - rect.left) / width) * 2 - 1;
				const mouseY = ((e.clientY - rect.top) / height) * 2 - 1;

				// Il titolo (primo piano) si sposta in direzione opposta al mouse, con ampiezza ridotta del 30% per stabilità
				titleX(-mouseX * 10.5);
				titleY(-mouseY * 10.5);
				titleRotX(mouseY * 4.2);
				titleRotY(-mouseX * 4.2);

				// I cerchi (sfondo) assecondano lo spostamento del mouse con ampiezza minore per profondità ottica
				circlesX(mouseX * 8);
				circlesY(mouseY * 8);
				circlesRotX(-mouseY * 3);
				circlesRotY(mouseX * 3);
			};

			handleMouseLeave = () => {
				if (!isIntroActive) return;

				titleX(0);
				titleY(0);
				titleRotX(0);
				titleRotY(0);

				circlesX(0);
				circlesY(0);
				circlesRotX(0);
				circlesRotY(0);
			};

			node.addEventListener('mousemove', handleMouseMove);
			node.addEventListener('mouseleave', handleMouseLeave);
		}

		function triggerExit() {
			if (isTransitioning) return;
			isTransitioning = true;

			if (activeTimeline) activeTimeline.kill();

			activeTimeline = gsap.timeline({
				onComplete: () => {
					isLocked = false;
					isTransitioning = false;
					isIntroActive = false;
					// Commento solo il PERCHÉ: riposiziona la finestra a 105px per aggiornare lo store del gradiente e sbloccare lo scorrimento normale.
					window.scrollTo(0, 105);
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

			if (gradientRenderer) {
				const proxy = gradientRenderer.getAnimatableState();
				activeTimeline.to(proxy, {
					focusRx: 2.0,
					focusRy: 2.0,
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

			if (activeTimeline) activeTimeline.kill();

			activeTimeline = gsap.timeline({
				onComplete: () => {
					isTransitioning = false;
				}
			});

			const introCircles = node.querySelectorAll('.intro-circle');
			const introTitle = node.querySelector('.intro-title');
			const scrollHintEl = node.querySelector('.scroll-hint');

			// Commento solo il PERCHÉ: Fa rientrare per primo il gradiente stringendolo al centro a raggio 0.25.
			if (gradientRenderer) {
				const proxy = gradientRenderer.getAnimatableState();
				activeTimeline.to(proxy, {
					focusRx: 0.25,
					focusRy: 0.25,
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

		// Commento solo il PERCHÉ: intercetta lo scroll per bloccare la pagina in cima e attivare la dissolvenza centrata al primo movimento verso il basso.
		/** @param {WheelEvent} e */
		handleWheel = (e) => {
			if (isLocked) {
				if (e.cancelable) e.preventDefault();
				if (e.deltaY > 0 && !isTransitioning) {
					triggerExit();
				}
			}
		};

		/** @param {TouchEvent} e */
		handleTouchStart = (e) => {
			if (e.touches.length > 0) {
				startY = e.touches[0].clientY;
			}
		};

		/** @param {TouchEvent} e */
		handleTouchMove = (e) => {
			if (isLocked) {
				if (e.cancelable) e.preventDefault();
				if (!isTransitioning && e.touches.length > 0) {
					const currentY = e.touches[0].clientY;
					const diffY = startY - currentY;
					if (diffY > 10) {
						triggerExit();
					}
				}
			}
		};

		window.addEventListener('wheel', handleWheel, { passive: false });
		window.addEventListener('touchstart', handleTouchStart, { passive: true });
		window.addEventListener('touchmove', handleTouchMove, { passive: false });

		ScrollTrigger.create({
			trigger: node,
			start: 'top top',
			end: 'top -10',
			onEnterBack: () => {
				isLocked = true;
				isIntroActive = true;
				triggerEntry();
			}
		});
	}, node);

	return {
		destroy() {
			if (handleMouseMove) node.removeEventListener('mousemove', handleMouseMove);
			if (handleMouseLeave) node.removeEventListener('mouseleave', handleMouseLeave);
			if (handleWheel) window.removeEventListener('wheel', handleWheel);
			if (handleTouchStart) window.removeEventListener('touchstart', handleTouchStart);
			if (handleTouchMove) window.removeEventListener('touchmove', handleTouchMove);
			ctx.revert();
		}
	};
}


