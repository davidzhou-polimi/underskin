/**
 * Mini trail canvas per il cerchio espanso del quiz.
 * Disegna un alone cromatico animato usando i colori degli archetipi.
 *
 * @param {HTMLCanvasElement} node
 * @param {{ size?: number }} options
 */
export function miniTrailCanvas(node, options = {}) {
	if (!node || typeof node.getContext !== 'function') return;

	const ctx = node.getContext('2d');
	if (!ctx) return;

	const size = options.size || 400;
	node.width = size;
	node.height = size;

	const computed = getComputedStyle(document.documentElement);

	/** @param {string} hex */
	function hexToRgb(hex) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
			: { r: 128, g: 53, b: 210 };
	}

	const colors = [
		hexToRgb(computed.getPropertyValue('--archetipi-favorito').trim() || '#6a96df'),
		hexToRgb(computed.getPropertyValue('--archetipi-insoddisfatto').trim() || '#8035d2'),
		hexToRgb(computed.getPropertyValue('--archetipi-infortunato').trim() || '#d86146')
	];

	const state = { angle: 0 };
	let points = /** @type {{ x: number, y: number, angle: number }[]} */ ([]);
	const MAX_POINTS = 240;
	let rafId = 0; // Tracciato per garantire il cancel corretto nel destroy
	let wobbleTime = 0;

	/** @param {number} angle */
	function getColorByAngle(angle) {
		const norm = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
		const segment = (Math.PI * 2) / colors.length;
		const index = Math.floor(norm / segment);
		const t = (norm % segment) / segment;
		const next = (index + 1) % colors.length;
		const c1 = colors[index];
		const c2 = colors[next];
		return {
			r: Math.round(c1.r + (c2.r - c1.r) * t),
			g: Math.round(c1.g + (c2.g - c1.g) * t),
			b: Math.round(c1.b + (c2.b - c1.b) * t)
		};
	}

	function draw() {
		// ctx è già verificato all'avvio, ma il type-checker non lo propaga automaticamente nelle closure
		if (!ctx) return;
		ctx.clearRect(0, 0, size, size);
		wobbleTime += 0.02;

		if (points.length < MAX_POINTS) {
			points.push({
				x: size / 2 + Math.cos(state.angle) * (size * 0.3),
				y: size / 2 + Math.sin(state.angle) * (size * 0.3),
				angle: state.angle
			});
		}

		for (const p of points) {
			const dist = Math.sqrt((p.x - size / 2) ** 2 + (p.y - size / 2) ** 2);
			if (dist < size * 0.48) {
				const dx = (p.x - size / 2) / dist;
				const dy = (p.y - size / 2) / dist;
				const wobble = Math.sin(wobbleTime + points.indexOf(p) * 0.3) * 5;
				p.x += dx * 4 + wobble * 0.15;
				p.y += dy * 4 + wobble * 0.15;
			}
		}

		if (points.length >= MAX_POINTS) points.shift();

		for (let i = 0; i < points.length; i++) {
			const p = points[i];
			const alpha = (i / points.length) * 0.9;
			const color = getColorByAngle(p.angle);
			const radius = 98 + (i / points.length) * 24;
			ctx.beginPath();
			ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
			ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
			ctx.fill();
		}

		state.angle += 0.02;
		rafId = requestAnimationFrame(draw);
	}

	rafId = requestAnimationFrame(draw);

	return {
		destroy() {
			// Cancella sempre il frame già schedulato prima che il canvas venga smontato
			cancelAnimationFrame(rafId);
		}
	};
}
