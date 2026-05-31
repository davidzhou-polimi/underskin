import * as THREE from 'three';

/**
 * @typedef {Object} GradientConfig
 * @property {{ bg?: string, c1?: string, c2?: string, c3?: string } | null} [colors]
 * @property {number} [speed]            - Animation speed multiplier (default 1.0)
 * @property {number} [waveFrequency]    - Spatial frequency of noise blobs (lower = larger blobs)
 * @property {[number, number]} [waveAmplitude] - Domain warp amplitude [layer1, layer2]
 * @property {number} [coverage]         - 0=sparse blobs, 1=full-screen wash
 * @property {[number, number]} [focusCenter]   - UV center of gradient concentration [x, y]
 * @property {number} [focusRadius]      - Focus radius in aspect-corrected UV (>1 = whole screen)
 * @property {number} [viscosity]        - Mouse follow lerp factor (lower = more viscous)
 * @property {number} [mouseRadius]      - Radius of mouse gravitational influence
 * @property {number} [mouseStrength]    - Max UV displacement from mouse
 * @property {number} [splatCount]       - Max concurrent fluid splat points
 * @property {number} [splatRadius]      - Gaussian radius of each splat
 * @property {number} [splatDecay]       - Per-frame life decay (0.96 ≈ 2s lifetime at 60fps)
 * @property {number} [splatVorticity]   - Rotational wake intensity behind cursor (0–1)
 * @property {number} [grainIntensity]   - Film grain strength
 * @property {number} [colorBlending]    - Color transition sharpness multiplier
 * @property {number} [shapeId]          - 0=fluid, 1=circle, 2=capsule
 * @property {number} [morphProgress]    - Shape morph 0.0–1.0
 * @property {[number, number]} [maskClamp] - Min and max clamping limits for the shape mask (default [0.0, 1.0])
 * @property {'vortex' | 'none'} [scrollEffect] - Scroll interaction type
 */

/** @type {Required<GradientConfig>} */
export const DEFAULT_CONFIG = {
	colors: null,
	speed: 1.0,
	waveFrequency: 0.8,
	waveAmplitude: [1.4, 0.18],
	coverage: 0.5,
	focusCenter: [0.5, 0.5],
	focusRadius: 2.0,
	viscosity: 0.07,
	mouseRadius: 0.40,
	mouseStrength: 0.10,
	splatCount: 16,
	splatRadius: 0.18,
	splatDecay: 0.96,
	splatVorticity: 0.4,
	grainIntensity: 0.07,
	colorBlending: 1.0,
	shapeId: 0,
	morphProgress: 0.0,
	maskClamp: [0.0, 1.0],
	scrollEffect: 'vortex',
};

const MAX_SPLATS = 16;

/**
 * @param {{ bg?: string, c1?: string, c2?: string, c3?: string } | null} [override]
 */
