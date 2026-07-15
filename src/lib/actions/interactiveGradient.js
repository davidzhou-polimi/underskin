import { InteractiveGradientRenderer, DEFAULT_CONFIG } from '$lib/utils/interactiveGradientRenderer.js';
import { gsap } from '$lib/utils/gsapSetup.js';
import { navigationState } from '$lib/stores/navigationState.svelte.js';
import { BREAKPOINT } from '$lib/actions/scrollytelling/presets.js';

/**
 * @typedef {Object} GradientParams
 * @property {import('$lib/utils/interactiveGradientRenderer.js').GradientConfig} [config]
 * @property {number} [shapeId] - 0: fluid, 1: circle, 2: capsule
 * @property {number} [morphProgress] - 0.0 to 1.0 interpolation for the shape mask
 */

/**
 * Confronto per valore tra config (shallow, array elemento-per-elemento). I config arrivano da
 * $derived che possono ricreare l'oggetto senza cambiarne la semantica: un config equivalente non
 * deve riavviare la transizione — il kill+restart continuo del tween (curva inOut che riparte da
 * ferma a ogni evento scroll) congelerebbe il gradiente finché lo scroll non si esaurisce.
 * @param {import('$lib/utils/interactiveGradientRenderer.js').GradientConfig} [a]
 * @param {import('$lib/utils/interactiveGradientRenderer.js').GradientConfig} [b]
 */
function configsEqual(a, b) {
	if (a === b) return true;
	if (!a || !b) return false;
	const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
	for (const key of keys) {
		const va = /** @type {any} */ (a)[key];
		const vb = /** @type {any} */ (b)[key];
		if (Array.isArray(va) && Array.isArray(vb)) {
			if (va.length !== vb.length || va.some((v, i) => v !== vb[i])) return false;
		} else if (va !== vb) {
			return false;
		}
	}
	return true;
}

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

	// ⚡ Bolt Optimization: Cache MediaQueryList to prevent parsing CSS query on every mousemove frame
	const mobileMediaQuery = window.matchMedia(BREAKPOINT.mobile);
	// ⚡ Bolt Optimization: Cache window dimensions to prevent reading from DOM on every mousemove
	let winWidth = window.innerWidth;
	let winHeight = window.innerHeight;

	/** @param {MouseEvent} e */
	function handleMouseMove(e) {
		// Commento solo il PERCHÉ: su mobile non esiste un cursore reale; il DevTools emula un mousemove
		// ad ogni tap che sposterebbe il gradiente falsamente. Usiamo matchMedia runtime per essere
		// reattivi al ridimensionamento della finestra in development, senza dipendere da store Svelte.
		if (mobileMediaQuery.matches) return;
		const x = e.clientX / winWidth;
		const y = 1.0 - (e.clientY / winHeight);
		renderer.updateMouse(x, y);
	}

	function handleResize() {
		winWidth = window.innerWidth;
		winHeight = window.innerHeight;
		renderer.resize();
		// Commento solo il PERCHÉ: quando si ridimensiona verso mobile, azzera l'offset del mouse
		// per cancellare qualsiasi spostamento residuo lasciato da un'interazione desktop precedente.
		if (mobileMediaQuery.matches) renderer.updateMouse(0.5, 0.5);
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

	// Commento solo il PERCHÉ: GSAP interpola fluidamente sia i parametri scalari (coverage, speed)
	// sia i canali cromatici (R, G, B) delle uniform di Three.js per evitare cambi di stato netti.
	// Durata/easing letterali (0.8s, power2.inOut): stesso ordine di grandezza e stessa curva già
	// validati per l'identica animazione (sfera↔schermo intero) nella coreografia scroll-locked
	// dell'intro (introReveal.js, anch'essa non tokenizzata) — un'unica velocità in entrambe le
	// direzioni, non tokenizzata perché è un valore di feel dell'animazione, non un token di design.
	/**
	 * @param {import('$lib/utils/interactiveGradientRenderer.js').GradientConfig} newConfig
	 * @param {number} [duration]
	 */
	function transitionConfig(newConfig, duration = 0.8) {
		if (activeTween) activeTween.kill();

		// DEFAULT_CONFIG come fallback: le proprietà non esplicitate in newConfig vengono riportate
		// ai valori di default invece di ereditare lo stato della sezione precedente (es. speed, mouseStrength).
		const { state: targetState, palette } = renderer.getTargetState(newConfig, DEFAULT_CONFIG);

		// La palette non transita canale-per-canale (riorganizzerebbe le bande): FROM congela lo
		// stato corrente, TO è la nuova palette, e paletteMix le dissolve pixel-per-pixel nello
		// shader — ogni palette resa con la propria struttura autentica, mai stati intermedi estranei.
		// Il proxy va catturato DOPO beginPaletteTransition, così paletteMix parte da 0.
		renderer.beginPaletteTransition(palette);
		const proxy = renderer.getAnimatableState();
		renderer.config = { ...renderer.config, ...newConfig };

		// Commento solo il PERCHÉ: nelle navigazioni client-side la transizione va ritardata per far
		// sfumare il titolo della pagina uscente (via heroExit) — 0.6s dalla Home (pausa teatrale dopo
		// l'uscita del titolo), 0.3s altrove. Il delay è armato da onNavigate e CONSUMATO qui one-shot:
		// vale per la sola transizione del cambio pagina. Le transizioni scroll-driven successive
		// (hero che si schiarisce, footer di /about) e l'hard load partono immediate — leggere
		// hasNavigated (mai azzerato) ritardava per sempre ogni transizione dopo la prima navigazione.
		const delay = navigationState.gradientDelay;
		navigationState.gradientDelay = 0;

		activeTween = gsap.to(proxy, {
			...targetState,
			paletteMix: 1,
			duration,
			delay,
			ease: 'power2.inOut',
			onUpdate: () => renderer.applyAnimatableState(proxy),
		});
	}

	// Il canvas persiste tra le rotte e nasce col default dello store: il primo update va applicato
	// istantaneamente per non animare un tween d'apertura indesiderato. Navigazioni e scroll successivi
	// (stessa istanza persistente) transitano morbidamente con la durata di default.
	let firstConfigApplied = false;
	// Il costruttore ha già applicato params.config: un primo update identico non deve transitare.
	let lastConfig = params.config;

	return {
		/** @param {GradientParams} newParams */
		update(newParams) {
			if (newParams.config !== undefined) {
				if (!configsEqual(newParams.config, lastConfig)) {
					transitionConfig(newParams.config, firstConfigApplied ? undefined : 0);
				}
				lastConfig = newParams.config;
				firstConfigApplied = true;
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

