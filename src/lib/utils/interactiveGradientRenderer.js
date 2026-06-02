import * as THREE from 'three';

/**
 * @typedef {Object} GradientConfig
 * @property {{ bg?: string, c1?: string, c2?: string, c3?: string } | { bg?: string, colors?: string[] } | string[] | null} [colors]
 * @property {number} [speed]            - Animation speed multiplier (default 1.0)
 * @property {number} [waveFrequency]    - Spatial frequency of noise blobs (lower = larger blobs)
 * @property {[number, number]} [waveAmplitude] - Domain warp amplitude [layer1, layer2]
 * @property {number} [coverage]         - 0=sparse blobs, 1=full-screen wash
 * @property {number} [intensity]        - Opacity/saturation of the blobs (0=invisible, 1=full, default 1.0); independent from coverage
 * @property {[number, number]} [focusCenter]   - UV center of gradient concentration [x, y]
 * @property {number | [number, number]} [focusRadius] - Focus radius [rx, ry] or single value for circle
 * @property {number} [viscosity]        - Mouse follow lerp factor (lower = more viscous)
 * @property {number} [mouseRadius]      - Radius of mouse gravitational influence
 * @property {number} [mouseStrength]    - Max UV displacement from mouse
 * @property {number} [splatCount]       - Max concurrent fluid splat points
 * @property {number} [splatRadius]      - Gaussian radius of each splat
 * @property {number} [splatDecay]       - Per-frame life decay (0.96 ≈ 2s lifetime at 60fps)
 * @property {number} [splatVorticity]   - Rotational wake intensity behind cursor (0–1)
 * @property {number} [grainIntensity]   - Film grain strength
 * @property {number} [grainSpeed]       - Animation speed of the film grain in FPS (0 = static, default 0.0)
 * @property {number} [colorBlending]    - Color transition sharpness multiplier
 * @property {number} [shapeId]          - 0=fluid, 1=circle, 2=capsule
 * @property {number} [morphProgress]    - Shape morph 0.0–1.0
 * @property {[number, number]} [maskClamp] - Min and max clamping limits for the shape mask (default [0.0, 1.0])
 * @property {'depth' | 'none'} [scrollEffect] - Scroll interaction: 'depth' = NEAT-style infinite procedural scroll
 * @property {number} [scrollDepth]     - Depth units traversed over full scroll (higher = more dramatic morph)
 * @property {number} [scrollParallax]  - Y parallax shift over full scroll in UV units (default 0.6 = 60% of screen height)
 */

/** @type {Required<GradientConfig>} */
export const DEFAULT_CONFIG = {
	colors: null,
	speed: 1.0,
	waveFrequency: 0.8,
	waveAmplitude: [1.4, 0.18],
	coverage: 0.5,
	intensity: 1.0,
	focusCenter: [0.5, 0.5],
	focusRadius: 2.0,
	viscosity: 0.07,
	mouseRadius: 1,
	mouseStrength: 0,
	splatCount: 16,
	splatRadius: 0.18,
	splatDecay: 0.96,
	splatVorticity: 0.4,
	grainIntensity: 0.05,
	grainSpeed: 0,
	colorBlending: 1.0,
	shapeId: 0,
	morphProgress: 0.0,
	maskClamp: [0.0, 1.0],
	scrollEffect: 'depth',
	scrollDepth: 0.75,
	scrollParallax: 0.9,
};

const MAX_SPLATS = 16;

// Commento solo il PERCHÉ: Consente di risolvere le espressioni CSS `var(--token)` in valori 
// esadecimali reali leggibili da Three.js senza dover dipendere da valori hardcoded in JS.
/**
 * @param {any} colorVal
 * @returns {string}
 */
function resolveColorString(colorVal) {
	if (typeof window !== 'undefined' && typeof colorVal === 'string' && colorVal.startsWith('var(')) {
		const match = colorVal.match(/var\((--[a-zA-Z0-9_-]+)\)/);
		if (match) {
			const style = getComputedStyle(document.documentElement);
			return style.getPropertyValue(match[1]).trim() || colorVal;
		}
	}
	return colorVal;
}

/**
 * @param {any} [override]
 */
