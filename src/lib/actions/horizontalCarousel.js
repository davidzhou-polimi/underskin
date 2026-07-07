import { gsap } from '$lib/utils/gsapSetup.js';

/**
 * @typedef {Object} HorizontalCarouselParams
 * @property {number} [activeIndex]
 * @property {number} [gap]
 * @property {number} [dragOffset]
 */

/**
 * Svelte action that slides items horizontally individually using GSAP for infinite looping
 * @param {HTMLElement} node - The carousel track container
 * @param {HorizontalCarouselParams} params
 */
export function horizontalCarousel(node, params = {}) {
	// Tracciamo l'indice attivo internamente per evitare re-tweening ridondanti
	let activeIndex = params.activeIndex ?? 0;

	// Commento solo il PERCHÉ: `offsetWidth` forza un reflow sincrono. Durante un drag updateLayout
	// gira a ogni frame ma la larghezza card è costante: la misuriamo una volta e la invalidiamo solo
	// al resize, evitando un layout thrash per ogni touchmove.
	let cachedItemWidth = 0;

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

		if (!cachedItemWidth) {
			const firstItem = /** @type {HTMLElement} */ (items[0]);
			cachedItemWidth = firstItem.offsetWidth;
		}
		const itemWidth = cachedItemWidth;

		// Definiamo un gap coerente con i token di spaziatura o configurato tramite parametri
		const gap = params.gap ?? 32;
		const offset = itemWidth + gap;
		const dragOffset = params.dragOffset ?? 0;

		// Calcoliamo se il movimento è in avanti o all'indietro per determinare la direzione di uscita
		let isForward = true;
		if (index === 0 && activeIndex === itemsCount - 1) {
			isForward = true;
		} else if (index === itemsCount - 1 && activeIndex === 0) {
			isForward = false;
		} else {
			isForward = index > activeIndex;
		}

		// Calcoliamo la distanza circolare netta per determinare la direzione del movimento
		let delta = index - activeIndex;
		if (delta > itemsCount / 2) delta -= itemsCount;
		else if (delta < -itemsCount / 2) delta += itemsCount;

		// Identifichiamo se si tratta di un salto di più posizioni (es. clic su un pallino lontano)
		const stepDist = Math.abs(index - activeIndex);
		const isJump = stepDist > 1 && stepDist < itemsCount - 1;

		items.forEach((item, i) => {
			// Calcoliamo la differenza circolare di indice
			let currentDiff = i - index;
			if (currentDiff > itemsCount / 2) currentDiff -= itemsCount;
			else if (currentDiff < -itemsCount / 2) currentDiff += itemsCount;

			let prevDiff = i - activeIndex;
			if (prevDiff > itemsCount / 2) prevDiff -= itemsCount;
			else if (prevDiff < -itemsCount / 2) prevDiff += itemsCount;

			// Calcoliamo la coordinata X target circolare reale, sommando lo scostamento del drag
			const circularX = currentDiff * offset + dragOffset;

			// Calcoliamo la coordinata X precedente teorica, sommando lo scostamento del drag
			const prevX = prevDiff * offset + dragOffset;

			// Identifichiamo se questa specifica card deve fare "wrap" (salto circolare) durante la transizione
			const movement = circularX - prevX;
			const isWrapCard = animate && isJump && ((delta > 0 && movement > 0) || (delta < 0 && movement < 0));

			// Identifichiamo se l'elemento deve fare un "wrap" standard per spostamenti adiacenti
			const isWrap = animate && !isJump && Math.abs(currentDiff - prevDiff) > 1.5;

			ctx.add(() => {
				// Il zIndex deve essere maggiore al centro per sovrapporre correttamente le card
				const absDiff = Math.abs(currentDiff);
				const zIndex = 10 - absDiff;

				if (animate) {
					if (isJump) {
						if (isWrapCard) {
							// Commento solo il PERCHÉ: per le card che fanno wrap nel salto, le facciamo sfumare 
							// in dissolvenza sul posto, le teletrasportiamo e le facciamo rientrare con fade-in. 
							// Questo evita sia gli scorrimenti opposti sia i "buchi" visivi nel carosello.
							gsap.killTweensOf(item);
							gsap.to(item, {
								opacity: 0,
								scale: 0.95,
								duration: 0.2,
								ease: 'power2.out',
								overwrite: 'auto',
								onComplete: () => {
									gsap.set(item, { x: circularX, zIndex });
									gsap.to(item, {
										opacity: 1,
										scale: 1,
										duration: 0.3,
										ease: 'power2.out',
										delay: 0.1 // Sincronizza l'apparizione con la fine dello scorrimento del treno
									});
								}
							});
						} else {
							// Commento solo il PERCHÉ: per le card non-wrapping, le facciamo scivolare normalmente 
							// nella direzione del treno, mantenendo la continuità fisica dello scorrimento
							gsap.set(item, { zIndex });
							gsap.to(item, {
								x: circularX,
								opacity: 1,
								scale: 1,
								duration: 0.6,
								ease: 'power2.out',
								overwrite: 'auto'
							});
						}
					} else {
						// Commento solo il PERCHÉ: applichiamo subito lo zIndex per garantire la corretta 
						// sovrapposizione delle card durante lo scorrimento continuo adiacente
						gsap.set(item, { zIndex });

						if (!isWrap) {
							// Spostamento regolare
							gsap.to(item, {
								x: circularX,
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
									const entryStartX = circularX + (isForward ? 40 : -40);
									gsap.set(item, { x: entryStartX, opacity: 0, scale: 0.95 });
									// Rientra in sincronia con il resto della transizione (0.3s)
									gsap.to(item, {
										x: circularX,
										opacity: 1,
										scale: 1,
										duration: 0.3,
										ease: 'power2.out'
									});
								}
							});
						}
					}
				} else {
					// Se non è animato, impostiamo la posizione istantaneamente
					gsap.killTweensOf(item);
					gsap.set(item, { x: circularX, zIndex, opacity: 1, scale: 1 });
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

	const onResize = () => {
		cachedItemWidth = 0; // invalida la misura: la larghezza card dipende dal viewport
		updateLayout(activeIndex, false);
	};
	window.addEventListener('resize', onResize);

	return {
		/** @param {HorizontalCarouselParams} newParams */
		update(newParams) {
			const oldGap = params.gap;
			const oldDragOffset = params.dragOffset;
			params = newParams;
			
			// Commento solo il PERCHÉ: se stiamo trascinando col dito (dragOffset !== 0) disattiviamo 
			// l'animazione GSAP per una reattività istantanea. Al rilascio (dragOffset torna a 0), 
			// abilitiamo l'animazione di snap per ricentrare la card
			const isDragging = newParams.dragOffset !== 0;
			const animate = !isDragging && (newParams.dragOffset === 0 && oldDragOffset !== 0 ? true : (newParams.activeIndex !== activeIndex));

			if (newParams.activeIndex !== activeIndex || newParams.gap !== oldGap || newParams.dragOffset !== oldDragOffset) {
				updateLayout(newParams.activeIndex ?? 0, animate);
			}
		},
		destroy() {
			clearTimeout(initTimeout);
			window.removeEventListener('resize', onResize);
			ctx.revert(); // Rilascia tutte le animazioni registrate nel contesto
		}
	};
}
