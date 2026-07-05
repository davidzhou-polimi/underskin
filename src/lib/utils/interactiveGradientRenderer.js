/**
 * Renderer WebGL in-house del gradiente interattivo (domain-warping fluid background).
 * Ha sostituito Three.js (485 KB min) con ~300 righe senza dipendenze: lo shader GLSL
 * è invariato e produce il 100% dei pixel — parità verificata bit-per-bit contro il
 * backend Three su 5 scenari (hero, intro, scroll, orizzontale, splats) prima dello switch.
 * Tutti i parametri visivi sono configurabili via GradientConfig.
 */

/**
 * @typedef {Object} GradientConfig
 * @property {{ bg?: string, c1?: string, c2?: string, c3?: string } | { bg?: string, colors?: string[] } | string[] | null} [colors]
 * @property {number} [speed]            - Animation speed multiplier (default 1.0)
 * @property {number} [waveFrequency]    - Spatial frequency of noise blobs (lower = larger blobs)
 * @property {number[] | [number, number]} [waveAmplitude] - Domain warp amplitude [layer1, layer2]
 * @property {number} [coverage]         - 0=sparse blobs, 1=full-screen wash
 * @property {number} [intensity]        - Ceiling color level of the blobs (0=invisible, 1=full, default 1.0); honest cap, independent from coverage
 * @property {number[] | [number, number]} [focusCenter]   - UV center of gradient concentration [x, y]
 * @property {number | number[] | [number, number]} [focusRadius] - Focus radius [rx, ry] or single value for circle
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
 * @property {number[] | [number, number]} [maskClamp] - Min and max clamping limits for the shape mask (default [0.0, 1.0])
 * @property {'depth' | 'none'} [scrollEffect] - Scroll interaction: 'depth' = NEAT-style infinite procedural scroll
 * @property {number} [scrollYDepth]     - Depth units traversed per viewport scrolled (higher = more dramatic morph)
 * @property {number} [scrollYParallax]  - Y parallax shift in UV units per viewport scrolled (0.5 = half screen height)
 * @property {number} [scrollXDepth]    - Depth units traversed per viewport of horizontal (pinned) scroll
 * @property {number} [scrollXParallax] - X parallax shift in UV units per viewport of horizontal (pinned) scroll
 */

/** @type {Required<GradientConfig>} */
export const DEFAULT_CONFIG = {
	colors: null,
	speed: 0.6,
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
	// Per-viewport (lo scroll arriva già normalizzato in unità viewport = px/innerHeight):
	// il movimento del gradiente è quindi uniforme tra pagine lunghe e corte. 0.15 = lo sfondo
	// trasla e morfa di ~15% di schermo per schermata scrollata: parallasse discreto, e il ritmo
	// di morphing per-viewport resta nel range pre-refactor (0.75 sull'intera pagina).
	scrollYDepth: 0.15,
	scrollYParallax: 0.15,
	// Attivi solo dove qualcuno scrive lo store scrollX (Burnout in home, text swap in about):
	// altrove scrollX resta 0 e questi coefficienti non hanno effetto. Allineati a Y.
	scrollXDepth: 0.15,
	scrollXParallax: 0.15,
};