function getThemeColors(override = null) {
	let bgVal = '#f1fafd';
	/** @type {string[]} */
	let gradientColors = [];

	// Fallback to global CSS custom design token properties when running in a browser environment
	if (typeof window !== 'undefined') {
		const style = getComputedStyle(document.documentElement);
		bgVal = style.getPropertyValue('--background-primary').trim() || '#f1fafd';
		gradientColors = [
			style.getPropertyValue('--archetipi-favorito').trim() || '#6a96df',
			style.getPropertyValue('--archetipi-insoddisfatto').trim() || '#8035d2',
			style.getPropertyValue('--archetipi-infortunato').trim() || '#d86146'
		];
	} else {
		gradientColors = ['#6a96df', '#8035d2', '#d86146'];
	}

	// Supporta: array piatto di stringhe colore, oppure oggetto { bg?, colors[] }
	if (override) {
		if (Array.isArray(override)) {
			gradientColors = override;
		} else if (typeof override === 'object') {
			if (override.bg !== undefined) bgVal = override.bg;
			if (Array.isArray(override.colors)) gradientColors = override.colors;
		}
	}

	// Commento solo il PERCHÉ: Converte le variabili CSS in esadecimale prima di istanziare THREE.Color
	// per evitare che Three.js fallisca il parsing della stringa var().
	const finalBg = resolveColorString(bgVal);
	const finalColors = gradientColors.map(resolveColorString);

	return {
		bg: new THREE.Color(finalBg),
		colors: finalColors.map(c => new THREE.Color(c))
	};
}

/**
 * Pads the color array to meet WebGL uniform array length requirements
 * @param {THREE.Color[]} themeColorsArray
 * @param {number} maxColors
 */
function getUniformColors(themeColorsArray, maxColors = 16) {
	const uniformArray = [];
	const length = themeColorsArray.length;
	for (let i = 0; i < maxColors; i++) {
		if (i < length) {
			uniformArray.push(themeColorsArray[i]);
		} else {
			// Pad the remaining slots with the last active color to avoid blending issues with black/null colors
			uniformArray.push(length > 0 ? themeColorsArray[length - 1] : new THREE.Color(0, 0, 0));
		}
	}
	return uniformArray;
}

