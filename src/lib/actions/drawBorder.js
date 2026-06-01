import { gsap } from 'gsap';

export function drawBorder(/** @type {HTMLElement} */ node, /** @type {{ clicked?: boolean, enabled?: boolean }} */ params = {}) {
	const maskCircle = node.querySelector('.mask-circle');

	if (!maskCircle) return;

	let tl = null;

	function playAnimation() {
		if (tl) tl.kill();
		tl = gsap.timeline();
		tl.to(maskCircle, {
			strokeDashoffset: 0,
			duration: 0.8,
			ease: 'power2.out'
		}, 0);
	}

	// Se è già stato cliccato, mostra subito
	if (params.clicked) {
		gsap.set(maskCircle, { strokeDashoffset: 0 });
	}

	// Se l'animazione è abilitata, partiamo con un micro-delay per garantire visibilità
	if (params.enabled && !params.clicked) {
		gsap.delayedCall(0.05, playAnimation);
	}

	return {
		update(/** @type {{ clicked?: boolean, enabled?: boolean }} */ newParams) {
			if (newParams.clicked) {
				if (tl) tl.kill();
				gsap.set(maskCircle, { strokeDashoffset: 0 });
			} else if (newParams.enabled && !newParams.clicked) {
				if (!tl || tl.progress() === 1) {
					gsap.delayedCall(0.05, playAnimation);
				}
			}
		},
		destroy() {
			if (tl) tl.kill();
		}
	};
}
