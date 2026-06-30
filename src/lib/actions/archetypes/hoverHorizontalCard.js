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
			// Commento solo il PERCHÉ: interrompiamo qualsiasi animazione pendente o attiva per evitare disallineamenti dovuti a cambi di hover repentini
			if (nameEl) gsap.killTweensOf(nameEl);
			if (decalEl) gsap.killTweensOf(decalEl);

			if (nameEl) {
				// Commento solo il PERCHÉ: muoviamo il testo verso l'alto con un movimento fluido e ampio
				gsap.to(nameEl, {
					yPercent: -130,
					scale: 0.95,
					duration: 0.6,
					ease: 'power3.out',
					overwrite: 'auto'
				});
				// Commento solo il PERCHÉ: facciamo svanire l'opacità rapidamente (0.25s) in modo che la scritta sia completamente invisibile prima di essere tagliata dal bordo superiore (overflow-hidden)
				gsap.to(nameEl, {
					opacity: 0,
					duration: 0.25,
					ease: 'power1.out',
					overwrite: 'auto'
				});
			}
			if (decalEl) {
				// Commento solo il PERCHÉ: muoviamo il gradiente superiore verso l'alto in modo asincrono
				gsap.to(decalEl, {
					yPercent: -130,
					duration: 0.6,
					ease: 'power3.out',
					delay: 0.08,
					overwrite: 'auto'
				});
				// Commento solo il PERCHÉ: facciamo svanire il gradiente rapidamente per evitare tagli netti sulla cornice superiore
				gsap.to(decalEl, {
					opacity: 0,
					duration: 0.3,
					ease: 'power1.out',
					delay: 0.08,
					overwrite: 'auto'
				});
			}
		});
	};

	const onMouseLeave = () => {
		// Commento solo il PERCHÉ: consentiamo il ripristino visivo immediato degli elementi della card al termine dell'hover
		if (!enabled) return;

		ctx.add(() => {
			// Commento solo il PERCHÉ: interrompiamo qualsiasi animazione pendente o attiva per evitare disallineamenti dovuti a cambi di hover repentini
			if (nameEl) gsap.killTweensOf(nameEl);
			if (decalEl) gsap.killTweensOf(decalEl);

			if (decalEl) {
				gsap.to(decalEl, {
					yPercent: 0,
					opacity: 1,
					duration: 0.5,
					ease: 'power3.out',
					overwrite: 'auto'
				});
			}
			if (nameEl) {
				gsap.to(nameEl, {
					yPercent: 0,
					scale: 1,
					opacity: 1,
					duration: 0.5,
					ease: 'power3.out',
					delay: 0.05,
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