export const fsSource = `
	precision mediump float;
	varying vec2 v_uv;

	uniform vec2 u_resolution;
	uniform float u_time;
	uniform vec2 u_mouse;
	uniform vec2 u_mouse_velocity;
	uniform float u_scroll_y;

	uniform float u_target_shape;
	uniform float u_shape_morph;

	uniform vec3 u_bg_color;
	uniform vec3 u_colors[16];
	// float (non int): animabile con continuità — i layer in eccesso sfumano via peso invece
	// di sparire in un frame quando la palette cambia cardinalità (es. home 9 ↔ archetipo 3).
	uniform float u_color_count;
	// Palette di partenza della dissolvenza: ogni palette è resa con la propria struttura
	// autentica e u_palette_mix le dissolve pixel-per-pixel (0 = partenza, 1 = destinazione).
	// Gli stati intermedi sono medie pesate dei due stati reali: mai una struttura estranea.
	uniform vec3 u_colors_from[16];
	uniform float u_color_count_from;
	uniform float u_palette_mix;

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
	uniform float u_scroll_y_depth;
	uniform float u_scroll_y_parallax;
	uniform float u_scroll_x;
	uniform float u_scroll_x_depth;
	uniform float u_scroll_x_parallax;

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
		// Vertical scroll advances Z; horizontal scroll adds an independent Z contribution.
		// This lets a pinned horizontal section morph the gradient without conflicting with vertical depth.
		float z = time * 0.12 + u_scroll_y * u_scroll_y_depth + u_scroll_x * u_scroll_x_depth;
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

		// Commento solo il PERCHÉ: comprime le coordinate del pattern rispetto al raggio corrente (dividendo invece di moltiplicare) per mantenere l'intera gamma di colori visibile all'interno della sfera fin da quando è piccolissima.
		float intro_scale = clamp(u_focus.z / 0.25, 0.01, 1.0);
		vec2 uv = u_focus.xy + (v_uv - u_focus.xy) / intro_scale;

		float scaled_time = u_time; // la moltiplicazione per speed avviene in JS (scaledTime += dt * u_speed)

		// 1. Mouse gravitational UV warp based on velocity and direction
		vec2 to_mouse = (u_mouse - v_uv) * aspect;
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

		// 3. Domain warping — vertical scroll: Z depth + Y parallax; horizontal scroll: Z depth + X parallax
		vec2 scroll_uv_offset = vec2(
			-u_scroll_x * u_scroll_x_parallax,
			-u_scroll_y * u_scroll_y_parallax
		);
		// Commento solo il PERCHÉ: applica uno shift alle coordinate dello sfondo nella direzione del mouse per creare un parallasse 3D continuo rispetto agli elementi anteriori
		vec2 mouse_parallax_offset = (u_mouse - 0.5) * 0.03;
		vec2 warped_uv = domainWarp((warped_by_mouse_uv + scroll_uv_offset - mouse_parallax_offset) * aspect, scaled_time, mouse_attraction);

		// 4. Splat field applied AFTER domain warp — displaces color-sampling UV directly.
		// Cap force magnitude to avoid UV tearing at high splat densities.
		vec2 splat_force = computeSplatField(v_uv);
		float sf_len = length(splat_force);
		splat_force *= min(1.0, 0.15 / max(sf_len, 0.0001));
		warped_uv -= splat_force * aspect;

		// 5. Base fluid noise — scroll depth offset ensures infinite procedural variation on scroll
		float scroll_z = u_scroll_y * u_scroll_y_depth * 0.8;
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

		// 7. Coverage bias: sposta il threshold del noise decidendo *dove* e *quanto* compaiono i blob.
		// Finestra stretta ±1.2 = contrasto pieno: i core scattano a piena saturazione e lo shift della
		// soglia governa l'AREA/densità dei blob (radi a coverage bassa, pieni a coverage alta) invece
		// di limitarsi a schiarire un haze uniforme. u_intensity fa da tetto onesto della saturazione;
		// nessuna ri-normalizzazione a valle (expected_peak rimosso), così a parametro basso i blob non
		// vengono forzati al pieno.
		float coverage_bias = (u_coverage - 0.5) * 2.5;
		float shape_mask = smoothstep(-1.2, 1.2, morphed_fluid + coverage_bias);

		// Soft minimum density: even in "background" regions a subtle color field bleeds through,
		// eliminating the hard boundary between gradient blobs and background entirely.
		shape_mask = mix(0.05, 1.0, shape_mask);

		// Focus area: attenuate gradient outside a configurable elliptical region
		// Commento solo il PERCHÉ: trasla leggermente il centro del gradiente (spotlight) assecondando il mouse per allinearlo alla prospettiva 3D
		vec2 shifted_focus = u_focus.xy + (u_mouse - 0.5) * 0.02;
		vec2 focus_offset = ((v_uv - shifted_focus) * aspect) / max(u_focus.zw, vec2(0.0001));
		float focus_dist = length(focus_offset);
		float focus_weight = 1.0 - smoothstep(0.5, 1.0, focus_dist);
		shape_mask *= mix(0.0, 1.0, focus_weight);
		shape_mask = clamp(shape_mask, u_mask_clamp.x, u_mask_clamp.y);

		// intensity scala il livello di colore dei blob indipendentemente dalla coverage
		shape_mask *= u_intensity;

		// 8. Color blending — scroll_z offsets the color noise too so colors morph with scroll
		float blend_range = u_color_blending * 0.8;
		// Doppio accumulo nello stesso loop: la maschera di noise di ogni layer dipende solo
		// dall'indice i, quindi le due palette (partenza/destinazione) condividono lo stesso
		// snoise — costo identico al singolo accumulo. I pesi per-layer (0/1 ai count interi)
		// rendono i count animabili senza salto spaziale.
		vec3 color_to = u_colors[0];
		vec3 color_from = u_colors_from[0];
		for (int i = 1; i < 16; i++) {
			float w_to = clamp(u_color_count - float(i), 0.0, 1.0);
			float w_from = clamp(u_color_count_from - float(i), 0.0, 1.0);
			if (w_to <= 0.0 && w_from <= 0.0) break; // pesi decrescenti in i: early-out sicuro
			// We dynamically scale frequency and coordinate offsets based on indices to match the legacy 3-color blending
			// mathematically, while scaling organically for any additional user-configured colors.
			float scale = 0.7 + float(i - 1) * 0.2;
			vec2 offset = vec2(float(i - 1) * 1.5);
			float time_mult = 0.1 - float(i - 1) * 0.03;
			float scroll_mult = 0.5 - float(i - 1) * 0.15;
			float layer_blend = smoothstep(-blend_range, blend_range, snoise(vec3(warped_uv * scale + offset, scaled_time * time_mult + scroll_z * scroll_mult)));
			color_to = mix(color_to, u_colors[i], layer_blend * w_to);
			color_from = mix(color_from, u_colors_from[i], layer_blend * w_from);
		}
		// Dissolvenza pixel-per-pixel tra i due campi colore, entrambi vivi (tempo/warp/scroll)
		vec3 shape_color = mix(color_from, color_to, u_palette_mix);

		// 9. Film grain — step-based animation to avoid high-frequency flickering.
		// If u_grain_speed is 0.0, the grain pattern remains completely static.
		float grain_time = u_grain_speed > 0.0 ? floor(u_time * u_grain_speed) : 0.0;
		float g = grain(v_uv * u_resolution, grain_time) * u_grain_intensity;

		vec3 final_color = mix(u_bg_color, shape_color + vec3(g), shape_mask);

		// Gamma correction: linear -> sRGB
		gl_FragColor = vec4(pow(final_color, vec3(1.0 / 2.2)), 1.0);
	}
`;

