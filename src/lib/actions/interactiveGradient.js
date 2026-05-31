import { InteractiveGradientRenderer } from '$lib/utils/interactiveGradientRenderer.js';

/**
 * Svelte Action to initialize and update a canvas using Three.js custom shader.
 * Binds DOM event listeners and exposes the renderer on the canvas element.
 * @param {HTMLCanvasElement} canvas
 */
export function interactiveGradient(canvas) {
	// Instantiate the Three.js scene manager
	const renderer = new InteractiveGradientRenderer(canvas);

	// Attach the renderer instance to the canvas element so it can be accessed from the outside (e.g., canvas['__gradientRenderer'].updateScroll(val))
	/** @type {any} */ (canvas)['__gradientRenderer'] = renderer;

	// Handles mouse coordinates normalization (WebGL flips Y coordinate)
	/**
	 * @param {MouseEvent} e
	 */
	function handleMouseMove(e) {
		const x = e.clientX / window.innerWidth;
		const y = 1.0 - (e.clientY / window.innerHeight);
		renderer.updateMouse(x, y);
	}

	// Dynamic canvas resizing
	function handleResize() {
		renderer.resize();
	}

	// Listens for theme color changes (e.g. system mode shifts)
	function handleThemeUpdate() {
		renderer.updateColors();
	}

	window.addEventListener('mousemove', handleMouseMove);
	window.addEventListener('resize', handleResize);
	window.addEventListener('colors-update', handleThemeUpdate);

	return {
		destroy() {
			// Clean up active event listeners to prevent memory leaks
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('colors-update', handleThemeUpdate);

			// Dispose of Three.js context and geometries
			renderer.destroy();
			
			// Remove public reference from DOM
			delete /** @type {any} */ (canvas)['__gradientRenderer'];
		}
	};
}
