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
		duration = 1.0
	} = params;

	const innerCard = node.querySelector(innerSelector);
	const backTexts = node.querySelectorAll(textSelector);

	if (!innerCard) return;

	// Set initial states
	gsap.set(innerCard, { transformStyle: 'preserve-3d' });
	if (backTexts.length) gsap.set(backTexts, { opacity: 0, y: 10 });

	const getRotationProp = () => axis === 'X' ? 'rotateX' : 'rotateY';

	const flipToBack = () => {
		gsap.to(innerCard, {
			[getRotationProp()]: 180,
			boxShadow: axis === 'X' ? '2px -2px 4px 0px rgba(0,0,0,0.23)' : '-2px 2px 4px 0px rgba(0,0,0,0.23)',
			duration: duration,
			ease: 'back.out(1.2)',
			overwrite: 'auto'
		});

		if (backTexts.length) {
			gsap.to(backTexts, {
				opacity: 1,
				y: 0,
				duration: duration * 0.66,
				delay: duration * 0.33,
				stagger: duration * 0.16,
				ease: 'power2.out',
				overwrite: 'auto'
			});
		}
	};

	const flipToFront = () => {
		gsap.to(innerCard, {
			[getRotationProp()]: 0,
			boxShadow: '2px 2px 4px 0px rgba(0,0,0,0.23)',
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

	let isFlipped = false;
	const onClick = () => {
		isFlipped = !isFlipped;
		if (isFlipped) {
			flipToBack();
		} else {
			flipToFront();
		}
	};

	node.addEventListener('click', onClick);

	return {
		/**
		 * @param {FlipCardParams} newParams
		 */
		update(newParams) {
			axis = newParams.axis ?? 'Y';
			duration = newParams.duration ?? 1.0;
		},
		destroy() {
			node.removeEventListener('click', onClick);
			gsap.killTweensOf(innerCard);
			if (backTexts.length) gsap.killTweensOf(backTexts);
		}
	};
}
