import gsap from 'gsap';

/**
 * Action Svelte per animare il ritiro verso l'alto di nome e gradiente all'hover delle card orizzontali.
 * @param {HTMLElement} node - L'elemento DOM della card
 * @param {{ enabled?: boolean }} [params] - Parametri di configurazione
 */
export function hoverHorizontalCard(node, params = {}) {
	let enabled = params.enabled ?? false;

	const nameEl = node.querySelector('.name-front');
	const decalEl = node.querySelector('.decal-top');

	// Gestiamo il ciclo di vita dei tween tramite un contesto dedicato per garantire il cleanup automatico.
	const ctx = gsap.context(() => {}, node);

	const onMouseEnter = () => {
		// Commento solo il PERCHÉ: l'animazione di ritiro verso l'alto deve attivarsi solo se la card è configurata in modalità orizzontale
		if (!enabled) return;

		ctx.add(() => {
			if (nameEl) {
				gsap.to(nameEl, {
					yPercent: -140,
					opacity: 0,
					duration: 0.4,
					ease: 'power2.inOut',
					overwrite: 'auto'
				});
			}
			if (decalEl) {
				gsap.to(decalEl, {
					yPercent: -140,
					opacity: 0,
					duration: 0.4,
					ease: 'power2.inOut',
					overwrite: 'auto'
				});
			}
		});
	};

	const onMouseLeave = () => {
		// Commento solo il PERCHÉ: consentiamo il ripristino visivo immediato degli elementi della card al termine dell'hover
		if (!enabled) return;

		ctx.add(() => {
			if (nameEl) {
				gsap.to(nameEl, {
					yPercent: 0,
					opacity: 1,
					duration: 0.4,
					ease: 'power2.inOut',
					overwrite: 'auto'
				});
			}
			if (decalEl) {
				gsap.to(decalEl, {
					yPercent: 0,
					opacity: 1,
					duration: 0.4,
					ease: 'power2.inOut',
					overwrite: 'auto'
				});
			}
		});
	};

	node.addEventListener('mouseenter', onMouseEnter);
	node.addEventListener('mouseleave', onMouseLeave);

	return {
		/**
		 * @param {{ enabled?: boolean }} newParams
		 */
		update(newParams) {
			const wasEnabled = enabled;
			enabled = newParams.enabled ?? false;

			// Commento solo il PERCHÉ: se l'effetto viene disabilitato dinamicamente, resettiamo all'istante lo stato degli elementi interni per evitare posizionamenti parziali
			if (wasEnabled && !enabled) {
				ctx.add(() => {
					if (nameEl) gsap.set(nameEl, { yPercent: 0, opacity: 1 });
					if (decalEl) gsap.set(decalEl, { yPercent: 0, opacity: 1 });
				});
			}
		},
		destroy() {
			node.removeEventListener('mouseenter', onMouseEnter);
			node.removeEventListener('mouseleave', onMouseLeave);
			ctx.revert();
		}
	};
}
