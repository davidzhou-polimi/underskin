import { gsap } from 'gsap';

export function drawBorder(/** @type {HTMLElement} */ node, /** @type {{ clicked?: boolean }} */ params = {}) {
	const maskCircle = node.querySelector('.mask-circle');
	
	if (!maskCircle) return;

	const tl = gsap.timeline();

	tl.to(maskCircle, {
		strokeDashoffset: 0,
		duration: 0.8,
		ease: 'power2.out'
	});

	return {
		update(/** @type {{ clicked?: boolean }} */ newParams) {
			params = newParams;
		},
		destroy() {
			tl.kill();
		}
	};
}
