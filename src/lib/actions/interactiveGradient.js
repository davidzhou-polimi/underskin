import { scroll } from '$lib/stores/scroll.svelte.js';

// Helper to convert HEX colors to RGB float arrays [0-1] for GLSL uniforms
/**
 * @param {string} hex
 */
function hexToRgb(hex) {
	let cleanHex = hex.trim();
	if (cleanHex.startsWith('#')) {
		cleanHex = cleanHex.slice(1);
	}
	// Handle shorthand hex like #fff
	if (cleanHex.length === 3) {
		let expanded = '';
		for (let i = 0; i < cleanHex.length; i++) {
			expanded += cleanHex[i] + cleanHex[i];
		}
		cleanHex = expanded;
	}
	const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
	const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
	const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
	return [r, g, b];
}

// Helper to retrieve theme colors from CSS variables
function getThemeColors() {
	if (typeof window === 'undefined') return {
		c1: [0.42, 0.59, 0.87], // fallback azzurro
		c2: [0.5, 0.21, 0.82],  // fallback viola
		c3: [0.85, 0.38, 0.27]  // fallback arancione
	};
	const style = getComputedStyle(document.documentElement);
	// We read the global theme design tokens as requested by the user
	const c1Val = style.getPropertyValue('--azzurro-500') || '#6a96df';
	const c2Val = style.getPropertyValue('--viola-500') || '#8035d2';
	const c3Val = style.getPropertyValue('--arancione-500') || '#d86146';
	return {
		c1: hexToRgb(c1Val),
		c2: hexToRgb(c2Val),
		c3: hexToRgb(c3Val)
	};
}

// Vertex shader source: draws a full-screen quad and maps texture coordinates
const vsSource = `
	attribute vec2 a_position;
	varying vec2 v_uv;
	void main() {
		v_uv = a_position * 0.5 + 0.5;
		gl_Position = vec4(a_position, 0.0, 1.0);
	}
`;

// Fragment shader source: implements multi-layered noise, mouse distortion, and scroll-controlled morphing
const fsSource = `
	precision mediump float;
	varying vec2 v_uv;
	
	uniform vec2 u_resolution;
	uniform float u_time;
	uniform vec2 u_mouse;
	uniform float u_scroll;
	
	uniform vec3 u_color1;
	uniform vec3 u_color2;
	uniform vec3 u_color3;
	
	// Pseudo-random hash generator for 2D noise grid
	float hash(vec2 p) {
		return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
	}
	
	// Smooth 2D value noise
	float noise(vec2 p) {
		vec2 i = floor(p);
		vec2 f = fract(p);
		vec2 u = f * f * (3.0 - 2.0 * f);
		return mix(
			mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
			mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
			u.y
		);
	}
	
	// Fractional Brownian Motion (fBm) to generate rich, organic waves
	float fbm(vec2 p) {
		float value = 0.0;
		float amplitude = 0.5;
		// Matrix to rotate coordinates and avoid grid alignment artifacts
		mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
		for (int i = 0; i < 4; i++) {
			value += amplitude * noise(p);
			p = rot * p * 2.0 + vec2(50.0);
			amplitude *= 0.5;
		}
		return value;
	}
	
	void main() {
		// Aspect-ratio correction to avoid stretching noise patterns
		vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
		vec2 uv = v_uv;
		
		// 1. Mouse Interaction (Localized Fluid Distortion)
		// Calculates vector from pixel to mouse cursor
		vec2 mouse_diff = (uv - u_mouse) * aspect;
		float mouse_dist = length(mouse_diff);
		// Localized radial warp strength decreasing with distance
		float mouse_influence = smoothstep(0.5, 0.0, mouse_dist);
		// Offset UV coordinates locally around mouse cursor
		vec2 distorted_uv = uv + (uv - u_mouse) * mouse_influence * 0.12;
		
		// 2. Scroll-controlled morphing behavior
		// Mixes Cartesian coordinates (for waves) and Polar coordinates (vortex/blobs)
		vec2 cartesian = (distorted_uv - 0.5) * aspect * 2.5;
		
		vec2 to_center = (distorted_uv - 0.5) * aspect;
		float r = length(to_center) * 3.0;
		float theta = atan(to_center.y, to_center.x);
		vec2 polar = vec2(r, theta / 3.14159);
		
		// Interpolate between Cartesian layout and Polar layout as user scrolls
		vec2 noise_uv = mix(cartesian, polar, u_scroll);
		
		// Add continuous animation time offset
		noise_uv.x += u_time * 0.05;
		noise_uv.y += sin(u_time * 0.03) * 0.2;
		
		// 3. Noise generation and offset (turbulent flow)
		float n1 = fbm(noise_uv);
		float n2 = fbm(noise_uv + n1 + vec2(u_time * 0.02));
		
		// 4. Color blending
		// Mixes colors based on the final noise value
		vec3 color = mix(u_color1, u_color2, n2);
		color = mix(color, u_color3, n1 * 0.5);
		
		// Add a subtle brightness modulation for highlight depth
		color += vec3(n2 * 0.06);
		
		gl_FragColor = vec4(color, 1.0);
	}
`;