function getThemeColors(override = null) {
	if (override) {
		return {
			bg: new THREE.Color(override.bg ?? '#f1fafd'),
			c1: new THREE.Color(override.c1 ?? '#6a96df'),
			c2: new THREE.Color(override.c2 ?? '#8035d2'),
			c3: new THREE.Color(override.c3 ?? '#d86146'),
		};
	}
	if (typeof window === 'undefined') return {
		bg: new THREE.Color('#f1fafd'),
		c1: new THREE.Color('#6a96df'),
		c2: new THREE.Color('#8035d2'),
		c3: new THREE.Color('#d86146')
	};
	const style = getComputedStyle(document.documentElement);
	const bgVal = style.getPropertyValue('--background-primary').trim() || '#f1fafd';
	const c1Val = style.getPropertyValue('--azzurro-500').trim() || '#6a96df';
	const c2Val = style.getPropertyValue('--viola-500').trim() || '#8035d2';
	const c3Val = style.getPropertyValue('--arancione-500').trim() || '#d86146';
	return {
		bg: new THREE.Color(bgVal),
		c1: new THREE.Color(c1Val),
		c2: new THREE.Color(c2Val),
		c3: new THREE.Color(c3Val)
	};
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
	uniform vec3 u_colors[3];

	// Configurable animation parameters
	uniform float u_speed;
	uniform float u_wave_freq;
	uniform vec2 u_wave_amp;
	uniform float u_coverage;
	uniform vec3 u_focus;
	uniform float u_mouse_radius;
	uniform float u_mouse_strength;
	uniform float u_grain_intensity;
	uniform float u_color_blending;
	uniform float u_vorticity;
	uniform vec2 u_mask_clamp;

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

	// Gaussian velocity field from all active splats — creates persistent fluid interaction
	vec2 computeSplatField(vec2 uv, vec2 aspect) {
		vec2 force = vec2(0.0);
		for (int i = 0; i < 16; i++) {
			if (i >= u_splat_count) break;
			vec2 splatPos = u_splats[i].xy;
			vec2 splatVel = u_splats[i].zw;

			float splatSpeed = length(splatVel);
			if (splatSpeed < 0.0001) continue;

			vec2 diff = (uv - splatPos) * aspect;
			float d2 = dot(diff, diff);
			float r2 = u_splat_radius * u_splat_radius;
			float gaussian = exp(-d2 / r2);

			// Push along velocity direction
			force += splatVel * gaussian;

			// Rotational wake perpendicular to motion — dipole vortex effect
			vec2 splatDir = splatVel / splatSpeed;
			vec2 perp = vec2(-splatDir.y, splatDir.x);
			float along = dot(splatDir, diff);
			force += perp * along * gaussian * u_vorticity;
		}
		return force;
	}

	vec2 domainWarp(vec2 uv, float time, float mouse_effect, float scroll_effect) {
		vec3 p = vec3(uv * u_wave_freq, time * 0.12);

		vec2 q = vec2(
			snoise(p),
			snoise(p + vec3(5.2, 1.3, 0.8))
		);

		// u_wave_amp.x scales both the internal feedback (1.4) and the first-layer output (0.35 = 1.4 * 0.25)
		vec3 r_p = p + vec3(q * u_wave_amp.x, time * 0.08) + vec3(mouse_effect * 0.4, scroll_effect * 0.6, 0.0);
		vec2 r = vec2(
			snoise(r_p),
			snoise(r_p + vec3(8.3, 2.8, 1.7))
		);

		return uv + q * (u_wave_amp.x * 0.25) + r * u_wave_amp.y;
	}

	void main() {
		vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
		vec2 uv = v_uv;
		float scaled_time = u_time * u_speed;

		// 1. Splat field — persistent fluid displacement that decays over time
		vec2 splat_force = computeSplatField(uv, aspect);

		// 2. Mouse gravitational UV warp based on velocity and direction
		vec2 to_mouse = (u_mouse - uv) * aspect;
		float mouse_dist = length(to_mouse);
		float mouse_attraction = smoothstep(u_mouse_radius, 0.0, mouse_dist);

		float speed = length(u_mouse_velocity);
		vec2 warp_vector = splat_force * 0.25;

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

		// 3. Scroll vortex/spiral coordinate mapping
		float scroll_angle = u_scroll * 3.14159 * 1.5;
		mat2 scroll_rot = mat2(cos(scroll_angle), sin(scroll_angle), -sin(scroll_angle), cos(scroll_angle));
		vec2 centered_uv = warped_by_mouse_uv - 0.5;
		centered_uv = mix(centered_uv, scroll_rot * centered_uv, u_scroll * 0.7);
		vec2 shifted_uv = centered_uv + 0.5;

		// 4. Domain warping (deforms the coordinate grid recursively)
		vec2 warped_uv = domainWarp(shifted_uv * aspect, scaled_time, mouse_attraction, u_scroll);

		// 5. Base fluid noise — 0.75 factor maintains original shape/warp frequency ratio
		float shape_noise = snoise(vec3(warped_uv * (u_wave_freq * 0.75), scaled_time * 0.08));

		// 6. SDF shape morphing
		float circle_sdf = sdCircle(centered_uv_aspect, 0.35);
		float capsule_sdf = sdCapsule(centered_uv_aspect, vec2(0.0, 0.25), vec2(0.0, -0.25), 0.25);
		float circle_mask = smoothstep(0.2, -0.2, circle_sdf);
		float capsule_mask = smoothstep(0.2, -0.2, capsule_sdf);
		float target_shape_mask = mix(circle_mask, capsule_mask, step(1.5, u_target_shape));
		float target_bias = (target_shape_mask - 0.5) * 2.0;
		float is_shaped = step(0.5, u_target_shape);
		float morphed_fluid = mix(shape_noise, shape_noise + target_bias * 1.5, u_shape_morph * is_shaped);

		// 7. Coverage bias: shifts the noise threshold so more/less surface is covered
		float coverage_bias = (u_coverage - 0.5) * 2.5;
		float shape_mask = smoothstep(-0.4, 0.6, morphed_fluid + coverage_bias);

		// Focus area: attenuate gradient outside a configurable radial region
		float focus_dist = length((uv - u_focus.xy) * aspect);
		float focus_weight = 1.0 - smoothstep(u_focus.z * 0.5, u_focus.z, focus_dist);
		shape_mask *= mix(0.05, 1.0, focus_weight);
		// Clamping shape_mask to user-defined limits to adjust visual contrast or range
		shape_mask = clamp(shape_mask, u_mask_clamp.x, u_mask_clamp.y);

		// 8. Color blending inside shapes — wide smoothstep creates blurred gradients
		float blend_range = u_color_blending * 0.8;
		float blend = smoothstep(-blend_range, blend_range, snoise(vec3(warped_uv * 0.7, scaled_time * 0.1)));
		vec3 shape_color = mix(u_colors[0], u_colors[1], blend);
		shape_color = mix(shape_color, u_colors[2], smoothstep(-0.4, 0.8, snoise(vec3(warped_uv * 0.9 + vec2(1.5), scaled_time * 0.07))));

		// 9. Film grain — uses raw u_time to avoid speed artifacts
		float g = grain(v_uv * u_resolution, u_time) * u_grain_intensity;

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
				u_colors:         { value: [this.themeColors.c1, this.themeColors.c2, this.themeColors.c3] },
				// Configurable parameters
				u_speed:          { value: this.config.speed },
				u_wave_freq:      { value: this.config.waveFrequency },
				u_wave_amp:       { value: new THREE.Vector2(...this.config.waveAmplitude) },
				u_coverage:       { value: this.config.coverage },
				u_focus:          { value: new THREE.Vector3(this.config.focusCenter[0], this.config.focusCenter[1], this.config.focusRadius) },
				u_mouse_radius:   { value: this.config.mouseRadius },
				u_mouse_strength: { value: this.config.mouseStrength },
				u_grain_intensity:{ value: this.config.grainIntensity },
				u_color_blending: { value: this.config.colorBlending },
				u_vorticity:      { value: this.config.splatVorticity },
				u_mask_clamp:     { value: new THREE.Vector2(...this.config.maskClamp) },
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
		uniforms.u_colors.value = [this.themeColors.c1, this.themeColors.c2, this.themeColors.c3];
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
		if (options.focusCenter !== undefined || options.focusRadius !== undefined)
			u.u_focus.value.set(this.config.focusCenter[0], this.config.focusCenter[1], this.config.focusRadius);
		if (options.mouseRadius !== undefined)    u.u_mouse_radius.value = this.config.mouseRadius;
		if (options.mouseStrength !== undefined)  u.u_mouse_strength.value = this.config.mouseStrength;
		if (options.grainIntensity !== undefined) u.u_grain_intensity.value = this.config.grainIntensity;
		if (options.colorBlending !== undefined)  u.u_color_blending.value = this.config.colorBlending;
		if (options.splatVorticity !== undefined) u.u_vorticity.value = this.config.splatVorticity;
		if (options.splatRadius !== undefined)    u.u_splat_radius.value = this.config.splatRadius;
		if (options.maskClamp !== undefined)      u.u_mask_clamp.value.set(...this.config.maskClamp);
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

			// Plant a splat carrying the current momentum — scale 0.01 maps UV/s to UV warp magnitude
			this.addSplat(
				this.mouse.target.x,
				this.mouse.target.y,
				this.mouse.velocity.x * 0.01,
				this.mouse.velocity.y * 0.01
			);
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
		uniforms.u_time.value = elapsedSeconds;
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
