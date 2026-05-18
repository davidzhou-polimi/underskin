import { gsap } from 'gsap';

export function trailCanvas(node) {
	const ctx = node.getContext('2d');
	if (!ctx) return;

	// Grain noise canvas
	let noiseCanvas;
	let noiseCtx;
	const GRAIN_OPACITY = 0.12;

	const resizeCanvas = () => {
		node.width = window.innerWidth;
		node.height = window.innerHeight;
		initNoiseCanvas();
	};
	resizeCanvas();
	window.addEventListener('resize', resizeCanvas);

	function initNoiseCanvas() {
		noiseCanvas = document.createElement('canvas');
		noiseCanvas.width = window.innerWidth;
		noiseCanvas.height = window.innerHeight;
		noiseCtx = noiseCanvas.getContext('2d');
		generateNoise();
	}

	function generateNoise() {
		const w = noiseCanvas.width;
		const h = noiseCanvas.height;
		const imageData = noiseCtx.createImageData(w, h);
		const data = imageData.data;

		for (let i = 0; i < data.length; i += 4) {
			const v = Math.random() * 255;
			const alpha = Math.random() < 0.15 ? GRAIN_OPACITY * 255 : 0;
			data[i] = 0;
			data[i + 1] = 0;
			data[i + 2] = 0;
			data[i + 3] = alpha;
		}

		noiseCtx.putImageData(imageData, 0, 0);
	}

	// Regenerate noise every frame for animated grain
	function drawNoise() {
		if (noiseCanvas && Math.random() < 0.3) {
			generateNoise();
		}
		ctx.drawImage(noiseCanvas, 0, 0);
	}

	const START_ANGLE = Math.PI * 0.75;
	const state = { angle: START_ANGLE, globalAlpha: 1 };
	let points = [];
	const MAX_POINTS = 130;
	const CIRCLE_RADIUS = 600;

	const tl = gsap.timeline({
		repeat: -1,
		repeatDelay: 2.5,
		onStart: () => { points = []; state.globalAlpha = 1; },
		onRepeat: () => { points = []; state.globalAlpha = 1; }
	});

	tl.to(state, { angle: START_ANGLE + Math.PI * 1.2, duration: 1.2, ease: 'power2.in' });
	tl.to(state, { angle: START_ANGLE + Math.PI * 1.5, globalAlpha: 0, duration: 0.7, ease: 'power1.out' });

	function draw() {
		ctx.clearRect(0, 0, node.width, node.height);

		const centerX = node.width / 2;
		const centerY = node.height / 2;
		const currentX = centerX + Math.cos(state.angle) * CIRCLE_RADIUS;
		const currentY = centerY + Math.sin(state.angle) * CIRCLE_RADIUS;

		if (tl.isActive()) {
			points.push({ x: currentX, y: currentY });
		}

		if (points.length > MAX_POINTS) points.shift();

		if (points.length > 1) {
			for (let i = 0; i < points.length - 1; i++) {
				const p1 = points[i];
				const p2 = points[i + 1];
				const ratio = i / (points.length - 1);
				const currentWidth = 60 + (400 - 60) * Math.pow(ratio, 1.3);

				let baseAlpha;
				if (ratio < 0.3188) {
					baseAlpha = (ratio / 0.3188) * 0.4;
				} else {
					baseAlpha = 0.4 + (0.85 - 0.4) * ((ratio - 0.3188) / (1 - 0.3188));
				}
				const finalAlpha = baseAlpha * state.globalAlpha;

				const midX = (p1.x + p2.x) / 2;
				const midY = (p1.y + p2.y) / 2;
				const angle = Math.PI / 4;
				const cos45 = Math.cos(angle);
				const sin45 = Math.sin(angle);

				const grad = ctx.createLinearGradient(
					midX - cos45 * (currentWidth * 0.5),
					midY - sin45 * (currentWidth * 0.5),
					midX + cos45 * (currentWidth * 0.5),
					midY + sin45 * (currentWidth * 0.5)
				);

				const trailStart = getComputedStyle(document.documentElement)
					.getPropertyValue('--color-trail-start').trim() || '#6a96df';
				const trailMid = getComputedStyle(document.documentElement)
					.getPropertyValue('--color-trail-mid').trim() || '#9b59b6';
				const trailEnd = getComputedStyle(document.documentElement)
					.getPropertyValue('--color-trail-end').trim() || '#ff7556';

				grad.addColorStop(0, `rgba(${hexToRgb(trailStart)}, 0)`);
				grad.addColorStop(0.3, `rgba(${hexToRgb(trailStart)}, ${finalAlpha})`);
				grad.addColorStop(0.7, `rgba(${hexToRgb(trailMid)}, ${finalAlpha * 0.9})`);
				grad.addColorStop(1.0, `rgba(${hexToRgb(trailEnd)}, ${finalAlpha * 0.95})`);

				ctx.beginPath();
				ctx.moveTo(p1.x, p1.y);
				ctx.lineTo(p2.x, p2.y);
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				ctx.lineWidth = currentWidth;
				ctx.strokeStyle = grad;
				ctx.stroke();
			}
		}

		drawNoise();

		requestAnimationFrame(draw);
	}

	function hexToRgb(hex) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
			: '106, 150, 223';
	}

	draw();

	return {
		destroy() {
			window.removeEventListener('resize', resizeCanvas);
			tl.kill();
		}
	};
}