/**
 * Svelte Action to initialize and update a canvas using Vanilla WebGL.
 * Creates an interactive, scroll-morphing noise gradient background.
 * @param {HTMLCanvasElement} canvas
 */
export function interactiveGradient(canvas) {
	const webglContext = canvas.getContext('webgl');
	if (!webglContext) {
		console.warn('WebGL is not supported by this browser.');
		return {};
	}
	/** @type {WebGLRenderingContext} */
	const gl = webglContext;

	// Helper to compile a WebGL shader
	/**
	 * @param {string} source
	 * @param {number} type
	 */
	function compileShader(source, type) {
		const shader = gl.createShader(type);
		if (!shader) return null;
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error('Shader compile error:', gl.getShaderInfoLog(shader));
			gl.deleteShader(shader);
			return null;
		}
		return shader;
	}

	// 1. Compile Shaders & Create Program
	const vs = compileShader(vsSource, gl.VERTEX_SHADER);
	const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
	if (!vs || !fs) return {};

	const program = gl.createProgram();
	if (!program) return {};
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('Program link error:', gl.getProgramInfoLog(program));
		return {};
	}

	// 2. Set Up Geometry (Full Screen Quad)
	const vertices = new Float32Array([
		-1, -1,  1, -1, -1,  1,
		-1,  1,  1, -1,  1,  1
	]);
	const buffer = gl.createBuffer();
	if (!buffer) return {};
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	const positionLoc = gl.getAttribLocation(program, 'a_position');
	gl.enableVertexAttribArray(positionLoc);
	gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

	// 3. Retrieve Uniform Locations
	const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
	const timeLoc = gl.getUniformLocation(program, 'u_time');
	const mouseLoc = gl.getUniformLocation(program, 'u_mouse');
	const scrollLoc = gl.getUniformLocation(program, 'u_scroll');
	const color1Loc = gl.getUniformLocation(program, 'u_color1');
	const color2Loc = gl.getUniformLocation(program, 'u_color2');
	const color3Loc = gl.getUniformLocation(program, 'u_color3');

	// Interactive states with smooth interpolation variables (easing)
	let width = canvas.clientWidth;
	let height = canvas.clientHeight;
	let mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
	let scrollVal = { current: 0, target: 0 };
	let themeColors = getThemeColors();

	// Resize canvas dynamically to match layout
	function handleResize() {
		width = window.innerWidth;
		height = window.innerHeight;
		canvas.width = width;
		canvas.height = height;
		gl.viewport(0, 0, width, height);
	}

	// Tracks mouse position relative to window (0-1 range, flipped Y for WebGL)
	/**
	 * @param {MouseEvent} e
	 */
	function handleMouseMove(e) {
		mouse.targetX = e.clientX / window.innerWidth;
		mouse.targetY = 1.0 - (e.clientY / window.innerHeight);
	}

	// Listens for colors updates if themes/variables change (e.g. system mode shifts)
	function handleThemeUpdate() {
		themeColors = getThemeColors();
	}

	window.addEventListener('resize', handleResize);
	window.addEventListener('mousemove', handleMouseMove);
	// Listen on system configuration shifts or custom theme trigger classes
	window.addEventListener('colors-update', handleThemeUpdate);

	handleResize();

	// 4. Render Loop
	let animationFrameId = 0;
	let startTime = performance.now();

	function render() {
		const time = (performance.now() - startTime) * 0.001; // elapsed seconds

		// Smooth interpolation of mouse positions (8% easing step)
		mouse.x += (mouse.targetX - mouse.x) * 0.08;
		mouse.y += (mouse.targetY - mouse.y) * 0.08;

		// Smooth interpolation of scroll progress (10% easing step)
		scrollVal.target = scroll.progress;
		scrollVal.current += (scrollVal.target - scrollVal.current) * 0.1;

		// Bind context and uniforms
		gl.useProgram(program);
		gl.uniform2f(resolutionLoc, width, height);
		gl.uniform1f(timeLoc, time);
		gl.uniform2f(mouseLoc, mouse.x, mouse.y);
		gl.uniform1f(scrollLoc, scrollVal.current);

		// Pass RGB vectors for colors
		gl.uniform3fv(color1Loc, themeColors.c1);
		gl.uniform3fv(color2Loc, themeColors.c2);
		gl.uniform3fv(color3Loc, themeColors.c3);

		// Draw quad geometry
		gl.drawArrays(gl.TRIANGLES, 0, 6);

		animationFrameId = requestAnimationFrame(render);
	}

	render();

	// Return Svelte action handlers
	return {
		destroy() {
			// Clean up all animation frame requests
			cancelAnimationFrame(animationFrameId);
			// Clean up global window event listeners to prevent memory leaks
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('colors-update', handleThemeUpdate);
			// Clean up WebGL API context handles
			gl.deleteBuffer(buffer);
			gl.deleteProgram(program);
			gl.deleteShader(vs);
			gl.deleteShader(fs);
		}
	};
}
