import gsap from 'gsap';

/**
 * @typedef {Object} HoverLiftParams
 * @property {number} [y]
 * @property {number} [scale]
 * @property {number} [duration]
 * @property {string} [ease]
 */

/**
 * Gestisce l'effetto di sollevamento e ingrandimento all'hover usando GSAP
 * @param {HTMLElement} node
 * @param {HoverLiftParams} [params]
 */
export function hoverLift(node, params = {}) {
	const {
		y = -8,
		scale = 1.02,
		duration = 0.3,
		ease = 'power2.out'
	} = params;

	// Avvia l'animazione di sollevamento all'ingresso del cursore
	const onMouseEnter = () => {
		gsap.to(node, {
			y: y,
			scale: scale,
			duration: duration,
			ease: ease,
			overwrite: 'auto'
		});
	};

	// Ripristina lo stato originale all'uscita del cursore
	const onMouseLeave = () => {
		gsap.to(node, {
			y: 0,
			scale: 1,
			duration: duration,
			ease: ease,
			overwrite: 'auto'
		});
	};

	node.addEventListener('mouseenter', onMouseEnter);
	node.addEventListener('mouseleave', onMouseLeave);

	return {
		destroy() {
			node.removeEventListener('mouseenter', onMouseEnter);
			node.removeEventListener('mouseleave', onMouseLeave);
			gsap.killTweensOf(node);
		}
	};
}
