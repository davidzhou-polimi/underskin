import gsap from 'gsap';

export function flipCard(node, params = {}) {
	const { axis = 'Y', innerSelector = '.card-inner', textSelector = '.back-text' } = params;

	const innerCard = node.querySelector(innerSelector);
	const backTexts = node.querySelectorAll(textSelector);

	if (!innerCard) return;

	// Set initial states
	gsap.set(innerCard, { transformStyle: 'preserve-3d' });
	if (backTexts.length) gsap.set(backTexts, { opacity: 0, y: 10 });

	const rotationProp = axis === 'X' ? 'rotateX' : 'rotateY';

	const onMouseEnter = () => {
		gsap.to(innerCard, {
			[rotationProp]: 180,
			duration: 0.6,
			ease: 'back.out(1.2)',
			overwrite: 'auto'
		});

		if (backTexts.length) {
			gsap.to(backTexts, {
				opacity: 1,
				y: 0,
				duration: 0.4,
				delay: 0.2,
				stagger: 0.1,
				ease: 'power2.out',
				overwrite: 'auto'
			});
		}
	};

	const onMouseLeave = () => {
		gsap.to(innerCard, {
			[rotationProp]: 0,
			duration: 0.6,
			ease: 'power2.out',
			overwrite: 'auto'
		});

		if (backTexts.length) {
			gsap.to(backTexts, {
				opacity: 0,
				y: 10,
				duration: 0.2,
				ease: 'power2.in',
				overwrite: 'auto'
			});
		}
	};

	node.addEventListener('mouseenter', onMouseEnter);
	node.addEventListener('mouseleave', onMouseLeave);

	return {
		destroy() {
			node.removeEventListener('mouseenter', onMouseEnter);
			node.removeEventListener('mouseleave', onMouseLeave);
			gsap.killTweensOf(innerCard);
			if (backTexts.length) gsap.killTweensOf(backTexts);
		}
	};
}
