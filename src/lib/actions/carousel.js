import { gsap } from '$lib/utils/gsapSetup.js';
import { media } from '$lib/stores/mediaQuery.svelte.js';

const ANGLE_STEP = 18; // degrees between adjacent card positions

/**
 * @typedef {Object} CarouselParams
 * @property {number} [activeIndex]
 * @property {number} [itemsCount]
 * @property {number|null} [hoveredIndex]
 * @property {boolean} [isDragging]
 * @property {1|-1} [exitDir] - Lato d'uscita della card sfogliata (deck mobile): 1 sinistra, -1 destra
 */

/**
 * Returns the circle radius for card positioning based on container width
 * @param {number} containerWidth
 */
function getRadius(containerWidth) {
	return containerWidth * (containerWidth < 768 ? 0.8 : 1.4);
}

/**
 * Svelte action that positions carousel items along a circular arc using GSAP.
 * Cards follow the arc exactly during animation by tweening the angle (diff)
 * instead of x/y coordinates directly.
 * @param {HTMLElement} node - The carousel track container
 * @param {CarouselParams} params
 */
export function carousel(node, params = {}) {
	let activeIndex = params.activeIndex ?? 0;
	let itemsCount = params.itemsCount ?? 0;
	let hoveredIndex = params.hoveredIndex ?? null;
	let isDragging = params.isDragging ?? false;
	let exitDir = params.exitDir ?? 1;

	// Gestiamo il ciclo di vita dei tween tramite un contesto dedicato per garantire il cleanup corretto.
	const ctx = gsap.context(() => {}, node);

	/**
	 * @param {number} index - Target active index
	 */
	function updateLayout(index) {
		const cards = node.querySelectorAll('.carousel-item');
		const radius = getRadius(node.offsetWidth);
		const isMobile = media.isMobile;

		cards.forEach((card, i) => {
			let targetDiff = i - index;
			
			if (isMobile) {
				// Su mobile usiamo un wrapping asimmetrico in modo che 4 card rimangano sempre nello stack
				// dietro la card attiva, e solo la card sfogliata vada in negativo (targetDiff < 0)
				// Il wrap avviene all'indice -1.5, dove l'opacità è già 0, evitando pop visivi
				targetDiff = ((targetDiff + 1.5) % itemsCount + itemsCount) % itemsCount - 1.5;
				
				// targetDiff >= 0 rappresenta la card attiva e quelle impilate dietro
				// targetDiff < 0 rappresenta le card che sono state appena sfogliate/trascinate via
				const absDiff = Math.abs(targetDiff);

				let xVal = 0;
				let yVal = 0;
				let rotationVal = 0;
				let scaleVal = 1;
				let opacityVal = 0;
				let filterVal = 'none';
				let zIndexVal = Math.round(10 - absDiff);
				let pointerEventsVal = 'none';

				if (targetDiff >= 0) {
					// Card attiva e card dietro nello stack, allineate al centro verticalmente (peeking top)
					xVal = 0;
					yVal = -24 * targetDiff;
					rotationVal = 0;
					scaleVal = 1 - 0.04 * targetDiff;
					
					// Sfuma progressivamente per mostrare tutte e 5 le card, azzerando l'opacità per l'ultima card prima del wrap
					if (targetDiff <= 3) {
						opacityVal = 1 - 0.25 * targetDiff; // 0 -> 1.0, 1 -> 0.75, 2 -> 0.50, 3 -> 0.25
					} else {
						// Sfuma rapidamente a zero tra 3 e 4 per evitare pop visivi durante il wrap delle card
						opacityVal = Math.max(0, 0.25 * (4 - targetDiff));
					}
					
					// Sfocatura progressiva delle card nello stack per creare profondità
					if (targetDiff > 0.1) {
						const blurAmt = Math.min(3, targetDiff * 1.5);
						filterVal = `blur(${blurAmt}px)`;
					} else {
						filterVal = 'none';
					}

					// Solo la card in cima (attiva) accetta click o interazioni
					if (targetDiff < 0.5) {
						pointerEventsVal = 'auto';
					}
				} else {
					// Card trascinata via (sfogliata): traiettoria e inclinazione specchiate su exitDir,
					// così la card esce dal lato del gesto (deck bidirezionale). 380: la card
					// responsive arriva a 357px di larghezza, a 320 resterebbe un lembo visibile.
					xVal = targetDiff * 380 * exitDir;
					yVal = -targetDiff * 30; // leggero spostamento verso il basso
					rotationVal = targetDiff * 15 * exitDir; // inclinazione di rotazione
					scaleVal = 1 + targetDiff * 0.05;
					opacityVal = Math.max(0, 1 + targetDiff);
					filterVal = 'none';
					
					// Z-index elevato per farla scivolare SOPRA lo stack di sfondo
					zIndexVal = 12;
					pointerEventsVal = 'none';
				}

				ctx.add(() => {
					// xPercent/yPercent espliciti: GSAP riconosce il translate(-50%,-50%) CSS solo se
					// Math.round(offsetHeight/2) coincide con l'arrotondamento della matrix — con
					// l'altezza frazionaria della card responsive il confronto fallisce su alcune
					// larghezze di viewport e il primo set cancellerebbe il centraggio verticale
					// (card giù di mezza altezza, sopra i dots).
					gsap.set(card, {
						xPercent: -50,
						yPercent: -50,
						x: xVal,
						y: yVal,
						rotation: rotationVal,
						scale: scaleVal,
						opacity: opacityVal,
						filter: filterVal,
						zIndex: zIndexVal,
						pointerEvents: pointerEventsVal
					});
				});

			} else {
				// Layout desktop originale (3D ad arco)
				if (targetDiff > itemsCount / 2) targetDiff -= itemsCount;
				else if (targetDiff < -itemsCount / 2) targetDiff += itemsCount;

				const absDiff = Math.abs(targetDiff);
				const isHovered = hoveredIndex === i;
				
				// Interpolate opacity continuously based on distance to prevent card flickering
				let targetOpacity = 0;
				if (absDiff < 1) {
					targetOpacity = 1 - absDiff * (1 - (isHovered ? 1 : 0.85));
				} else if (absDiff < 2) {
					targetOpacity = (2 - absDiff) * (isHovered ? 1 : 0.85);
				}

				const targetZIndex = Math.round(10 - absDiff);
				const targetPointerEvents = absDiff <= 1.2 ? 'auto' : 'none';

				// Commento solo il PERCHÉ: posizioniamo istantaneamente le card lungo l'arco in base all'indice interpolato da Svelte per massima fluidità
				ctx.add(() => {
					const angle = targetDiff * ANGLE_STEP * (Math.PI / 180);
					// Stessi xPercent/yPercent espliciti del ramo mobile: il centraggio della card
					// non deve dipendere dall'euristica di parsing del transform CSS.
					gsap.set(card, {
						xPercent: -50,
						yPercent: -50,
						x: radius * Math.sin(angle),
						y: radius * (1 - Math.cos(angle)),
						rotation: targetDiff * ANGLE_STEP,
						scale: 1,
						opacity: targetOpacity,
						zIndex: targetZIndex,
						pointerEvents: targetPointerEvents,
						filter: 'none' // Reset filter desktop
					});
				});
			}
		});

		activeIndex = index;
	}

	updateLayout(activeIndex);

	const onResize = () => updateLayout(activeIndex);
	window.addEventListener('resize', onResize);

	return {
		/** @param {CarouselParams} newParams */
		update(newParams) {
			const indexChanged = newParams.activeIndex !== activeIndex || newParams.itemsCount !== itemsCount;
			const hoverChanged = newParams.hoveredIndex !== hoveredIndex;

			// Capture previous hover before updating state
			const prevHoveredIndex = hoveredIndex;
			hoveredIndex = 'hoveredIndex' in newParams ? (newParams.hoveredIndex ?? null) : hoveredIndex;
			isDragging = newParams.isDragging ?? false;
			exitDir = newParams.exitDir ?? 1;

			if (indexChanged) {
				itemsCount = newParams.itemsCount ?? itemsCount;
				const newIndex = newParams.activeIndex ?? activeIndex;
				updateLayout(newIndex);
			} else if (hoverChanged && !isDragging) {
				// Commento solo il PERCHÉ: animiamo localmente l'opacità per l'effetto hover delle card
				// adiacenti; durante il drag attivo la sopprimiamo perché l'opacità è già governata dal
				// layout di trascinamento e le due animazioni combatterebbero.
				const cards = node.querySelectorAll('.carousel-item');
				const animateCard = (/** @type {number | null} */ index, /** @type {boolean} */ highlight) => {
					if (index === null) return;
					const card = cards[index];
					if (!card) return;
					let diff = index - activeIndex;
					if (diff > itemsCount / 2) diff -= itemsCount;
					else if (diff < -itemsCount / 2) diff += itemsCount;
					// Only lateral cards (diff ±1) participate in hover opacity
					if (Math.abs(diff) !== 1) return;
					gsap.to(card, { opacity: highlight ? 1 : 0.85, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
				};
				animateCard(prevHoveredIndex, false);
				animateCard(hoveredIndex, true);
			}
		},
		destroy() {
			window.removeEventListener('resize', onResize);
			ctx.revert();
		}
	};
}
