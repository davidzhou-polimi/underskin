import { gsap } from 'gsap';

/**
 * Animazione di ingress per le frasi con stagger.
 * @param {HTMLElement[]} lines
 */
export function animateTextReveal(lines) {
	gsap.set(lines, { opacity: 0, filter: 'blur(15px)', y: 20 });
	gsap.to(lines, {
		opacity: 1,
		filter: 'blur(0px)',
		y: 0,
		duration: 0.6,
		stagger: 0.12,
		ease: 'power2.out'
	});
}

/**
 * Transizione tra due frasi.
 * @param {HTMLElement} fromLine
 * @param {HTMLElement} toLine
 * @param {() => void} onComplete
 */
export function transitionToLine(fromLine, toLine, onComplete) {
	gsap.to(fromLine, {
		opacity: 0,
		filter: 'blur(15px)',
		y: -20,
		duration: 0.5,
		ease: 'power2.inOut'
	});

	gsap.to(toLine, {
		opacity: 1,
		filter: 'blur(0px)',
		y: 0,
		duration: 0.5,
		ease: 'power2.inOut',
		onComplete
	});
}
