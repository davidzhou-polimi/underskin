import { gsap } from 'gsap';

export function drawBorder(/** @type {HTMLElement} */ node, /** @type {{ clicked?: boolean }} */ params = {}) {
	const maskCircle = node.querySelector('.mask-circle');

	if (!maskCircle) return;

	let tl = null;
	let hasAnimated = false;

	function playAnimation() {
		if (hasAnimated) return; // 只播放一次
		hasAnimated = true;

		if (tl) tl.kill();
		tl = gsap.timeline();
		tl.to(maskCircle, {
			strokeDashoffset: 0,
			duration: 0.8,
			ease: 'power2.out'
		});
	}

	// Se è già stato cliccato, mostra subito
	if (params.clicked) {
		gsap.set(maskCircle, { strokeDashoffset: 0 });
		hasAnimated = true;
		return {
			update(/** @type {{ clicked?: boolean }} */ newParams) {
				if (newParams.clicked) {
					if (tl) tl.kill();
					gsap.set(maskCircle, { strokeDashoffset: 0 });
				}
			},
			destroy() {
				if (tl) tl.kill();
			}
		};
	}

	// IntersectionObserver: aspetta che l'elemento entri nel viewport
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					playAnimation();
					observer.disconnect();
				}
			});
		},
		{ threshold: 0.3 }
	);

	observer.observe(node);

	return {
		update(/** @type {{ clicked?: boolean }} */ newParams) {
			if (newParams.clicked) {
				if (tl) tl.kill();
				gsap.set(maskCircle, { strokeDashoffset: 0 });
				hasAnimated = true;
			}
		},
		destroy() {
			if (tl) tl.kill();
			observer.disconnect();
		}
	};
}
