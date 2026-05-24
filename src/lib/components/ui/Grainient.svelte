<script>
	import { Renderer, Program, Mesh, Triangle } from 'ogl';
	import '$lib/components/ui/Grainient.css';

	let {
		timeSpeed = 0.15,
		colorBalance = 0.0,
		warpStrength = 0.4,
		warpFrequency = 3.5,
		warpSpeed = 1.5,
		warpAmplitude = 80.0,
		blendAngle = 0.0,
		blendSoftness = 0.05,
		rotationAmount = 180.0,
		noiseScale = 1.5,
		grainAmount = 0.1,
		grainScale = 2.0,
		grainAnimated = false,
		contrast = 1.5,
		gamma = 1.0,
		saturation = 1.0,
		centerX = 0.0,
		centerY = 0.0,
		zoom = 0.9,
		color1 = '#FF9FFC',
		color2 = '#5227FF',
		color3 = '#B497CF',
		className = ''
	} = $props();

	/** @type {HTMLDivElement | null} */
	let containerEl = $state(null);
	/** @type {WeakMap<HTMLElement, {renderer: any, gl: any, canvas: any, geometry: any, program: any, mesh: any}>} */
	let ctxMap = new WeakMap();

	/** @type {number} */
	let mouseX = 0;
	/** @type {number} */
	let mouseY = 0;
	/** @type {number} */
	let mouseTargetX = 0;
	/** @type {number} */
	let mouseTargetY = 0;

	const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

	const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2 uCenterOffset;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec2 uMouse;
