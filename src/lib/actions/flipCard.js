import gsap from 'gsap';

/**
 * @typedef {Object} FlipCardParams
 * @property {'X' | 'Y'} [axis]
 * @property {string} [innerSelector]
 * @property {string} [textSelector]
 * @property {number} [duration]
 * @property {boolean} [active]
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
		duration = 1.0,
		active = true
	} = params;

	const innerCard = node.querySelector(innerSelector);
	const backTexts = node.querySelectorAll(textSelector);

	if (!innerCard) return;

	// Gestiamo il ciclo di vita dei tween all'interno del contesto per prevenire memory leak in Svelte 5.
	const ctx = gsap.context(() => {
		gsap.set(innerCard, { transformStyle: 'preserve-3d' });
		if (backTexts.length) gsap.set(backTexts, { opacity: 0, y: 10 });
	}, node);

	const getRotationProp = () => axis === 'X' ? 'rotateX' : 'rotateY';

	const flipToBack = () => {
		ctx.add(() => {
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
					duration: duration * 0.66,
					delay: duration * 0.33,
					stagger: duration * 0.16,
					ease: 'power2.out',
					overwrite: 'auto'
				});
			}
		});
	};

	const flipToFront = () => {
		ctx.add(() => {
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
		});
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

			// Ripristina lo stato iniziale per evitare che la card rimanga sul retro quando l'utente seleziona un altro atleta
			if (newParams.active === false && isFlipped) {
				isFlipped = false;
				flipToFront();
			}
		},
		destroy() {
			node.removeEventListener('click', onClick);
			ctx.revert();
		}
	};
}
