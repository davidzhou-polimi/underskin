import gsap from 'gsap';

/**
 * @typedef {Object} FlipCardParams
 * @property {'X' | 'Y'} [axis]
 * @property {string} [innerSelector]
 * @property {string} [textSelector]
 * @property {number} [duration]
 */

/**
 * @param {HTMLElement} node
 * @param {FlipCardParams} [params]
 */
export function flipCard(node, params = {}) {
	let { 
		axis = 'Y', 
		innerSelector = '.card-inner', 
		textSelector = '.back-text',
		duration = 0.8
	} = params;

	const innerCard = node.querySelector(innerSelector);
	const backTexts = node.querySelectorAll(textSelector);

	if (!innerCard) return;

	// Set initial states
	gsap.set(innerCard, { transformStyle: 'preserve-3d' });
	if (backTexts.length) gsap.set(backTexts, { opacity: 0, y: 10 });

	const getRotationProp = () => axis === 'X' ? 'rotateX' : 'rotateY';

	const onMouseEnter = () => {
		gsap.to(innerCard, {
			[getRotationProp()]: 180,
			duration: duration,
			ease: 'back.out(1.2)',
			overwrite: 'auto'
		});

		if (backTexts.length) {
			gsap.to(backTexts, {
				opacity: 1,
				y: 0,
				duration: duration * 0.66, // Scale text entry with flip duration
				delay: duration * 0.33,     // Delay scaling with flip duration
				stagger: duration * 0.16,
				ease: 'power2.out',
				overwrite: 'auto'
			});
		}
	};

	const onMouseLeave = () => {
		gsap.to(innerCard, {
			[getRotationProp()]: 0,
			duration: duration,
			ease: 'power2.out',
			overwrite: 'auto'
		});

		if (backTexts.length) {
			gsap.to(backTexts, {
				opacity: 0,
				y: 10,
				duration: duration * 0.33,
				ease: 'power2.in',
				overwrite: 'auto'
			});
		}
	};

	node.addEventListener('mouseenter', onMouseEnter);
	node.addEventListener('mouseleave', onMouseLeave);

	return {
		/**
		 * @param {FlipCardParams} newParams
		 */
		update(newParams) {
			axis = newParams.axis ?? 'Y';
			duration = newParams.duration ?? 0.8;
		},
		destroy() {
			node.removeEventListener('mouseenter', onMouseEnter);
			node.removeEventListener('mouseleave', onMouseLeave);
			gsap.killTweensOf(innerCard);
			if (backTexts.length) gsap.killTweensOf(backTexts);
		}
	};
}
