import { InteractiveGradientRenderer } from '$lib/utils/interactiveGradientRenderer.js';
import { gsap } from 'gsap';

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

	/** @type {gsap.core.Tween | null} */
	let activeTween = null;

	// Commento solo il PERCHÉ: GSAP interpola fluidamente sia i parametri scalari (coverage, speed) 
	// sia i canali cromatici (R, G, B) delle uniform di Three.js per evitare cambi di stato netti.
	/**
	 * @param {import('$lib/utils/interactiveGradientRenderer.js').GradientConfig} newConfig
	 * @param {number} [duration]
	 */
	function transitionConfig(newConfig, duration = 1.2) {
		if (activeTween) {
			activeTween.kill();
		}

		const u = renderer.material.uniforms;
		const targetValues = /** @type {any} */ ({});

		const startSpeed = u.u_speed.value;
		const startCoverage = u.u_coverage.value;
		const startGrain = u.u_grain_intensity.value;
		const startClampMin = u.u_mask_clamp.value.x;
		const startClampMax = u.u_mask_clamp.value.y;
		const startFocusX = u.u_focus.value.x;
		const startFocusY = u.u_focus.value.y;
		const startFocusRx = u.u_focus.value.z;
		const startFocusRy = u.u_focus.value.w;

		const targetSpeed = newConfig.speed !== undefined ? newConfig.speed : renderer.config.speed;
		const targetCoverage = newConfig.coverage !== undefined ? newConfig.coverage : renderer.config.coverage;
		const targetGrain = newConfig.grainIntensity !== undefined ? newConfig.grainIntensity : renderer.config.grainIntensity;
		const targetClampMin = newConfig.maskClamp !== undefined ? newConfig.maskClamp[0] : renderer.config.maskClamp[0];
		const targetClampMax = newConfig.maskClamp !== undefined ? newConfig.maskClamp[1] : renderer.config.maskClamp[1];
		
		const targetFocusX = newConfig.focusCenter !== undefined ? newConfig.focusCenter[0] : (renderer.config.focusCenter !== undefined ? renderer.config.focusCenter[0] : 0.5);
		const targetFocusY = newConfig.focusCenter !== undefined ? newConfig.focusCenter[1] : (renderer.config.focusCenter !== undefined ? renderer.config.focusCenter[1] : 0.5);
		
		const targetFocusRadius = newConfig.focusRadius !== undefined ? newConfig.focusRadius : renderer.config.focusRadius;
		const targetFocusRx = Array.isArray(targetFocusRadius) ? targetFocusRadius[0] : (targetFocusRadius !== undefined ? targetFocusRadius : 2.0);
		const targetFocusRy = Array.isArray(targetFocusRadius) ? targetFocusRadius[1] : (targetFocusRadius !== undefined ? targetFocusRadius : 2.0);

		/** @type {any} */
		const proxy = {
			speed: startSpeed,
			coverage: startCoverage,
			grainIntensity: startGrain,
			clampMin: startClampMin,
			clampMax: startClampMax,
			focusX: startFocusX,
			focusY: startFocusY,
			focusRx: startFocusRx,
			focusRy: startFocusRy,
		};

		targetValues.speed = targetSpeed;
		targetValues.coverage = targetCoverage;
		targetValues.grainIntensity = targetGrain;
		targetValues.clampMin = targetClampMin;
		targetValues.clampMax = targetClampMax;
		targetValues.focusX = targetFocusX;
		targetValues.focusY = targetFocusY;
		targetValues.focusRx = targetFocusRx;
		targetValues.focusRy = targetFocusRy;


		// Resolve target colors to THREE.Color format
		const targetPalette = renderer.resolvePalette(newConfig.colors !== undefined ? newConfig.colors : renderer.config.colors);
		const currentBg = u.u_bg_color.value;
		const currentColors = u.u_colors.value;

		proxy.bgR = currentBg.r;
		proxy.bgG = currentBg.g;
		proxy.bgB = currentBg.b;

		targetValues.bgR = targetPalette.bg.r;
		targetValues.bgG = targetPalette.bg.g;
		targetValues.bgB = targetPalette.bg.b;

		for (let i = 0; i < 16; i++) {
			proxy[`c${i}R`] = currentColors[i].r;
			proxy[`c${i}G`] = currentColors[i].g;
			proxy[`c${i}B`] = currentColors[i].b;

			targetValues[`c${i}R`] = targetPalette.colors[i].r;
			targetValues[`c${i}G`] = targetPalette.colors[i].g;
			targetValues[`c${i}B`] = targetPalette.colors[i].b;
		}

		u.u_color_count.value = targetPalette.count;

		// Maintain internal config state in renderer
		renderer.config = { ...renderer.config, ...newConfig };

		activeTween = gsap.to(proxy, {
			...targetValues,
			duration,
			ease: 'power2.out',
			onUpdate: () => {
				u.u_speed.value = proxy.speed;
				u.u_coverage.value = proxy.coverage;
				u.u_grain_intensity.value = proxy.grainIntensity;
				u.u_mask_clamp.value.set(proxy.clampMin, proxy.clampMax);
				u.u_focus.value.set(proxy.focusX, proxy.focusY, proxy.focusRx, proxy.focusRy);

				currentBg.setRGB(proxy.bgR, proxy.bgG, proxy.bgB);
				for (let i = 0; i < 16; i++) {
					currentColors[i].setRGB(proxy[`c${i}R`], proxy[`c${i}G`], proxy[`c${i}B`]);
				}
			}
		});
	}

	return {
		/** @param {GradientParams} newParams */
		update(newParams) {
			if (newParams.config !== undefined) {
				transitionConfig(newParams.config, 1.2);
			}
			if (newParams.shapeId !== undefined) {
				renderer.updateShape(newParams.shapeId, newParams.morphProgress ?? 1.0);
			}
		},
		destroy() {
			if (activeTween) {
				activeTween.kill();
			}
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('colors-update', handleThemeUpdate);
			renderer.destroy();
			delete /** @type {any} */ (canvas)['__gradientRenderer'];
		}
	};
}

