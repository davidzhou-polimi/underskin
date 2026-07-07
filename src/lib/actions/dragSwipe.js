/**
 * @typedef {Object} DragSwipeParams
 * @property {(offset: number) => void} [onDrag] - Scostamento X corrente durante un drag orizzontale (throttlato a un rAF/frame). Riceve 0 al rilascio.
 * @property {(direction: 1 | -1) => void} [onCommit] - Invocata al rilascio se superata la soglia: 1 = avanti (next), -1 = indietro (prev).
 * @property {() => void} [onStart] - Invocata all'inizio di ogni gesto (es. per disattivare l'autoplay).
 * @property {number} [threshold] - Soglia in px per confermare il cambio slide (default 70).
 */

const AXIS_LOCK_THRESHOLD = 8; // px di movimento minimo prima di decidere l'asse del gesto

/**
 * Azione touch-drag orizzontale condivisa dai caroselli a soglia (TeamCarousel, ArchetypeSection).
 *
 * Commento solo il PERCHÉ:
 * - axis-lock: al primo movimento significativo decidiamo se il gesto è orizzontale o verticale e
 *   lo blocchiamo; un gesto verticale è uno scroll di pagina e non deve trascinare il carosello né
 *   bloccare lo scroll nativo (niente preventDefault).
 * - throttling rAF: `touchmove` scatta a frequenza nativa (60–120Hz) e ogni offset propagato ri-esegue
 *   il layout GSAP del carosello; coalizziamo gli update in un solo requestAnimationFrame per frame.
 *
 * @param {HTMLElement} node
 * @param {DragSwipeParams} [params]
 */
export function dragSwipe(node, params = {}) {
	let { onDrag, onCommit, onStart, threshold = 70 } = params;

	let startX = 0;
	let startY = 0;
	/** @type {'none' | 'horizontal' | 'vertical'} */
	let axis = 'none';
	let currentOffset = 0;
	let rafId = 0;

	const flush = () => {
		rafId = 0;
		onDrag?.(currentOffset);
	};
	const scheduleFlush = () => {
		if (!rafId) rafId = requestAnimationFrame(flush);
	};

	/** @param {TouchEvent} e */
	const onTouchStart = (e) => {
		startX = e.touches[0].clientX;
		startY = e.touches[0].clientY;
		axis = 'none';
		currentOffset = 0;
		onStart?.();
	};

	/** @param {TouchEvent} e */
	const onTouchMove = (e) => {
		const dx = e.touches[0].clientX - startX;
		const dy = e.touches[0].clientY - startY;

		if (axis === 'none') {
			if (Math.abs(dx) < AXIS_LOCK_THRESHOLD && Math.abs(dy) < AXIS_LOCK_THRESHOLD) return;
			axis = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
		}
		if (axis !== 'horizontal') return;

		if (e.cancelable) e.preventDefault();
		currentOffset = dx;
		scheduleFlush();
	};

	const onTouchEnd = () => {
		if (rafId) {
			cancelAnimationFrame(rafId);
			rafId = 0;
		}
		if (axis === 'horizontal') {
			if (currentOffset < -threshold) onCommit?.(1);
			else if (currentOffset > threshold) onCommit?.(-1);
		}
		// Reset dell'offset: azzera lo scostamento per avviare l'animazione di snap GSAP del carosello.
		currentOffset = 0;
		onDrag?.(0);
		axis = 'none';
	};

	// touchmove non-passivo: serve poter chiamare preventDefault sui gesti orizzontali.
	node.addEventListener('touchstart', onTouchStart, { passive: true });
	node.addEventListener('touchmove', onTouchMove, { passive: false });
	node.addEventListener('touchend', onTouchEnd);

	return {
		/** @param {DragSwipeParams} newParams */
		update(newParams) {
			onDrag = newParams.onDrag;
			onCommit = newParams.onCommit;
			onStart = newParams.onStart;
			threshold = newParams.threshold ?? 70;
		},
		destroy() {
			if (rafId) cancelAnimationFrame(rafId);
			node.removeEventListener('touchstart', onTouchStart);
			node.removeEventListener('touchmove', onTouchMove);
			node.removeEventListener('touchend', onTouchEnd);
		}
	};
}
