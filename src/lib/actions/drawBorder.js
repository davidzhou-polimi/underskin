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
		});
	}

	// Se è già stato cliccato, mostra subito
	if (params.clicked) {
		gsap.set(maskCircle, { strokeDashoffset: 0 });
	}

	// Se l'animazione è abilitata, partiamo subito
	if (params.enabled && !params.clicked) {
		playAnimation();
	}

	return {
		update(/** @type {{ clicked?: boolean, enabled?: boolean }} */ newParams) {
			if (newParams.clicked) {
				if (tl) tl.kill();
				gsap.set(maskCircle, { strokeDashoffset: 0 });
			} else if (newParams.enabled && !newParams.clicked) {
				// Quando diventa enabled, partiamo l'animazione
				if (!tl || tl.progress() === 1) {
					playAnimation();
				}
			}
		},
		destroy() {
			if (tl) tl.kill();
		}
	};
}
