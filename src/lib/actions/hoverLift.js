import { gsap } from '$lib/utils/gsapSetup.js';

/**
 * @typedef {Object} HoverLiftParams
 * @property {number} [y]
 * @property {number} [scale]
 * @property {number} [duration]
 * @property {string} [ease]
 * @property {boolean} [disabled]
 */

/**
 * Gestisce l'effetto di sollevamento e ingrandimento all'hover usando GSAP
 * @param {HTMLElement} node
 * @param {HoverLiftParams} [params]
 */
export function hoverLift(node, params = {}) {
	let disabled = params.disabled ?? false;
	const {
		y = -15,
		duration = 0.3,
		ease = 'power2.out'
	} = params;

	// Gestiamo il ciclo di vita dei tween tramite un contesto dedicato per garantire il cleanup corretto.
	const ctx = gsap.context(() => {}, node);

	// Avvia l'animazione di sollevamento all'ingresso del cursore
	const onMouseEnter = () => {
		// Commento solo il PERCHÉ: evitiamo di sollevare la card se l'effetto è esplicitamente disabilitato (es. durante lo scorrimento)
		if (disabled) return;
		ctx.add(() => {
			gsap.to(node, {
				y: y,
				duration: duration,
				ease: ease,
				overwrite: 'auto'
			});
		});
	};

	// Ripristina lo stato originale all'uscita del cursore
	const onMouseLeave = () => {
		// Commento solo il PERCHÉ: consentiamo il reset del lift anche se disabilitato per ripristinare lo stato originario della card
		ctx.add(() => {
			gsap.to(node, {
				y: 0,
				duration: duration,
				ease: ease,
				overwrite: 'auto'
			});
		});
	};

	node.addEventListener('mouseenter', onMouseEnter);
	node.addEventListener('mouseleave', onMouseLeave);

	return {
		/** @param {HoverLiftParams} newParams */
		update(newParams) {
			const wasDisabled = disabled;
			disabled = newParams.disabled ?? false;

			// Commento solo il PERCHÉ: se la card è appena stata disabilitata (es. carosello in movimento), forziamo il reset a terra per evitare card sollevate "volanti"
			if (!wasDisabled && disabled) {
				ctx.add(() => {
					gsap.to(node, {
						y: 0,
						duration: duration,
						ease: ease,
						overwrite: 'auto'
					});
				});
			}

			// Commento solo il PERCHÉ: se viene riabilitata e il mouse è già sopra la card (es. transizione terminata sotto il puntatore), inneschiamo subito il lift
			if (wasDisabled && !disabled && node.matches(':hover')) {
				onMouseEnter();
			}
		},
		destroy() {
			node.removeEventListener('mouseenter', onMouseEnter);
			node.removeEventListener('mouseleave', onMouseLeave);
			ctx.revert();
		}
	};
}
