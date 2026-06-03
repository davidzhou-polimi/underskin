import { gsap } from 'gsap';

/**
 * @typedef {Object} HorizontalCarouselParams
 * @property {number} [activeIndex]
 */

/**
 * Svelte action that slides items horizontally individually using GSAP for infinite looping
 * @param {HTMLElement} node - The carousel track container
 * @param {HorizontalCarouselParams} params
 */
export function horizontalCarousel(node, params = {}) {
	// Tracciamo l'indice attivo internamente per evitare re-tweening ridondanti
	let activeIndex = params.activeIndex ?? 0;

	// Creiamo un contesto GSAP collegato al nodo per un facile cleanup delle animazioni
	const ctx = gsap.context(() => {}, node);

	/**
	 * Aggiorna il posizionamento e gli stati visivi di tutte le card
	 * @param {number} index - L'indice attivo da centrare
	 * @param {boolean} animate - Se applicare una transizione animata
	 */
	function updateLayout(index, animate = true) {
		const items = node.querySelectorAll('.carousel-item');
		const itemsCount = items.length;
		if (itemsCount === 0) return;

		const firstItem = /** @type {HTMLElement} */ (items[0]);
		const itemWidth = firstItem.offsetWidth;

		// Definiamo un gap costante coerente con i token di spaziatura (var(--spacing-4) = 32px)
		const gap = 32;
		const offset = itemWidth + gap;

		// Calcoliamo se il movimento è in avanti o all'indietro per determinare la direzione di uscita
		let isForward = true;
		if (index === 0 && activeIndex === itemsCount - 1) {
			isForward = true;
		} else if (index === itemsCount - 1 && activeIndex === 0) {
			isForward = false;
		} else {
			isForward = index > activeIndex;
		}

		items.forEach((item, i) => {
			// Calcoliamo la differenza circolare di indice
			let currentDiff = i - index;
			if (currentDiff > itemsCount / 2) currentDiff -= itemsCount;
			else if (currentDiff < -itemsCount / 2) currentDiff += itemsCount;

			let prevDiff = i - activeIndex;
			if (prevDiff > itemsCount / 2) prevDiff -= itemsCount;
			else if (prevDiff < -itemsCount / 2) prevDiff += itemsCount;

			// Calcoliamo la coordinata X target
			const x = currentDiff * offset;

			// Identifichiamo se l'elemento deve fare un "wrap" (es. saltare da un estremo all'altro)
			const isWrap = animate && Math.abs(currentDiff - prevDiff) > 1.5;

			ctx.add(() => {
				// Il zIndex deve essere maggiore al centro per sovrapporre correttamente le card
				const absDiff = Math.abs(currentDiff);
				const zIndex = 10 - absDiff;
				gsap.set(item, { zIndex });

				if (animate) {
					if (!isWrap) {
						// Spostamento regolare
						gsap.to(item, {
							x,
							opacity: 1,
							scale: 1,
							duration: 0.6,
							ease: 'power2.out',
							overwrite: 'auto'
						});
					} else {
						// La card che fa wrap deve uscire rapidamente dal viewport,
						// e poi scivolare/entrare dall'altro lato in sincronia con le altre card.
						const exitX = isForward ? -2 * offset : 2 * offset;

						gsap.killTweensOf(item);
						
						// Animiamo l'uscita dallo schermo (0.3s) con un ease morbido
						gsap.to(item, {
							x: exitX,
							opacity: 0,
							scale: 0.95,
							duration: 0.3,
							ease: 'power2.out',
							overwrite: 'auto',
							onComplete: () => {
								// Calcoliamo una posizione di partenza leggermente esterna sul lato opposto per l'effetto slide-in
								const entryStartX = x + (isForward ? 40 : -40);
								gsap.set(item, { x: entryStartX, opacity: 0, scale: 0.95 });
								// Rientra in sincronia con il resto della transizione (0.3s)
								gsap.to(item, {
									x,
									opacity: 1,
									scale: 1,
									duration: 0.3,
									ease: 'power2.out'
								});
							}
						});
					}
				} else {
					// Se non è animato, impostiamo la posizione istantaneamente
					gsap.killTweensOf(item);
					gsap.set(item, { x, opacity: 1, scale: 1 });
				}
			});
		});

		activeIndex = index;
	}

	// Usiamo un piccolo timeout per garantire che il DOM sia completamente renderizzato
	// e le dimensioni dei nodi siano calcolabili all'inizializzazione.
	const initTimeout = setTimeout(() => {
		updateLayout(activeIndex, false);
	}, 50);

	const onResize = () => updateLayout(activeIndex, false);
	window.addEventListener('resize', onResize);

	return {
		/** @param {HorizontalCarouselParams} newParams */
		update(newParams) {
			if (newParams.activeIndex !== activeIndex) {
				updateLayout(newParams.activeIndex ?? 0, true);
			}
		},
		destroy() {
			clearTimeout(initTimeout);
			window.removeEventListener('resize', onResize);
			ctx.revert(); // Rilascia tutte le animazioni registrate nel contesto
		}
	};
}
