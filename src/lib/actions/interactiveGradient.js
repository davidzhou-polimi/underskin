import { InteractiveGradientRenderer } from '$lib/utils/interactiveGradientRenderer.js';

/**
 * @typedef {Object} GradientParams
 * @property {import('$lib/utils/interactiveGradientRenderer.js').GradientConfig} [config]
 * @property {number} [shapeId] - 0: fluid, 1: circle, 2: capsule
 * @property {number} [morphProgress] - 0.0 to 1.0 interpolation for the shape mask
 */

/**
 * Svelte Action to initialize and update a canvas using Three.js custom shader.
 * Binds DOM event listeners and exposes the renderer on the canvas element.
 * @param {HTMLCanvasElement} canvas
 * @param {GradientParams} [params]
 */
export function interactiveGradient(canvas, params = {}) {
	const renderer = new InteractiveGradientRenderer(canvas, params.config ?? {});

	if (params.shapeId !== undefined) {
		renderer.updateShape(params.shapeId, params.morphProgress ?? 1.0);
	}

	/** @type {any} */ (canvas)['__gradientRenderer'] = renderer;

	/** @param {MouseEvent} e */
	function handleMouseMove(e) {
		const x = e.clientX / window.innerWidth;
		const y = 1.0 - (e.clientY / window.innerHeight);
		renderer.updateMouse(x, y);
	}

	function handleResize() {
		renderer.resize();
	}

	function handleThemeUpdate() {
		renderer.updateColors();
	}

	window.addEventListener('mousemove', handleMouseMove);
	window.addEventListener('resize', handleResize);
	window.addEventListener('colors-update', handleThemeUpdate);

	return {
		/** @param {GradientParams} newParams */
		update(newParams) {
			if (newParams.config !== undefined) {
				renderer.updateConfig(newParams.config);
			}
			if (newParams.shapeId !== undefined) {
				renderer.updateShape(newParams.shapeId, newParams.morphProgress ?? 1.0);
			}
		},
		destroy() {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('colors-update', handleThemeUpdate);
			renderer.destroy();
			delete /** @type {any} */ (canvas)['__gradientRenderer'];
		}
	};
}
