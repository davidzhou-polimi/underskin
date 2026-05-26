import { gsap } from 'gsap';

export function drawBorder(/** @type {HTMLElement} */ node, /** @type {{ clicked?: boolean }} */ params = {}) {
	const maskCircle = node.querySelector('.mask-circle');

	if (!maskCircle) return;

	if (params.clicked) {
		gsap.set(maskCircle, { strokeDashoffset: 0 });
		return {
			update(/** @type {{ clicked?: boolean }} */ newParams) {
				if (newParams.clicked) {
					gsap.set(maskCircle, { strokeDashoffset: 0 });
				}
			},
			destroy() {}
		};
	}

	const tl = gsap.timeline();

	tl.to(maskCircle, {
		strokeDashoffset: 0,
		duration: 0.8,
		ease: 'power2.out'
	});

	return {
		update(/** @type {{ clicked?: boolean }} */ newParams) {
			if (newParams.clicked) {
				tl.kill();
				gsap.set(maskCircle, { strokeDashoffset: 0 });
			}
		},
		destroy() {
			tl.kill();
		}
	};
}