const fsSource = `
	precision mediump float;
	varying vec2 v_uv;

	uniform vec2 u_resolution;
	uniform float u_time;
	uniform vec2 u_mouse;
	uniform vec2 u_mouse_velocity;
	uniform float u_scroll;

	uniform float u_target_shape;
	uniform float u_shape_morph;

	uniform vec3 u_bg_color;
	uniform vec3 u_colors[16];
	uniform int u_color_count;

	// Configurable animation parameters
	uniform float u_speed;
	uniform float u_wave_freq;
	uniform vec2 u_wave_amp;
	uniform float u_coverage;
	uniform float u_intensity;
	uniform vec4 u_focus; // xy = center, zw = radius [rx, ry]
	uniform float u_mouse_radius;
	uniform float u_mouse_strength;
	uniform float u_grain_intensity;
	uniform float u_grain_speed;
	uniform float u_color_blending;
	uniform float u_vorticity;
	uniform vec2 u_mask_clamp;
	uniform float u_scroll_depth;
	uniform float u_scroll_parallax;

	// Persistent fluid splat field
	uniform vec4 u_splats[16];
	uniform int u_splat_count;
	uniform float u_splat_radius;

	// Ashima Arts Simplex 3D noise
	vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
	vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

	float snoise(vec3 v) {
		const vec2 C = vec2(1.0/6.0, 1.0/3.0);
		const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

		vec3 i  = floor(v + dot(v, C.yyy));
		vec3 x0 = v - i + dot(i, C.xxx);

		vec3 g = step(x0.yzx, x0.xyz);
		vec3 l = 1.0 - g;
		vec3 i1 = min(g.xyz, l.zxy);
		vec3 i2 = max(g.xyz, l.zxy);

		vec3 x1 = x0 - i1 + 1.0 * C.xxx;
		vec3 x2 = x0 - i2 + 2.0 * C.xxx;
		vec3 x3 = x0 - D.yyy;

		i = mod(i, 289.0);
		vec4 p = permute(permute(permute(
					i.z + vec4(0.0, i1.z, i2.z, 1.0))
				+ i.y + vec4(0.0, i1.y, i2.y, 1.0))
				+ i.x + vec4(0.0, i1.x, i2.x, 1.0));

		float n_ = 0.142857142857;
		vec3 ns = n_ * D.wyz - D.xzx;

		vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

		vec4 x_ = floor(j * ns.z);
		vec4 y_ = floor(j - 7.0 * x_);

		vec4 x = x_ * ns.x + ns.yyyy;
		vec4 y = y_ * ns.x + ns.yyyy;
		vec4 h = 1.0 - abs(x) - abs(y);

		vec4 b0 = vec4(x.xy, y.xy);
		vec4 b1 = vec4(x.zw, y.zw);

		vec4 s0 = floor(b0)*2.0 + 1.0;
		vec4 s1 = floor(b1)*2.0 + 1.0;
		vec4 sh = -step(h, vec4(0.0));

		vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
		vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

		vec3 p0 = vec3(a0.xy, h.x);
		vec3 p1 = vec3(a0.zw, h.y);
		vec3 p2 = vec3(a1.xy, h.z);
		vec3 p3 = vec3(a1.zw, h.w);

		vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
		p0 *= norm.x;
		p1 *= norm.y;
		p2 *= norm.z;
		p3 *= norm.w;

		vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
		m = m * m;
		return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
	}

	float grain(vec2 uv, float time) {
		return fract(sin(dot(uv + time * 0.01, vec2(12.9898, 78.233))) * 43758.5453) * 2.0 - 1.0;
	}

	float sdCircle(vec2 p, float r) {
		return length(p) - r;
	}

	float sdCapsule(vec2 p, vec2 a, vec2 b, float r) {
		vec2 pa = p - a, ba = b - a;
		float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
		return length(pa - ba * h) - r;
	}

	// Gaussian velocity field from all active splats — creates persistent fluid interaction.
	// Operates in pure UV [0-1] space; caller converts to aspect-corrected space when applying.
	vec2 computeSplatField(vec2 uv) {
		vec2 force = vec2(0.0);
		for (int i = 0; i < 16; i++) {
			if (i >= u_splat_count) break;
			vec2 splatPos = u_splats[i].xy;
			vec2 splatVel = u_splats[i].zw;

			float splatSpeed = length(splatVel);
			if (splatSpeed < 0.0001) continue;

			vec2 diff = uv - splatPos;
			float d2 = dot(diff, diff);
			float r2 = u_splat_radius * u_splat_radius;
			float gaussian = exp(-d2 / r2);

			// Push along velocity direction
			force += splatVel * gaussian;

			// Stirring vortex: signed cross product gives opposite longitudinal forces
			// on each side of the cursor path, creating a rotational wake
			float cross_val = splatVel.x * diff.y - splatVel.y * diff.x;
			vec2 splatDir = splatVel / splatSpeed;
			force += splatDir * cross_val * gaussian * u_vorticity;
		}
		return force;
	}

	vec2 domainWarp(vec2 uv, float time, float mouse_effect) {
		// Scroll advances the Z axis of the noise — scrolling travels through an infinite 3D fluid field.
		// The gradient morphs continuously and never repeats, like NEAT's yOffset-driven depth traversal.
		float z = time * 0.12 + u_scroll * u_scroll_depth;
		vec3 p = vec3(uv * u_wave_freq, z);

		vec2 q = vec2(
			snoise(p),
			snoise(p + vec3(5.2, 1.3, 0.8))
		);

		// u_wave_amp.x scales both the internal feedback and the first-layer output (0.35 = 1.4 * 0.25)
		vec3 r_p = p + vec3(q * u_wave_amp.x, time * 0.08) + vec3(mouse_effect * 0.4, 0.0, 0.0);
		vec2 r = vec2(
			snoise(r_p),
			snoise(r_p + vec3(8.3, 2.8, 1.7))
		);

		return uv + q * (u_wave_amp.x * 0.25) + r * u_wave_amp.y;
	}

	void main() {
		vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
		vec2 uv = v_uv;
		float scaled_time = u_time; // la moltiplicazione per speed avviene in JS (scaledTime += dt * u_speed)

		// 1. Mouse gravitational UV warp based on velocity and direction
		vec2 to_mouse = (u_mouse - uv) * aspect;
		float mouse_dist = length(to_mouse);
		float mouse_attraction = smoothstep(u_mouse_radius, 0.0, mouse_dist);

		float speed = length(u_mouse_velocity);
		vec2 warp_vector = vec2(0.0);

		if (speed > 0.01) {
			vec2 move_dir = normalize(u_mouse_velocity);

			float angle_noise = snoise(vec3(uv * 4.0, scaled_time * 0.5)) * 0.35;
			float c = cos(angle_noise);
			float s = sin(angle_noise);
			mat2 noise_rot = mat2(c, s, -s, c);
			vec2 perturbed_dir = noise_rot * move_dir;

			float strength = min(speed * 0.01, u_mouse_strength);
			warp_vector += perturbed_dir * strength * mouse_attraction;
		}

		vec2 warped_by_mouse_uv = uv - warp_vector;
		vec2 centered_uv_aspect = (warped_by_mouse_uv - 0.5) * aspect;

		// 3. Domain warping — scroll drives both Z depth (morph) and Y parallax (spatial drift)
		// Y shift: as scroll increases the noise field drifts downward, creating natural parallax
		vec2 scroll_uv_offset = vec2(0.0, -u_scroll * u_scroll_parallax);
		vec2 warped_uv = domainWarp((warped_by_mouse_uv + scroll_uv_offset) * aspect, scaled_time, mouse_attraction);

		// 4. Splat field applied AFTER domain warp — displaces color-sampling UV directly.
		// Cap force magnitude to avoid UV tearing at high splat densities.
		vec2 splat_force = computeSplatField(uv);
		float sf_len = length(splat_force);
		splat_force *= min(1.0, 0.15 / max(sf_len, 0.0001));
		warped_uv -= splat_force * aspect;

		// 5. Base fluid noise — scroll depth offset ensures infinite procedural variation on scroll
		float scroll_z = u_scroll * u_scroll_depth * 0.8;
		float shape_noise = snoise(vec3(warped_uv * (u_wave_freq * 0.75), scaled_time * 0.08 + scroll_z));

		// 7. SDF shape morphing
		float circle_sdf = sdCircle(centered_uv_aspect, 0.35);
		float capsule_sdf = sdCapsule(centered_uv_aspect, vec2(0.0, 0.25), vec2(0.0, -0.25), 0.25);
		float circle_mask = smoothstep(0.2, -0.2, circle_sdf);
		float capsule_mask = smoothstep(0.2, -0.2, capsule_sdf);
		float target_shape_mask = mix(circle_mask, capsule_mask, step(1.5, u_target_shape));
		float target_bias = (target_shape_mask - 0.5) * 2.0;
		float is_shaped = step(0.5, u_target_shape);
		float morphed_fluid = mix(shape_noise, shape_noise + target_bias * 1.5, u_shape_morph * is_shaped);

		// 7. Coverage bias: sposta il threshold del noise decidendo *dove* compaiono i blob.
		// La normalizzazione successiva garantisce che l'intensità del colore nelle zone blob
		// rimanga piena indipendentemente da coverage — bassa coverage = blob radi ma saturi.
		float coverage_bias = (u_coverage - 0.5) * 2.5;
		float shape_mask = smoothstep(-1.2, 1.2, morphed_fluid + coverage_bias);

		// Soft minimum density: even in "background" regions a subtle color field bleeds through,
		// eliminating the hard boundary between gradient blobs and background entirely.
		shape_mask = mix(0.05, 1.0, shape_mask);

		// Focus area: attenuate gradient outside a configurable elliptical region
		vec2 focus_offset = ((uv - u_focus.xy) * aspect) / max(u_focus.zw, vec2(0.0001));
		float focus_dist = length(focus_offset);
		float focus_weight = 1.0 - smoothstep(0.5, 1.0, focus_dist);
		shape_mask *= mix(0.0, 1.0, focus_weight);
		shape_mask = clamp(shape_mask, u_mask_clamp.x, u_mask_clamp.y);

		// Riscala shape_mask in [0, 1] rispetto al picco atteso per questa coverage,
		// così i blob mantengono piena intensità cromatica anche a coverage bassa.
		// Il picco teorico di smoothstep(-1.2, 1.2, x + bias) con x in [-1,1] è
		// smoothstep(-1.2, 1.2, 1.0 + bias); lo approssimiamo con il soft-floor già applicato.
		float expected_peak = mix(0.05, 1.0, smoothstep(-1.2, 1.2, 1.0 + coverage_bias));
		expected_peak = max(expected_peak, 0.06); // evita divisione per zero a coverage≈0
		shape_mask = clamp(shape_mask / expected_peak, 0.0, 1.0);

		// intensity scala l'opacità dei blob indipendentemente dalla coverage
		shape_mask *= u_intensity;

		// 8. Color blending — scroll_z offsets the color noise too so colors morph with scroll
		float blend_range = u_color_blending * 0.8;
		vec3 shape_color = u_colors[0];
		for (int i = 1; i < 16; i++) {
			if (i >= u_color_count) break;
			// We dynamically scale frequency and coordinate offsets based on indices to match the legacy 3-color blending
			// mathematically, while scaling organically for any additional user-configured colors.
			float scale = 0.7 + float(i - 1) * 0.2;
			vec2 offset = vec2(float(i - 1) * 1.5);
			float time_mult = 0.1 - float(i - 1) * 0.03;
			float scroll_mult = 0.5 - float(i - 1) * 0.15;
			float layer_blend = smoothstep(-blend_range, blend_range, snoise(vec3(warped_uv * scale + offset, scaled_time * time_mult + scroll_z * scroll_mult)));
			shape_color = mix(shape_color, u_colors[i], layer_blend);
		}

		// 9. Film grain — step-based animation to avoid high-frequency flickering.
		// If u_grain_speed is 0.0, the grain pattern remains completely static.
		float grain_time = u_grain_speed > 0.0 ? floor(u_time * u_grain_speed) : 0.0;
		float g = grain(v_uv * u_resolution, grain_time) * u_grain_intensity;

		vec3 final_color = mix(u_bg_color, shape_color + vec3(g), shape_mask);

		// Gamma correction: linear -> sRGB
		gl_FragColor = vec4(pow(final_color, vec3(1.0 / 2.2)), 1.0);
	}
`;

