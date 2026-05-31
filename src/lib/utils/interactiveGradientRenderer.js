import * as THREE from 'three';

// Helper to safely retrieve theme design token colors as THREE.Color objects
function getThemeColors() {
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

// Custom Fragment Shader code implementing Simplex 3D noise domain warping
const fsSource = `
	precision mediump float;
	varying vec2 v_uv;
	
	uniform vec2 u_resolution;
	uniform float u_time;
	uniform vec2 u_mouse;
	uniform float u_scroll;
	
	uniform vec3 u_bg_color;
	uniform vec3 u_colors[3];
	
	// Permute and helper functions for Ashima Arts Simplex 3D noise
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
	
	// High-frequency procedural grain texture
	float grain(vec2 uv, float time) {
		return fract(sin(dot(uv + time * 0.01, vec2(12.9898, 78.233))) * 43758.5453) * 2.0 - 1.0;
	}
	
	// Domain Warping function to morph the coordinates recursively (creates paint blending)
	vec2 domainWarp(vec2 uv, float time, float mouse_effect, float scroll_effect) {
		vec3 p = vec3(uv * 1.5, time * 0.12);
		
		// First warp layer
		vec2 q = vec2(
			snoise(p),
			snoise(p + vec3(5.2, 1.3, 0.8))
		);
		
		// Second warp layer (mixing mouse interaction and scroll coordinate displacement)
		vec3 r_p = p + vec3(q * 1.4, time * 0.08) + vec3(mouse_effect * 0.6, scroll_effect * 0.6, 0.0);
		vec2 r = vec2(
			snoise(r_p),
			snoise(r_p + vec3(8.3, 2.8, 1.7))
		);
		
		return uv + q * 0.35 + r * 0.18;
	}
	
	void main() {
		vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
		vec2 uv = v_uv;
		
		// 1. Mouse coordinate local fluid displacement (elastic push/stretch away from cursor)
		vec2 mouse_diff = (uv - u_mouse) * aspect;
		float mouse_dist = length(mouse_diff);
		float mouse_influence = smoothstep(0.8, 0.0, mouse_dist);
		
		// Procedural noise to make the push wavy/deformed (behaves like pushed liquid)
		float deform_noise = snoise(vec3(uv * 3.5, u_time * 0.2));
		
		// Using mouse_diff directly instead of normalize(mouse_diff) removes the coordinate singularity.
		// This ensures displacement goes to 0 at the cursor center, preventing tearing or seams.
		vec2 push_vector = mouse_diff * mouse_influence * (0.8 + deform_noise * 0.2);
		vec2 local_uv = uv - push_vector;
		
		// 2. Scroll vortex/spiral coordinate mapping
		float scroll_angle = u_scroll * 3.14159 * 1.5;
		mat2 scroll_rot = mat2(cos(scroll_angle), sin(scroll_angle), -sin(scroll_angle), cos(scroll_angle));
		vec2 centered_uv = local_uv - 0.5;
		centered_uv = mix(centered_uv, scroll_rot * centered_uv, u_scroll * 0.7);
		vec2 shifted_uv = centered_uv + 0.5;
		
		// 3. Domain warping (deforms the coordinate grid)
		vec2 warped_uv = domainWarp(shifted_uv * aspect, u_time, mouse_influence, u_scroll);
		
		// 4. Distinct floating shapes/blobs (using noise threshold with wide smoothstep for blur)
		float shape_noise = snoise(vec3(warped_uv * 1.2, u_time * 0.08));
		float shape_mask = smoothstep(-0.4, 0.6, shape_noise + mouse_influence * 0.25);
		
		// Blending colors ONLY inside the shapes (wide smoothstep creates a beautiful blurred gradient)
		float blend = smoothstep(-0.8, 0.8, snoise(vec3(warped_uv * 0.7, u_time * 0.1)));
		vec3 shape_color = mix(u_colors[0], u_colors[1], blend);
		shape_color = mix(shape_color, u_colors[2], smoothstep(-0.4, 0.8, snoise(vec3(warped_uv * 0.9 + vec2(1.5), u_time * 0.07))));
		
		// 5. Apply grain/noise ONLY on the liquid shapes
		float g = grain(v_uv * u_resolution, u_time) * 0.07;
		vec3 shape_color_with_grain = shape_color + vec3(g);
		
		// 6. Blend shapes with grain over the flat, clean base background
		vec3 final_color = mix(u_bg_color, shape_color_with_grain, shape_mask);
		
		// 7. Gamma correction to convert Linear colors to sRGB (fixes the dark colors issue)
		gl_FragColor = vec4(pow(final_color, vec3(1.0 / 2.2)), 1.0);
	}
`;

/**
 * Three.js Scene manager for compiling and rendering the domain warping fluid background.
 */
export class InteractiveGradientRenderer {
	/**
	 * @param {HTMLCanvasElement} canvas
	 */
	constructor(canvas) {
		this.canvas = canvas;
		this.animationFrameId = 0;
		this.startTime = performance.now();

		// Interactive uniforms states (targets for mouse & scroll)
		this.mouse = {
			current: new THREE.Vector2(0.5, 0.5),
			target: new THREE.Vector2(0.5, 0.5)
		};
		this.scroll = {
			current: 0,
			target: 0
		};

		// Retrieve initial theme colors from CSS
		this.themeColors = getThemeColors();

		// 1. Scene, Camera & Renderer setup
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

		// 2. Geometry & Custom Shader setup
		this.geometry = new THREE.PlaneGeometry(2, 2);
		this.material = new THREE.ShaderMaterial({
			uniforms: {
				u_resolution: { value: new THREE.Vector2() },
				u_time: { value: 0 },
				u_mouse: { value: this.mouse.current },
				u_scroll: { value: 0 },
				u_bg_color: { value: this.themeColors.bg },
				u_colors: { value: [this.themeColors.c1, this.themeColors.c2, this.themeColors.c3] }
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
		// Type asserted to any to prevent raycast types mismatches across Three versions
		this.scene.add(/** @type {any} */ (this.mesh));

		this.resize();
		this.animate();
	}

	/**
	 * Exposes public method to update colors dynamically (e.g. on theme shift)
	 */
	updateColors() {
		this.themeColors = getThemeColors();
		const uniforms = /** @type {any} */ (this.material.uniforms);
		uniforms.u_bg_color.value = this.themeColors.bg;
		uniforms.u_colors.value = [this.themeColors.c1, this.themeColors.c2, this.themeColors.c3];
	}

	/**
	 * Exposes public method to update mouse position from the Svelte Action
	 * @param {number} x - normalized x [0-1]
	 * @param {number} y - normalized y [0-1]
	 */
	updateMouse(x, y) {
		this.mouse.target.set(x, y);
	}

	/**
	 * Exposes public method to update scroll progress externally
	 * @param {number} value - scroll progress [0-1] or pixel offset [>1]
	 */
	updateScroll(value) {
		if (value > 1.0) {
			// Normalizes absolute pixels relative to total scrollable height
			const docHeight = document.documentElement.scrollHeight - window.innerHeight;
			this.scroll.target = docHeight > 0 ? value / docHeight : 0;
		} else {
			this.scroll.target = value;
		}
	}

	resize() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		this.renderer.setSize(width, height, false);
		const uniforms = /** @type {any} */ (this.material.uniforms);
		uniforms.u_resolution.value.set(width, height);
	}

	animate() {
		const elapsedSeconds = (performance.now() - this.startTime) * 0.001;

		// Viscous Easing (Linear Interpolation) with a factor of 0.05 (5%) for liquid flow inertia
		this.mouse.current.x += (this.mouse.target.x - this.mouse.current.x) * 0.05;
		this.mouse.current.y += (this.mouse.target.y - this.mouse.current.y) * 0.05;

		this.scroll.current += (this.scroll.target - this.scroll.current) * 0.05;

		// Feed uniforms
		const uniforms = /** @type {any} */ (this.material.uniforms);
		uniforms.u_time.value = elapsedSeconds;
		uniforms.u_scroll.value = this.scroll.current;

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
