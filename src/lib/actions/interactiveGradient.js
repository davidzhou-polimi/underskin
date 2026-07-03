import { InteractiveGradientRenderer, DEFAULT_CONFIG } from '$lib/utils/interactiveGradientRenderer.js';
import { gsap } from '$lib/utils/gsapSetup.js';

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

	// Ferma il loop di render quando il canvas esce dal viewport (es. hero delle pagine
	// archetipo con posizionamento absolute): lo shader full-screen è il costo GPU maggiore.
	const visibilityObserver = new IntersectionObserver(([entry]) => {
		if (entry.isIntersecting) renderer.resume();
		else renderer.pause();
	});
	visibilityObserver.observe(canvas);

	/** @type {gsap.core.Tween | null} */
	let activeTween = null;

	// Commento solo il PERCHÉ: Sincronizza la durata delle transizioni di GSAP con i design tokens definiti nel foglio di stile globale.
	const getTransitionDuration = (tokenName = '--transition-duration-slow', fallback = 1.2) => {
		if (typeof window === 'undefined') return fallback;
		const durationStr = getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim();
		if (!durationStr) return fallback;
		return parseFloat(durationStr) / (durationStr.endsWith('ms') ? 1000 : 1);
	};

	// Commento solo il PERCHÉ: GSAP interpola fluidamente sia i parametri scalari (coverage, speed) 
	// sia i canali cromatici (R, G, B) delle uniform di Three.js per evitare cambi di stato netti.
	/**
	 * @param {import('$lib/utils/interactiveGradientRenderer.js').GradientConfig} newConfig
	 * @param {number} [duration]
	 */
	function transitionConfig(newConfig, duration) {
		const resolvedDuration = duration ?? getTransitionDuration('--transition-duration-slow', 1.2);
		if (activeTween) activeTween.kill();

		const proxy = renderer.getAnimatableState();
		// DEFAULT_CONFIG come fallback: le proprietà non esplicitate in newConfig vengono riportate
		// ai valori di default invece di ereditare lo stato della sezione precedente (es. speed, mouseStrength).
		const { state: targetState, colorCount } = renderer.getTargetState(newConfig, DEFAULT_CONFIG);

		// colorCount non è animabile (è un int GLSL): aggiornato subito prima del tween
		// per evitare glitch cromatici quando il numero di colori cambia tra sezioni.
		/** @type {any} */ (renderer.material.uniforms).u_color_count.value = colorCount;
		renderer.config = { ...renderer.config, ...newConfig };

		activeTween = gsap.to(proxy, {
			...targetState,
			duration: resolvedDuration,
			ease: 'power2.out',
			onUpdate: () => renderer.applyAnimatableState(proxy),
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
			visibilityObserver.disconnect();
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('colors-update', handleThemeUpdate);
			renderer.destroy();
			delete /** @type {any} */ (canvas)['__gradientRenderer'];
		}
	};
}