/**
 * Three.js scene manager for the domain-warping fluid background.
 * All visual parameters are configurable via the options object.
 */
export class InteractiveGradientRenderer {
	/**
	 * @param {HTMLCanvasElement} canvas
	 * @param {GradientConfig} [options]
	 */
	constructor(canvas, options = {}) {
		this.canvas = canvas;
		/** @type {Required<GradientConfig>} */
		this.config = { ...DEFAULT_CONFIG, ...options };

		this.animationFrameId = 0;
		this.startTime = performance.now();
		this.lastTime = performance.now();
		// scaledTime accumula il tempo pesato per u_speed frame-by-frame in JS,
		// evitando il salto di fase in scaled_time = u_time * u_speed quando u_time è grande.
		this.scaledTime = 0.0;

		this.mouse = {
			current: new THREE.Vector2(0.5, 0.5),
			target: new THREE.Vector2(0.5, 0.5),
			lastTarget: new THREE.Vector2(0.5, 0.5),
			velocity: new THREE.Vector2(0, 0),
			speed: 0
		};
		this.scroll = { current: 0, target: 0 };
		this.shape = {
			id: this.config.shapeId,
			morph: this.config.morphProgress,
			currentMorph: 0.0
		};

		// Ring buffer of active fluid splats
		/** @type {{ x: number, y: number, vx: number, vy: number, life: number }[]} */
		this.splats = [];
		// Reusable Vector4 pool for the GPU uniform — avoids allocation each frame
		this.splatPool = Array.from({ length: MAX_SPLATS }, () => new THREE.Vector4(0, 0, 0, 0));

		this.themeColors = getThemeColors(this.config.colors);

		this.scene = new THREE.Scene();
		this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			powerPreference: 'high-performance',
			antialias: false,
			depth: false,
			stencil: false
		});
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		this.geometry = new THREE.PlaneGeometry(2, 2);
		this.material = new THREE.ShaderMaterial({
			uniforms: {
				u_resolution:     { value: new THREE.Vector2() },
				u_time:           { value: 0 },
				u_mouse:          { value: this.mouse.current },
				u_mouse_velocity: { value: this.mouse.velocity },
				u_scroll:         { value: 0 },
				u_target_shape:   { value: this.shape.id },
				u_shape_morph:    { value: 0 },
				u_bg_color:       { value: this.themeColors.bg },
				u_colors:         { value: getUniformColors(this.themeColors.colors, 16) },
				u_color_count:    { value: this.themeColors.colors.length },
				// Configurable parameters
				u_speed:          { value: this.config.speed },
				u_wave_freq:      { value: this.config.waveFrequency },
				u_wave_amp:       { value: new THREE.Vector2(...this.config.waveAmplitude) },
				u_coverage:       { value: this.config.coverage },
				u_intensity:      { value: this.config.intensity },
				u_focus:          { value: new THREE.Vector4(
					this.config.focusCenter[0],
					this.config.focusCenter[1],
					Array.isArray(this.config.focusRadius) ? this.config.focusRadius[0] : this.config.focusRadius,
					Array.isArray(this.config.focusRadius) ? this.config.focusRadius[1] : this.config.focusRadius
				) },
				u_mouse_radius:   { value: this.config.mouseRadius },
				u_mouse_strength: { value: this.config.mouseStrength },
				u_grain_intensity:{ value: this.config.grainIntensity },
				u_grain_speed:    { value: this.config.grainSpeed },
				u_color_blending: { value: this.config.colorBlending },
				u_vorticity:      { value: this.config.splatVorticity },
				u_mask_clamp:     { value: new THREE.Vector2(...this.config.maskClamp) },
				u_scroll_depth:     { value: this.config.scrollEffect === 'none' ? 0 : this.config.scrollDepth },
				u_scroll_parallax:  { value: this.config.scrollEffect === 'none' ? 0 : this.config.scrollParallax },
				// Splat system
				u_splats:         { value: this.splatPool },
				u_splat_count:    { value: 0 },
				u_splat_radius:   { value: this.config.splatRadius },
			},
			vertexShader: `
				varying vec2 v_uv;
				void main() {
					v_uv = uv;
					gl_Position = vec4(position, 1.0);
				}
			`,
			fragmentShader: fsSource,
			depthWrite: false,
			depthTest: false
		});

		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.scene.add(/** @type {any} */ (this.mesh));

		this.resize();
		this.animate();
	}

	updateColors() {
		this.themeColors = getThemeColors(this.config.colors);
		const uniforms = /** @type {any} */ (this.material.uniforms);
		uniforms.u_bg_color.value = this.themeColors.bg;
		uniforms.u_colors.value = getUniformColors(this.themeColors.colors, 16);
		uniforms.u_color_count.value = this.themeColors.colors.length;
	}

	// Privato: converte una palette (anche con var CSS) nei 16 slot richiesti da WebGL.
	/**
	 * @param {any} colorsOverride
	 */
	_resolvePalette(colorsOverride) {
		const resolved = getThemeColors(colorsOverride);
		return {
			bg: resolved.bg,
			colors: getUniformColors(resolved.colors, 16),
			count: resolved.colors.length
		};
	}

	/**
	 * Restituisce uno snapshot plain-object di tutti i valori uniform animabili.
	 * Pensato per essere usato come proxy GSAP: contiene solo numeri, nessun oggetto THREE.
	 * @returns {Record<string, number>}
	 */
	getAnimatableState() {
		const u = /** @type {any} */ (this.material.uniforms);
		const colors = u.u_colors.value;
		/** @type {Record<string, number>} */
		const state = {
			speed: u.u_speed.value,
			coverage: u.u_coverage.value,
			intensity: u.u_intensity.value,
			grainIntensity: u.u_grain_intensity.value,
			clampMin: u.u_mask_clamp.value.x,
			clampMax: u.u_mask_clamp.value.y,
			focusX: u.u_focus.value.x,
			focusY: u.u_focus.value.y,
			focusRx: u.u_focus.value.z,
			focusRy: u.u_focus.value.w,
			bgR: u.u_bg_color.value.r,
			bgG: u.u_bg_color.value.g,
			bgB: u.u_bg_color.value.b,
		};
		for (let i = 0; i < 16; i++) {
			state[`c${i}R`] = colors[i].r;
			state[`c${i}G`] = colors[i].g;
			state[`c${i}B`] = colors[i].b;
		}
		return state;
	}

	/**
	 * Risolve una GradientConfig nel corrispondente stato target compatibile con getAnimatableState().
	 * Restituisce anche il colorCount per l'uniform non-animata u_color_count.
	 * @param {GradientConfig} newConfig
	 * @param {Required<GradientConfig>} [fallback] - Base da cui leggere i valori non specificati in newConfig.
	 *   Passare DEFAULT_CONFIG per garantire il ripristino ai valori di default invece di ereditare
	 *   lo stato della sezione precedente.
	 * @returns {{ state: Record<string, number>, colorCount: number }}
	 */
	getTargetState(newConfig, fallback = this.config) {
		const c = fallback;
		const focusRadius = newConfig.focusRadius ?? c.focusRadius;
		const focusCenter = newConfig.focusCenter ?? c.focusCenter;
		const palette = this._resolvePalette(newConfig.colors !== undefined ? newConfig.colors : c.colors);

		/** @type {Record<string, number>} */
		const state = {
			speed: newConfig.speed ?? c.speed,
			coverage: newConfig.coverage ?? c.coverage,
			intensity: newConfig.intensity ?? c.intensity,
			grainIntensity: newConfig.grainIntensity ?? c.grainIntensity,
			clampMin: (newConfig.maskClamp ?? c.maskClamp)[0],
			clampMax: (newConfig.maskClamp ?? c.maskClamp)[1],
			focusX: focusCenter[0],
			focusY: focusCenter[1],
			focusRx: Array.isArray(focusRadius) ? focusRadius[0] : focusRadius,
			focusRy: Array.isArray(focusRadius) ? focusRadius[1] : focusRadius,
			bgR: palette.bg.r,
			bgG: palette.bg.g,
			bgB: palette.bg.b,
		};
		for (let i = 0; i < 16; i++) {
			state[`c${i}R`] = palette.colors[i].r;
			state[`c${i}G`] = palette.colors[i].g;
			state[`c${i}B`] = palette.colors[i].b;
		}
		return { state, colorCount: palette.count };
	}

	/**
	 * Applica uno stato plain-object (da getAnimatableState) agli uniform WebGL.
	 * Chiamato a ogni tick GSAP onUpdate — deve rimanere allocation-free.
	 * @param {Record<string, number>} state
	 */
	applyAnimatableState(state) {
		const u = /** @type {any} */ (this.material.uniforms);
		u.u_speed.value = state.speed;
		u.u_coverage.value = state.coverage;
		u.u_intensity.value = state.intensity;
		u.u_grain_intensity.value = state.grainIntensity;
		u.u_mask_clamp.value.set(state.clampMin, state.clampMax);
		u.u_focus.value.set(state.focusX, state.focusY, state.focusRx, state.focusRy);
		u.u_bg_color.value.setRGB(state.bgR, state.bgG, state.bgB);
		const colors = u.u_colors.value;
		for (let i = 0; i < 16; i++) {
			colors[i].setRGB(state[`c${i}R`], state[`c${i}G`], state[`c${i}B`]);
		}
	}


	/**
	 * @param {number} x - normalized x [0-1]
	 * @param {number} y - normalized y [0-1]
	 */
	updateMouse(x, y) {
		this.mouse.target.set(x, y);
	}

	/**
	 * @param {number} value - scroll progress [0-1] or pixel offset [>1]
	 */
	updateScroll(value) {
		if (this.config.scrollEffect === 'none') return;
		// Scroll progress is passed to the shader as u_scroll and used as depth offset in domainWarp
		if (value > 1.0) {
			const docHeight = document.documentElement.scrollHeight - window.innerHeight;
			this.scroll.target = docHeight > 0 ? value / docHeight : 0;
		} else {
			this.scroll.target = value;
		}
	}

	/**
	 * @param {number} shapeId - 0=fluid, 1=circle, 2=capsule
	 * @param {number} [morphProgress]
	 */
	updateShape(shapeId, morphProgress = 1.0) {
		this.shape.id = shapeId;
		this.shape.morph = morphProgress;
		/** @type {any} */ (this.material.uniforms).u_target_shape.value = this.shape.id;
	}

	/**
	 * Live-updates one or more config values without reinitializing the renderer.
	 * @param {GradientConfig} options
	 */
	updateConfig(options) {
		this.config = { ...this.config, ...options };
		const u = /** @type {any} */ (this.material.uniforms);
		if (options.speed !== undefined)         u.u_speed.value = this.config.speed;
		if (options.waveFrequency !== undefined)  u.u_wave_freq.value = this.config.waveFrequency;
		if (options.waveAmplitude !== undefined)  u.u_wave_amp.value.set(...this.config.waveAmplitude);
		if (options.coverage !== undefined)       u.u_coverage.value = this.config.coverage;
		if (options.intensity !== undefined)      u.u_intensity.value = this.config.intensity;
		if (options.focusCenter !== undefined || options.focusRadius !== undefined) {
			const rx = Array.isArray(this.config.focusRadius) ? this.config.focusRadius[0] : this.config.focusRadius;
			const ry = Array.isArray(this.config.focusRadius) ? this.config.focusRadius[1] : this.config.focusRadius;
			u.u_focus.value.set(this.config.focusCenter[0], this.config.focusCenter[1], rx, ry);
		}
		if (options.mouseRadius !== undefined)    u.u_mouse_radius.value = this.config.mouseRadius;
		if (options.mouseStrength !== undefined)  u.u_mouse_strength.value = this.config.mouseStrength;
		if (options.grainIntensity !== undefined) u.u_grain_intensity.value = this.config.grainIntensity;
		if (options.grainSpeed !== undefined)     u.u_grain_speed.value = this.config.grainSpeed;
		if (options.colorBlending !== undefined)  u.u_color_blending.value = this.config.colorBlending;
		if (options.splatVorticity !== undefined) u.u_vorticity.value = this.config.splatVorticity;
		if (options.splatRadius !== undefined)    u.u_splat_radius.value = this.config.splatRadius;
		if (options.maskClamp !== undefined)      u.u_mask_clamp.value.set(...this.config.maskClamp);
		if (options.scrollDepth !== undefined || options.scrollEffect !== undefined || options.scrollParallax !== undefined) {
			u.u_scroll_depth.value = this.config.scrollEffect === 'none' ? 0 : this.config.scrollDepth;
			u.u_scroll_parallax.value = this.config.scrollEffect === 'none' ? 0 : this.config.scrollParallax;
		}
		if (options.colors !== undefined)         this.updateColors();
		if (options.shapeId !== undefined)        this.updateShape(this.config.shapeId, this.config.morphProgress);
	}

	/**
	 * Plants a velocity splat at a UV position — creates a persistent fluid impulse.
	 * @param {number} x - UV x [0-1]
	 * @param {number} y - UV y [0-1]
	 * @param {number} vx - velocity x in UV warp space
	 * @param {number} vy - velocity y in UV warp space
	 */
	addSplat(x, y, vx, vy) {
		this.splats.unshift({ x, y, vx, vy, life: 1.0 });
		if (this.splats.length > this.config.splatCount) this.splats.pop();
	}

	resize() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		this.renderer.setSize(width, height, false);
		/** @type {any} */ (this.material.uniforms).u_resolution.value.set(width, height);
	}

	animate() {
		const now = performance.now();
		const dt = Math.max((now - this.lastTime) * 0.001, 0.0001);
		this.lastTime = now;
		const elapsedSeconds = (now - this.startTime) * 0.001;

		// Calculate instant mouse velocity from per-frame target delta
		const targetDiffX = this.mouse.target.x - this.mouse.lastTarget.x;
		const targetDiffY = this.mouse.target.y - this.mouse.lastTarget.y;
		this.mouse.lastTarget.copy(this.mouse.target);

		const instSpeed = Math.min(
			Math.sqrt(targetDiffX * targetDiffX + targetDiffY * targetDiffY) / dt,
			5.0
		);

		if (instSpeed > 0.01) {
			const dirX = targetDiffX / (instSpeed * dt || 1.0);
			const dirY = targetDiffY / (instSpeed * dt || 1.0);

			this.mouse.velocity.x += (dirX * instSpeed - this.mouse.velocity.x) * 0.1;
			this.mouse.velocity.y += (dirY * instSpeed - this.mouse.velocity.y) * 0.1;
			this.mouse.speed += (instSpeed - this.mouse.speed) * 0.15;

			// Plant a splat only when the cursor has moved enough to avoid dense overlap.
			// Scale 0.025: UV/s velocity → UV color displacement (~8% of screen at max speed).
			const lastSplat = this.splats[0];
			const dsx = this.mouse.target.x - (lastSplat?.x ?? -1);
			const dsy = this.mouse.target.y - (lastSplat?.y ?? -1);
			if (!lastSplat || dsx * dsx + dsy * dsy > 0.015 * 0.015) {
				this.addSplat(
					this.mouse.target.x,
					this.mouse.target.y,
					this.mouse.velocity.x * 0.025,
					this.mouse.velocity.y * 0.025
				);
			}
		} else {
			const decay = Math.exp(-dt / 0.35);
			this.mouse.velocity.multiplyScalar(decay);
			this.mouse.speed *= decay;
		}

		// Viscous mouse follow
		this.mouse.current.x += (this.mouse.target.x - this.mouse.current.x) * this.config.viscosity;
		this.mouse.current.y += (this.mouse.target.y - this.mouse.current.y) * this.config.viscosity;

		this.scroll.current += (this.scroll.target - this.scroll.current) * 0.05;
		this.shape.currentMorph += (this.shape.morph - this.shape.currentMorph) * 0.05;

		// Decay splat life — frame-rate independent
		const decayFactor = Math.pow(this.config.splatDecay, dt * 60);
		for (let i = 0; i < this.splats.length; i++) this.splats[i].life *= decayFactor;
		this.splats = this.splats.filter(s => s.life > 0.005);

		// Upload splat data into the reusable pool — avoids GC pressure
		const activeSplats = Math.min(this.splats.length, MAX_SPLATS);
		for (let i = 0; i < MAX_SPLATS; i++) {
			if (i < activeSplats) {
				const s = this.splats[i];
				this.splatPool[i].set(s.x, s.y, s.vx * s.life, s.vy * s.life);
			} else {
				this.splatPool[i].set(0, 0, 0, 0);
			}
		}

		const uniforms = /** @type {any} */ (this.material.uniforms);
		// u_speed viene letto DOPO che GSAP ha applicato il suo tick per questo frame,
		// garantendo che l'accumulo rifletta il valore interpolato corrente.
		this.scaledTime += dt * uniforms.u_speed.value;
		uniforms.u_time.value = this.scaledTime;
		uniforms.u_scroll.value = this.scroll.current;
		uniforms.u_shape_morph.value = this.shape.currentMorph;
		uniforms.u_splat_count.value = activeSplats;

		this.renderer.render(this.scene, this.camera);
		this.animationFrameId = requestAnimationFrame(() => this.animate());
	}

	destroy() {
		cancelAnimationFrame(this.animationFrameId);
		this.geometry.dispose();
		this.material.dispose();
		this.renderer.dispose();
	}
}
