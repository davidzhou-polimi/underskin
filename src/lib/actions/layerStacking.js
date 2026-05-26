import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { layers } from '$lib/stores/layers.svelte.js';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/**
 * Azione per sezioni con effetto layer sovrapposto (stile Apple).
 * Usa solo opacity per la transizione, non pin (i singoli layer gestiscono i propri pin).
 */
export function layerStacking(node, params = {}) {
	const {
		layerIndex = 0,
		scrollDistance = '100%',
	} = params;

	const ctx = gsap.context(() => {
		// Imposta stato iniziale nascosto
		gsap.set(node, { opacity: 0 });

		ScrollTrigger.create({
			trigger: node,
			start: 'top bottom',  // Inizia quando l'elemento entra dal basso
			end: `+=${scrollDistance}`,
			scrub: true,
			anticipatePin: 1,
			onUpdate: (self) => {
				layers.setLayerProgress(layerIndex, self.progress);

				// Transizione opacità basata sullo scroll
				const progress = self.progress;
				let newOpacity = 0;

				if (progress < 0.15) {
					// Fase 1: Fade in (0-15%)
					newOpacity = progress / 0.15;
				} else if (progress < 0.7) {
					// Fase 2: Completamente visibile (15-70%)
					newOpacity = 1;
				} else if (progress < 0.85) {
					// Fase 3: Inizio fade out (70-85%)
					newOpacity = 1 - ((progress - 0.7) / 0.15);
				} else {
					// Fase 4: Completamente nascosto (>85%)
					newOpacity = 0;
				}

				gsap.set(node, { opacity: newOpacity });
			},
			onEnter: () => {
				layers.setActiveLayer(layerIndex);
			},
			onEnterBack: () => {
				layers.setActiveLayer(layerIndex);
			},
			onLeaveBack: () => {
				if (layerIndex > 0) {
					layers.setActiveLayer(layerIndex - 1);
				}
			}
		});

	}, node);

	return {
		destroy() {
			ctx.revert();
		}
	};
}

/**
 * Azione per elementi con effetto parallasse (leggero movimento durante scroll)
 */
export function layerParallax(node, params = {}) {
	const { speed = 0.5, direction = 'up' } = params;

	const ctx = gsap.context(() => {
		const yMove = direction === 'up' ? -100 * speed : 100 * speed;

		gsap.fromTo(node,
			{ y: 0 },
			{
				y: yMove,
				ease: 'none',
				scrollTrigger: {
					trigger: node,
					start: 'top bottom',
					end: 'bottom top',
					scrub: true
				}
			}
		);
	}, node);

	return {
		destroy() {
			ctx.revert();
		}
	};
}