out vec4 fragColor;
#define S(a,b,t) smoothstep(a,b,t)
mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(-1.0+2.0*hash(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(-1.0+2.0*hash(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);return 0.5+0.5*n;}
void mainImage(out vec4 o, vec2 C){
  float t=iTime*uTimeSpeed;
  vec2 uv=C/iResolution.xy;
  float ratio=iResolution.x/iResolution.y;
  vec2 tuv=uv-0.5+uCenterOffset;
  tuv/=max(uZoom,0.001);

  float degree=noise(vec2(t*0.1,tuv.x*tuv.y)*uNoiseScale);
  tuv.y*=1.0/ratio;
  tuv*=Rot(radians((degree-0.5)*uRotationAmount+180.0));
  tuv.y*=ratio;

  // 2. 轻微边缘蠕动 — 保持形状大体稳定，边缘柔和呼吸
  float frequency=uWarpFrequency;
  float ws=max(uWarpStrength,0.001);
  float amplitude=uWarpAmplitude/ws;
  float warpTime=t*uWarpSpeed;
  tuv.x+=sin(tuv.y*frequency+warpTime)/amplitude;
  tuv.y+=sin(tuv.x*(frequency*1.5)+warpTime)/(amplitude*0.5);

  // 3. 鼠标交互 — 基于鼠标方向轻微偏移边缘轮廓，像液体被轻推
  // uMouse 范围 [-0.5, 0.5]，用方向性偏移代替基于距离的衰减
  tuv.x += uMouse.x * 0.22;
  tuv.y += uMouse.y * 0.18;

  vec3 colLav=uColor1;
  vec3 colOrg=uColor2;
  vec3 colDark=uColor3;
  float b=uColorBalance;
  float s=max(uBlendSoftness,0.0);
  mat2 blendRot=Rot(radians(uBlendAngle));
  float blendX=(tuv*blendRot).x;
  float edge0=-0.3-b-s;
  float edge1=0.2-b+s;
  float v0=0.5-b+s;
  float v1=-0.3-b-s;
  vec3 layer1=mix(colDark,colOrg,S(edge0,edge1,blendX));
  vec3 layer2=mix(colOrg,colLav,S(edge0,edge1,blendX));
  vec3 col=mix(layer1,layer2,S(v0,v1,tuv.y));

  vec2 grainUv=uv*max(uGrainScale,0.001);
  if(uGrainAnimated>0.5){grainUv+=vec2(iTime*0.05);}
  float grain=fract(sin(dot(grainUv,vec2(12.9898,78.233)))*43758.5453);
  col+=(grain-0.5)*uGrainAmount;

  col=(col-0.5)*uContrast+0.5;
  float luma=dot(col,vec3(0.2126,0.7152,0.0722));
  col=mix(vec3(luma),col,uSaturation);
  col=pow(max(col,0.0),vec3(1.0/max(uGamma,0.001)));
  col=clamp(col,0.0,1.0);

  o=vec4(col,1.0);
}
void main(){
  vec4 o=vec4(0.0);
  mainImage(o,gl_FragCoord.xy);
  fragColor=o;
}
`;

	const hexToRgb = (/** @type {string} */ hex) => {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		if (!result) return [1, 1, 1];
		return [
			parseInt(result[1], 16) / 255,
			parseInt(result[2], 16) / 255,
			parseInt(result[3], 16) / 255
		];
	};

	$effect(() => {
		if (!containerEl) return;

		/** @type {HTMLElement} */
		const el = containerEl;

		/** @type {any} */
		let renderer;
		/** @type {any} */
		let gl;
		/** @type {any} */
		let canvas;
		/** @type {any} */
		let geometry;
		/** @type {any} */
		let program;
		/** @type {any} */
		let mesh;
		let raf = 0;
		let isVisible = true;
		let isPageVisible = !document.hidden;
		let ro, io;
		/** @type {{renderer: any, gl: any, canvas: any, geometry: any, program: any, mesh: any}} */
		let ctx = { renderer, gl, canvas, geometry, program, mesh };
		ctxMap.set(el, ctx);

		const setSize = () => {
			if (!renderer || !program) return;
			const rect = el.getBoundingClientRect();
			const w = Math.max(1, Math.floor(rect.width));
			const h = Math.max(1, Math.floor(rect.height));
			renderer.setSize(w, h);
			const res = program.uniforms.iResolution.value;
			res[0] = gl.drawingBufferWidth;
			res[1] = gl.drawingBufferHeight;
			renderer.render({ scene: mesh });
		};

		const tryStart = () => {
			if (isVisible && isPageVisible && raf === 0) {
				raf = requestAnimationFrame(loop);
			}
		};

		const tryStop = () => {
			if (raf !== 0) {
				cancelAnimationFrame(raf);
				raf = 0;
			}
		};

		const loop = (/** @type {number} */ t) => {
			program.uniforms.iTime.value = t * 0.001;
			// 平滑插值鼠标坐标
			mouseX += (mouseTargetX - mouseX) * 0.08;
			mouseY += (mouseTargetY - mouseY) * 0.08;
			program.uniforms.uMouse.value[0] = mouseX;
			program.uniforms.uMouse.value[1] = mouseY;
			renderer.render({ scene: mesh });
			raf = requestAnimationFrame(loop);
		};

		// 鼠标移动 — 映射到 [-0.5, 0.5] 空间（WebGL Y轴朝上）
		const handleMouseMove = (/** @type {MouseEvent} */ e) => {
			if (!containerEl) return;
			const rect = containerEl.getBoundingClientRect();
			mouseTargetX = (e.clientX - rect.left) / rect.width - 0.5;
			mouseTargetY = (rect.height - (e.clientY - rect.top)) / rect.height - 0.5;
		};

		// 鼠标移出 — 归零
		const handleMouseLeave = () => {
			mouseTargetX = 0;
			mouseTargetY = 0;
		};

		// Build WebGL context once
		renderer = new Renderer({
			webgl: 2,
			alpha: true,
			antialias: false,
			dpr: Math.min(window.devicePixelRatio || 1, 2)
		});

		gl = renderer.gl;
		canvas = gl.canvas;
		canvas.style.width = '100%';
		canvas.style.height = '100%';
		canvas.style.display = 'block';
		el.appendChild(canvas);

		geometry = new Triangle(gl);
		program = new Program(gl, {
			vertex,
			fragment,
			uniforms: {
				iTime: { value: 0 },
				iResolution: { value: new Float32Array([1, 1]) },
				uTimeSpeed: { value: timeSpeed },
				uColorBalance: { value: colorBalance },
				uWarpStrength: { value: warpStrength },
				uWarpFrequency: { value: warpFrequency },
				uWarpSpeed: { value: warpSpeed },
				uWarpAmplitude: { value: warpAmplitude },
				uBlendAngle: { value: blendAngle },
				uBlendSoftness: { value: blendSoftness },
				uRotationAmount: { value: rotationAmount },
				uNoiseScale: { value: noiseScale },
				uGrainAmount: { value: grainAmount },
				uGrainScale: { value: grainScale },
				uGrainAnimated: { value: grainAnimated ? 1.0 : 0.0 },
				uContrast: { value: contrast },
				uGamma: { value: gamma },
				uSaturation: { value: saturation },
				uCenterOffset: { value: new Float32Array([centerX, centerY]) },
				uZoom: { value: zoom },
				uColor1: { value: new Float32Array(hexToRgb(color1)) },
				uColor2: { value: new Float32Array(hexToRgb(color2)) },
				uColor3: { value: new Float32Array(hexToRgb(color3)) },
				uMouse: { value: new Float32Array([0, 0]) }
			}
		});

		mesh = new Mesh(gl, { geometry, program });
		ctxMap.set(el, ctx);

		ro = new ResizeObserver(setSize);
		ro.observe(el);
		setSize();

		io = new IntersectionObserver(
			([entry]) => {
				isVisible = entry.isIntersecting;
				isVisible ? tryStart() : tryStop();
			},
			{ threshold: 0 }
		);
		io.observe(containerEl);

		const onVisibility = () => {
			isPageVisible = !document.hidden;
			isPageVisible ? tryStart() : tryStop();
		};
		document.addEventListener('visibilitychange', onVisibility);

		el.addEventListener('mousemove', handleMouseMove);
		el.addEventListener('mouseleave', handleMouseLeave);

		tryStart();

		return () => {
			tryStop();
			ro?.disconnect();
			io?.disconnect();
			document.removeEventListener('visibilitychange', onVisibility);
			el.removeEventListener('mousemove', handleMouseMove);
			el.removeEventListener('mouseleave', handleMouseLeave);
			ctxMap.delete(el);
			try {
				el.removeChild(canvas);
			} catch {
				// ignore
			}
		};
	});

	// Sync props to uniforms
	$effect(() => {
		if (!containerEl) return;
		const ctx = ctxMap.get(containerEl);
		if (!ctx || !ctx.program) return;
		const u = ctx.program.uniforms;

		u.uTimeSpeed.value = timeSpeed;
		u.uColorBalance.value = colorBalance;
		u.uWarpStrength.value = warpStrength;
		u.uWarpFrequency.value = warpFrequency;
		u.uWarpSpeed.value = warpSpeed;
		u.uWarpAmplitude.value = warpAmplitude;
		u.uBlendAngle.value = blendAngle;
		u.uBlendSoftness.value = blendSoftness;
		u.uRotationAmount.value = rotationAmount;
		u.uNoiseScale.value = noiseScale;
		u.uGrainAmount.value = grainAmount;
		u.uGrainScale.value = grainScale;
		u.uGrainAnimated.value = grainAnimated ? 1.0 : 0.0;
		u.uContrast.value = contrast;
		u.uGamma.value = gamma;
		u.uSaturation.value = saturation;
		u.uCenterOffset.value = new Float32Array([centerX, centerY]);
		u.uZoom.value = zoom;
		u.uColor1.value = new Float32Array(hexToRgb(color1));
		u.uColor2.value = new Float32Array(hexToRgb(color2));
		u.uColor3.value = new Float32Array(hexToRgb(color3));
	});
</script>

<div bind:this={containerEl} class="grainient-container {className}"></div>
