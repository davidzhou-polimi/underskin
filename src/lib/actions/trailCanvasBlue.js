import { gsap } from 'gsap';

/**
 * @param {HTMLCanvasElement} node
 */
export function trailCanvasBlue(node) {
	const ctx = node.getContext('2d');
	if (!ctx) return;

	/** @type {HTMLCanvasElement | undefined} */
	let noiseCanvas;
	/** @type {CanvasRenderingContext2D | null | undefined} */
	let noiseCtx;
	let noiseRendered = false;
	const GRAIN_OPACITY = 0.08;

	const resizeCanvas = () => {
		node.width = window.innerWidth;
		node.height = window.innerHeight;
		noiseRendered = false;
		initNoiseCanvas();
	};
	resizeCanvas();
	window.addEventListener('resize', resizeCanvas);

	function initNoiseCanvas() {
		noiseCanvas = document.createElement('canvas');
		noiseCanvas.width = node.width;
		noiseCanvas.height = node.height;
		noiseCtx = noiseCanvas.getContext('2d');
		generateNoise();
	}

	function generateNoise() {
		if (!noiseCanvas || !noiseCtx) return;
		const w = noiseCanvas.width;
		const h = noiseCanvas.height;
		const imageData = noiseCtx.createImageData(w, h);
		const data = imageData.data;

		for (let i = 0; i < data.length; i += 4) {
			const alpha = Math.random() < 0.15 ? GRAIN_OPACITY * 255 : 0;
			data[i] = 0;
			data[i + 1] = 0;
			data[i + 2] = 0;
			data[i + 3] = alpha;
		}

		noiseCtx.putImageData(imageData, 0, 0);
	}

	function drawNoise() {
		if (!noiseCanvas || !ctx) return;
		if (!noiseRendered) {
			ctx.drawImage(noiseCanvas, 0, 0);
			noiseRendered = true;
		}
	}

	const START_ANGLE = Math.PI; // 左中位置开始
	const state = { angle: START_ANGLE, globalAlpha: 1 };
	/** @type {{ x: number, y: number }[]} */
	let points = [];
	const MAX_POINTS = 90;
	const CIRCLE_RADIUS = 600;
	let hasTriggered = false;
	/** @type {() => void} */
	let scrollHandler;

	// 蓝色渐变配置
	const BLUE_START = '#6A96DF';
	const BLUE_MID = '#3555A0';
	const BLUE_END = '#1E3A6E';

	let isAnimating = false;

	// 监听滚动，触发一次动画
	scrollHandler = () => {
		if (hasTriggered) return;
		const rect = node.getBoundingClientRect();
		if (rect.top < window.innerHeight * 0.7) {
			hasTriggered = true;
			isAnimating = true;
			// 上半圆的左半段：从左到顶
			gsap.to(state, {
				angle: Math.PI / 2, // 只划到顶部（半圆的一半）
				duration: 1.5,
				ease: 'power2.inOut',
				onComplete: () => {
					isAnimating = false;
				}
			});
		}
	};
	window.addEventListener('scroll', scrollHandler, { passive: true });

	function draw() {
		if (!ctx) return;
		// 动画时才清空画布，停留时保留拖影
		if (isAnimating) {
			ctx.clearRect(0, 0, node.width, node.height);
		}

		// 绘制噪点背景
		if (!noiseRendered && noiseCanvas && ctx) {
			ctx.drawImage(noiseCanvas, 0, 0);
			noiseRendered = true;
		}

		const centerX = node.width / 2 + 200;
		const centerY = node.height / 2 - CIRCLE_RADIUS * 0.9; // 圆心上移70%
		const currentX = centerX + Math.cos(state.angle) * CIRCLE_RADIUS;
		const currentY = centerY + Math.sin(state.angle) * CIRCLE_RADIUS;

		points.push({ x: currentX, y: currentY });

		if (points.length > MAX_POINTS) points.shift();

		if (points.length > 1) {
			for (let i = 0; i < points.length - 1; i++) {
				const p1 = points[i];
				const p2 = points[i + 1];
				const ratio = i / (points.length - 1);
				const currentWidth = 400 + (600 - 400) * Math.pow(ratio, 1.3);

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

				grad.addColorStop(0, `rgba(${hexToRgb(BLUE_START)}, 0)`);
				grad.addColorStop(0.3, `rgba(${hexToRgb(BLUE_START)}, ${finalAlpha})`);
				grad.addColorStop(0.7, `rgba(${hexToRgb(BLUE_MID)}, ${finalAlpha * 0.9})`);
				grad.addColorStop(1.0, `rgba(${hexToRgb(BLUE_END)}, ${finalAlpha * 0.95})`);

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

	/**
	 * @param {string} hex
	 */
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
			window.removeEventListener('scroll', scrollHandler);
		}
	};
}