const MAX_SPLATS = 16;

// ─── Sostituti minimi delle classi THREE usate dagli uniform ────────────────────

class Vector2 {
	/** @param {number} [x] @param {number} [y] */
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
	/** @param {number} x @param {number} y */
	set(x, y) {
		this.x = x;
		this.y = y;
		return this;
	}
	/** @param {Vector2} v */
	copy(v) {
		this.x = v.x;
		this.y = v.y;
		return this;
	}
	/** @param {number} s */
	multiplyScalar(s) {
		this.x *= s;
		this.y *= s;
		return this;
	}
}

class Vector4 {
	/** @param {number} [x] @param {number} [y] @param {number} [z] @param {number} [w] */
	constructor(x = 0, y = 0, z = 0, w = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}
	/** @param {number} x @param {number} y @param {number} z @param {number} w */
	set(x, y, z, w) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
		return this;
	}
}

// Replica la conversione sRGB→lineare di THREE.Color (ColorManagement attivo di default):
// lo shader lavora in lineare e applica pow(1/2.2) in uscita, quindi i colori parsati
// da stringa CSS devono arrivare già linearizzati per ottenere lo stesso output.
/** @param {number} c */
function srgbToLinear(c) {
	return c < 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

class Color {
	/**
	 * @param {string | number} [r] - stringa CSS (con conversione sRGB→lineare, come THREE) o canale R numerico (senza conversione)
	 * @param {number} [g]
	 * @param {number} [b]
	 */
	constructor(r = 0, g, b) {
		this.r = 0;
		this.g = 0;
		this.b = 0;
		if (typeof r === 'string') this.setStyle(r);
		else this.setRGB(r, g ?? r, b ?? r);
	}

	/** @param {number} r @param {number} g @param {number} b */
	setRGB(r, g, b) {
		this.r = r;
		this.g = g;
		this.b = b;
		return this;
	}

	/** @param {string} style - #rgb, #rrggbb, rgb()/rgba() */
	setStyle(style) {
		const str = style.trim();
		let sr = 0, sg = 0, sb = 0;

		let m;
		if ((m = /^#([0-9a-f]{6})$/i.exec(str))) {
			const hex = parseInt(m[1], 16);
			sr = ((hex >> 16) & 255) / 255;
			sg = ((hex >> 8) & 255) / 255;
			sb = (hex & 255) / 255;
		} else if ((m = /^#([0-9a-f]{3})$/i.exec(str))) {
			sr = parseInt(m[1][0] + m[1][0], 16) / 255;
			sg = parseInt(m[1][1] + m[1][1], 16) / 255;
			sb = parseInt(m[1][2] + m[1][2], 16) / 255;
		} else if ((m = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i.exec(str))) {
			sr = parseFloat(m[1]) / 255;
			sg = parseFloat(m[2]) / 255;
			sb = parseFloat(m[3]) / 255;
		}

		this.r = srgbToLinear(sr);
		this.g = srgbToLinear(sg);
		this.b = srgbToLinear(sb);
		return this;
	}
}

// ─── Risoluzione palette dai design token (stessa logica del backend Three) ─────

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

	if (override) {
		if (Array.isArray(override)) {
			gradientColors = override;
		} else if (typeof override === 'object') {
			if (override.bg !== undefined) bgVal = override.bg;
			if (Array.isArray(override.colors)) gradientColors = override.colors;
		}
	}

	const finalBg = resolveColorString(bgVal);
	const finalColors = gradientColors.map(resolveColorString);

	return {
		bg: new Color(finalBg),
		colors: finalColors.map((c) => new Color(c))
	};
}

/**
 * Riempie l'array colori fino ai 16 slot richiesti dall'uniform array WebGL.
 * @param {Color[]} themeColorsArray
 * @param {number} maxColors
 */
function getUniformColors(themeColorsArray, maxColors = 16) {
	const uniformArray = [];
	const length = themeColorsArray.length;
	for (let i = 0; i < maxColors; i++) {
		if (i < length) {
			uniformArray.push(themeColorsArray[i]);
		} else {
			uniformArray.push(length > 0 ? themeColorsArray[length - 1] : new Color(0, 0, 0));
		}
	}
	return uniformArray;
}

// Vertex shader identico a quello usato col backend Three (attributi position/uv del
// PlaneGeometry): v_uv deve essere interpolato bit-per-bit come prima, perché il grain
// dello shader è un hash di v_uv e amplifica qualunque differenza di ultimo bit.
const vsSource = `
	precision highp float;
	attribute vec3 position;
	attribute vec2 uv;
	varying vec2 v_uv;
	void main() {
		v_uv = uv;
		gl_Position = vec4(position, 1.0);
	}
`;

/**
 * @param {WebGLRenderingContext} gl
 * @param {number} type
 * @param {string} source
 */
function compileShader(gl, type, source) {
	const shader = gl.createShader(type);
	if (!shader) throw new Error('[gradient] impossibile creare lo shader');
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error(`[gradient] compilazione shader fallita: ${log}`);
	}
	return shader;
}

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
		this.isPaused = false;
		this.startTime = performance.now();
		this.lastTime = performance.now();
		// scaledTime accumula il tempo pesato per u_speed frame-by-frame in JS,
		// evitando il salto di fase quando u_speed cambia a u_time già grande.
		this.scaledTime = 0.0;

		this.mouse = {
			current: new Vector2(0.5, 0.5),
			target: new Vector2(0.5, 0.5),
			lastTarget: new Vector2(0.5, 0.5),
			velocity: new Vector2(0, 0),
			speed: 0
		};
		this.scrollY = { current: 0, target: 0 };
		this.scrollX = { current: 0, target: 0 };
		this.shape = {
			id: this.config.shapeId,
			morph: this.config.morphProgress,
			currentMorph: 0.0
		};

		/** @type {{ x: number, y: number, vx: number, vy: number, life: number }[]} */
		this.splats = [];
		this.splatPool = Array.from({ length: MAX_SPLATS }, () => new Vector4(0, 0, 0, 0));

		this.themeColors = getThemeColors(this.config.colors);

		// WebGL2 come Three (stesso codegen dello shader GLSL ES 1.00), con fallback WebGL1
		const ctxAttribs = {
			antialias: false,
			depth: false,
			stencil: false,
			powerPreference: 'high-performance'
		};
		const gl = /** @type {WebGLRenderingContext | null} */ (
			canvas.getContext('webgl2', ctxAttribs) ?? canvas.getContext('webgl', ctxAttribs)
		);
		if (!gl) throw new Error('[gradient] WebGL non disponibile');
		this.gl = gl;
		this.pixelRatio = Math.min(window.devicePixelRatio, 2);

		// Programma: quad full-screen + fragment shader condiviso col backend Three
		const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
		const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
		const program = gl.createProgram();
		if (!program) throw new Error('[gradient] impossibile creare il program');
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error(`[gradient] link program fallito: ${gl.getProgramInfoLog(program)}`);
		}
		gl.deleteShader(vs);
		gl.deleteShader(fs);
		this.program = program;
		gl.useProgram(program);

		// Stessa geometria di THREE.PlaneGeometry(2,2): vertici, uv, indici e winding
		// identici, così l'interpolazione dei varying è bit-per-bit quella di prima.
		this.positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([-1, 1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0]),
			gl.STATIC_DRAW
		);
		const positionLoc = gl.getAttribLocation(program, 'position');
		gl.enableVertexAttribArray(positionLoc);
		gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);

		this.uvBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]), gl.STATIC_DRAW);
		const uvLoc = gl.getAttribLocation(program, 'uv');
		gl.enableVertexAttribArray(uvLoc);
		gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);

		this.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 2, 1, 2, 3, 1]), gl.STATIC_DRAW);

		// Stessa forma pubblica di THREE.ShaderMaterial.uniforms: le action esterne
		// (introReveal, interactiveGradient) leggono/scrivono i .value direttamente.
		this.material = {
			uniforms: {
				u_resolution:      { value: new Vector2() },
				u_time:            { value: 0 },
				u_mouse:           { value: this.mouse.current },
				u_mouse_velocity:  { value: this.mouse.velocity },
				u_scroll_y:        { value: 0 },
				u_target_shape:    { value: this.shape.id },
				u_shape_morph:     { value: 0 },
				u_bg_color:        { value: this.themeColors.bg },
				u_colors:          { value: getUniformColors(this.themeColors.colors, 16) },
				u_color_count:     { value: this.themeColors.colors.length },
				// Palette di partenza della dissolvenza: al mount coincide con la destinazione
				// (mix=1 → a riposo il ramo FROM è ininfluente, resa identica al singolo accumulo).
				// 16 istanze Color UNICHE (getUniformColors riusa la stessa istanza per il padding):
				// beginPaletteTransition le muta slot-per-slot via setRGB, mai le sostituisce.
				u_colors_from:     { value: getUniformColors(this.themeColors.colors, 16).map((c) => new Color(c.r, c.g, c.b)) },
				u_color_count_from: { value: this.themeColors.colors.length },
				u_palette_mix:     { value: 1 },
				u_speed:           { value: this.config.speed },
				u_wave_freq:       { value: this.config.waveFrequency },
				u_wave_amp:        { value: new Vector2(...this.config.waveAmplitude) },
				u_coverage:        { value: this.config.coverage },
				u_intensity:       { value: this.config.intensity },
				u_focus:           { value: new Vector4(
					this.config.focusCenter[0],
					this.config.focusCenter[1],
					Array.isArray(this.config.focusRadius) ? this.config.focusRadius[0] : this.config.focusRadius,
					Array.isArray(this.config.focusRadius) ? this.config.focusRadius[1] : this.config.focusRadius
				) },
				u_mouse_radius:    { value: this.config.mouseRadius },
				u_mouse_strength:  { value: this.config.mouseStrength },
				u_grain_intensity: { value: this.config.grainIntensity },
				u_grain_speed:     { value: this.config.grainSpeed },
				u_color_blending:  { value: this.config.colorBlending },
				u_vorticity:       { value: this.config.splatVorticity },
				u_mask_clamp:      { value: new Vector2(...this.config.maskClamp) },
				u_scroll_y_depth:    { value: this.config.scrollEffect === 'none' ? 0 : this.config.scrollYDepth },
				u_scroll_y_parallax: { value: this.config.scrollEffect === 'none' ? 0 : this.config.scrollYParallax },
				u_scroll_x:          { value: 0 },
				u_scroll_x_depth:    { value: this.config.scrollEffect === 'none' ? 0 : this.config.scrollXDepth },
				u_scroll_x_parallax: { value: this.config.scrollEffect === 'none' ? 0 : this.config.scrollXParallax },
				u_splats:          { value: this.splatPool },
				u_splat_count:     { value: 0 },
				u_splat_radius:    { value: this.config.splatRadius }
			}
		};

		// Cache delle location: lookup una sola volta, upload a ogni frame
		/** @type {Record<string, WebGLUniformLocation | null>} */
		this.locations = {};
		for (const name of Object.keys(this.material.uniforms)) {
			this.locations[name] = gl.getUniformLocation(program, name);
		}

		// Buffer riusabili per gli uniform array: zero allocazioni per frame
		this.colorsBuffer = new Float32Array(16 * 3);
		this.colorsFromBuffer = new Float32Array(16 * 3);
		this.splatsBuffer = new Float32Array(MAX_SPLATS * 4);

		this.resize();
		this.animate();
	}

	/** Carica tutti gli uniform correnti nel program (chiamato una volta per frame). */
	_uploadUniforms() {
		const gl = this.gl;
		const u = /** @type {any} */ (this.material.uniforms);
		const loc = this.locations;

		gl.uniform2f(loc.u_resolution, u.u_resolution.value.x, u.u_resolution.value.y);
		gl.uniform1f(loc.u_time, u.u_time.value);
		gl.uniform2f(loc.u_mouse, u.u_mouse.value.x, u.u_mouse.value.y);
		gl.uniform2f(loc.u_mouse_velocity, u.u_mouse_velocity.value.x, u.u_mouse_velocity.value.y);
		gl.uniform1f(loc.u_scroll_y, u.u_scroll_y.value);
		gl.uniform1f(loc.u_target_shape, u.u_target_shape.value);
		gl.uniform1f(loc.u_shape_morph, u.u_shape_morph.value);
		gl.uniform3f(loc.u_bg_color, u.u_bg_color.value.r, u.u_bg_color.value.g, u.u_bg_color.value.b);
		// uniform1f, non 1i: durante i tween di palette i count sono frazionari (peso per-layer nello shader)
		gl.uniform1f(loc.u_color_count, u.u_color_count.value);
		gl.uniform1f(loc.u_color_count_from, u.u_color_count_from.value);
		gl.uniform1f(loc.u_palette_mix, u.u_palette_mix.value);
		gl.uniform1f(loc.u_speed, u.u_speed.value);
		gl.uniform1f(loc.u_wave_freq, u.u_wave_freq.value);
		gl.uniform2f(loc.u_wave_amp, u.u_wave_amp.value.x, u.u_wave_amp.value.y);
		gl.uniform1f(loc.u_coverage, u.u_coverage.value);
		gl.uniform1f(loc.u_intensity, u.u_intensity.value);
		gl.uniform4f(loc.u_focus, u.u_focus.value.x, u.u_focus.value.y, u.u_focus.value.z, u.u_focus.value.w);
		gl.uniform1f(loc.u_mouse_radius, u.u_mouse_radius.value);
		gl.uniform1f(loc.u_mouse_strength, u.u_mouse_strength.value);
		gl.uniform1f(loc.u_grain_intensity, u.u_grain_intensity.value);
		gl.uniform1f(loc.u_grain_speed, u.u_grain_speed.value);
		gl.uniform1f(loc.u_color_blending, u.u_color_blending.value);
		gl.uniform1f(loc.u_vorticity, u.u_vorticity.value);
		gl.uniform2f(loc.u_mask_clamp, u.u_mask_clamp.value.x, u.u_mask_clamp.value.y);
		gl.uniform1f(loc.u_scroll_y_depth, u.u_scroll_y_depth.value);
		gl.uniform1f(loc.u_scroll_y_parallax, u.u_scroll_y_parallax.value);
		gl.uniform1f(loc.u_scroll_x, u.u_scroll_x.value);
		gl.uniform1f(loc.u_scroll_x_depth, u.u_scroll_x_depth.value);
		gl.uniform1f(loc.u_scroll_x_parallax, u.u_scroll_x_parallax.value);
		gl.uniform1i(loc.u_splat_count, u.u_splat_count.value);
		gl.uniform1f(loc.u_splat_radius, u.u_splat_radius.value);

		const colors = u.u_colors.value;
		const colorsFrom = u.u_colors_from.value;
		for (let i = 0; i < 16; i++) {
			this.colorsBuffer[i * 3] = colors[i].r;
			this.colorsBuffer[i * 3 + 1] = colors[i].g;
			this.colorsBuffer[i * 3 + 2] = colors[i].b;
			this.colorsFromBuffer[i * 3] = colorsFrom[i].r;
			this.colorsFromBuffer[i * 3 + 1] = colorsFrom[i].g;
			this.colorsFromBuffer[i * 3 + 2] = colorsFrom[i].b;
		}
		gl.uniform3fv(loc.u_colors, this.colorsBuffer);
		gl.uniform3fv(loc.u_colors_from, this.colorsFromBuffer);

		const splats = u.u_splats.value;
		for (let i = 0; i < MAX_SPLATS; i++) {
			this.splatsBuffer[i * 4] = splats[i].x;
			this.splatsBuffer[i * 4 + 1] = splats[i].y;
			this.splatsBuffer[i * 4 + 2] = splats[i].z;
			this.splatsBuffer[i * 4 + 3] = splats[i].w;
		}
		gl.uniform4fv(loc.u_splats, this.splatsBuffer);
	}

	/** Disegna un frame con gli uniform correnti, senza avanzare lo stato (usato anche dal test di parità). */
	renderFrame() {
		const gl = this.gl;
		this._uploadUniforms();
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	}

	updateColors() {
		this.themeColors = getThemeColors(this.config.colors);
		const uniforms = /** @type {any} */ (this.material.uniforms);
		uniforms.u_bg_color.value = this.themeColors.bg;
		const resolved = getUniformColors(this.themeColors.colors, 16);
		uniforms.u_colors.value = resolved;
		uniforms.u_color_count.value = this.themeColors.colors.length;
		// Theme-swap a caldo: allinea anche la palette di partenza della dissolvenza, per non
		// lasciare un FROM stale coi colori risolti della vecchia paletta.
		const from = uniforms.u_colors_from.value;
		for (let i = 0; i < 16; i++) from[i].setRGB(resolved[i].r, resolved[i].g, resolved[i].b);
		uniforms.u_color_count_from.value = this.themeColors.colors.length;
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
	 * Prepara la dissolvenza di palette: congela lo stato cromatico corrente come partenza (FROM),
	 * imposta la nuova palette come destinazione (TO) e riporta il mix a 0. Il chiamante anima poi
	 * paletteMix 0→1 via getAnimatableState/applyAnimatableState. Lo snapshot è esatto a dissolvenza
	 * conclusa (mix=1) e un lerp continuo se una dissolvenza precedente viene interrotta a metà:
	 * in nessun caso produce un salto visivo.
	 * @param {{ colors: Color[], count: number }} palette - da getTargetState().palette
	 */
	beginPaletteTransition(palette) {
		const u = /** @type {any} */ (this.material.uniforms);
		const m = u.u_palette_mix.value;
		const from = u.u_colors_from.value;
		const to = u.u_colors.value;
		for (let i = 0; i < 16; i++) {
			from[i].setRGB(
				from[i].r + (to[i].r - from[i].r) * m,
				from[i].g + (to[i].g - from[i].g) * m,
				from[i].b + (to[i].b - from[i].b) * m
			);
		}
		u.u_color_count_from.value += (u.u_color_count.value - u.u_color_count_from.value) * m;
		u.u_colors.value = palette.colors;
		u.u_color_count.value = palette.count;
		u.u_palette_mix.value = 0;
	}

	/**
	 * Restituisce uno snapshot plain-object di tutti i valori uniform animabili.
	 * Pensato per essere usato come proxy GSAP: contiene solo numeri.
	 * @returns {Record<string, number>}
	 */
	getAnimatableState() {
		const u = /** @type {any} */ (this.material.uniforms);
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
			// La palette non si anima più canale-per-canale: le due palette (FROM/TO) vivono nei
			// rispettivi uniform e paletteMix le dissolve pixel-per-pixel nello shader.
			paletteMix: u.u_palette_mix.value,
			bgR: u.u_bg_color.value.r,
			bgG: u.u_bg_color.value.g,
			bgB: u.u_bg_color.value.b,
		};
		return state;
	}

	/**
	 * Risolve una GradientConfig nel corrispondente stato target compatibile con getAnimatableState(),
	 * più la palette risolta da passare a beginPaletteTransition().
	 * @param {GradientConfig} newConfig
	 * @param {Required<GradientConfig>} [fallback]
	 * @returns {{ state: Record<string, number>, palette: { bg: Color, colors: Color[], count: number } }}
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
		return { state, palette };
	}

	/**
	 * Applica uno stato plain-object (da getAnimatableState) agli uniform.
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
		u.u_palette_mix.value = state.paletteMix;
		u.u_bg_color.value.setRGB(state.bgR, state.bgG, state.bgB);
	}

	/**
	 * @param {number} x - normalized x [0-1]
	 * @param {number} y - normalized y [0-1]
	 */
	updateMouse(x, y) {
		this.mouse.target.set(x, y);
	}

	/**
	 * @param {number} value - distanza scrollata in unità viewport (px/innerHeight); il chiamante
	 *   normalizza sul viewport, non sulla pagina, così il movimento è uniforme tra pagine lunghe e corte.
	 */
	updateScrollY(value) {
		if (this.config.scrollEffect === 'none') return;
		this.scrollY.target = value;
	}

	/**
	 * @param {number} value - viewport scrollati dalla sezione pinnata (progress * lunghezza in viewport)
	 */
	updateScrollX(value) {
		if (this.config.scrollEffect === 'none') return;
		this.scrollX.target = Math.max(0, value);
	}

	/**
	 * Riporta lo scroll alla baseline: il canvas persiste tra le rotte, quindi al cambio pagina
	 * l'offset della pagina precedente va azzerato. Solo i target: current converge col lerp già
	 * usato per lo scroll normale, evitando uno scatto di un frame durante la dissolvenza cross-page.
	 */
	resetScroll() {
		this.scrollY.target = 0;
		this.scrollX.target = 0;
	}

	/**
	 * Azzera anche lo stato interpolato (current), non solo i target. Da usare solo quando la pagina
	 * torna fisicamente in cima (afterNavigate non-archetipo): con lo scroll in unità viewport, current
	 * può valere svariate unità e il lerp verso 0 produrrebbe una lunga deriva del parallasse; qui la
	 * pagina è già in alto, quindi lo snap è coerente e viene mascherato dalla dissolvenza cromatica.
	 */
	snapScrollToRest() {
		this.scrollY.target = 0;
		this.scrollY.current = 0;
		this.scrollX.target = 0;
		this.scrollX.current = 0;
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
		if (options.speed !== undefined)          u.u_speed.value = this.config.speed;
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
		if (options.scrollYDepth !== undefined || options.scrollEffect !== undefined || options.scrollYParallax !== undefined) {
			u.u_scroll_y_depth.value = this.config.scrollEffect === 'none' ? 0 : this.config.scrollYDepth;
			u.u_scroll_y_parallax.value = this.config.scrollEffect === 'none' ? 0 : this.config.scrollYParallax;
		}
		if (options.scrollXDepth !== undefined || options.scrollEffect !== undefined || options.scrollXParallax !== undefined) {
			u.u_scroll_x_depth.value = this.config.scrollEffect === 'none' ? 0 : this.config.scrollXDepth;
			u.u_scroll_x_parallax.value = this.config.scrollEffect === 'none' ? 0 : this.config.scrollXParallax;
		}
		if (options.colors !== undefined)         this.updateColors();
		if (options.shapeId !== undefined)        this.updateShape(this.config.shapeId, this.config.morphProgress);
	}

	/**
	 * Plants a velocity splat at a UV position — creates a persistent fluid impulse.
	 * @param {number} x @param {number} y @param {number} vx @param {number} vy
	 */
	addSplat(x, y, vx, vy) {
		this.splats.unshift({ x, y, vx, vy, life: 1.0 });
		if (this.splats.length > this.config.splatCount) this.splats.pop();
	}

	resize() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		this.canvas.width = Math.floor(width * this.pixelRatio);
		this.canvas.height = Math.floor(height * this.pixelRatio);
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		// Come nel backend Three: u_resolution è in px CSS (usato dal grain), non in device px
		/** @type {any} */ (this.material.uniforms).u_resolution.value.set(width, height);
	}

	/** Ferma il loop rAF quando il canvas non è visibile: lo shader full-screen è il costo GPU maggiore della pagina. */
	pause() {
		if (this.isPaused) return;
		this.isPaused = true;
		cancelAnimationFrame(this.animationFrameId);
	}

	resume() {
		if (!this.isPaused) return;
		this.isPaused = false;
		// Riallinea il delta-time: senza reset il primo frame accumulerebbe tutto il tempo di pausa
		this.lastTime = performance.now();
		this.animate();
	}

	animate() {
		if (this.isPaused) return;
		const now = performance.now();
		const dt = Math.max((now - this.lastTime) * 0.001, 0.0001);
		this.lastTime = now;

		// Velocità istantanea del mouse dal delta per-frame del target
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

			// Pianta uno splat solo quando il cursore si è mosso abbastanza da evitare overlap densi.
			// Scala 0.025: velocità UV/s → spostamento colore UV (~8% dello schermo a velocità max).
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

		// Inseguimento viscoso del mouse
		this.mouse.current.x += (this.mouse.target.x - this.mouse.current.x) * this.config.viscosity;
		this.mouse.current.y += (this.mouse.target.y - this.mouse.current.y) * this.config.viscosity;

		this.scrollY.current += (this.scrollY.target - this.scrollY.current) * 0.05;
		this.scrollX.current += (this.scrollX.target - this.scrollX.current) * 0.05;
		this.shape.currentMorph += (this.shape.morph - this.shape.currentMorph) * 0.05;

		// Decadimento vita splat — indipendente dal frame-rate
		const decayFactor = Math.pow(this.config.splatDecay, dt * 60);
		for (let i = 0; i < this.splats.length; i++) this.splats[i].life *= decayFactor;
		this.splats = this.splats.filter((s) => s.life > 0.005);

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
		uniforms.u_scroll_y.value = this.scrollY.current;
		uniforms.u_scroll_x.value = this.scrollX.current;
		uniforms.u_shape_morph.value = this.shape.currentMorph;
		uniforms.u_splat_count.value = activeSplats;

		this.renderFrame();
		this.animationFrameId = requestAnimationFrame(() => this.animate());
	}

	destroy() {
		cancelAnimationFrame(this.animationFrameId);
		const gl = this.gl;
		gl.deleteBuffer(this.positionBuffer);
		gl.deleteBuffer(this.uvBuffer);
		gl.deleteBuffer(this.indexBuffer);
		gl.deleteProgram(this.program);
		gl.getExtension('WEBGL_lose_context')?.loseContext();
	}
}
