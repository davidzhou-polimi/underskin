import { gsap } from 'gsap';

/**
 * @param {HTMLCanvasElement} node
 */
export function trailCanvas(node) {
    if (!node || typeof node.getContext !== 'function') return;

    const ctx = node.getContext('2d');
    if (!ctx) return;

    // Grain noise canvas
    /** @type {HTMLCanvasElement | undefined} */
    let noiseCanvas;
    /** @type {CanvasRenderingContext2D | null | undefined} */
    let noiseCtx;
    const GRAIN_OPACITY = 0.12;

    // 动态模糊控制：旋转中从 60 过渡到 160，停留后保持 160
    const BLUR_PAUSED = 120;
    let animStarted = false;

    // 初始化时模糊 60
    node.style.filter = `blur(60px) saturate(1)`;

    const resizeCanvas = () => {
        node.width = window.innerWidth;
        node.height = window.innerHeight;
        initNoiseCanvas();
    };
    
    if (typeof window !== 'undefined') {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    function initNoiseCanvas() {
        if (typeof document === 'undefined') return;
        noiseCanvas = document.createElement('canvas');
        noiseCanvas.width = window.innerWidth;
        noiseCanvas.height = window.innerHeight;
        noiseCtx = noiseCanvas.getContext('2d');
        generateNoise();
    }

    function generateNoise() {
        if (!noiseCanvas || !noiseCtx) return;
        const w = noiseCanvas.width;
        const h = noiseCanvas.height;
        const imageData = noiseCtx.createImageData(w, h);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const alpha = Math.random() < 0.4 ? GRAIN_OPACITY * 255 : 0;
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
            data[i + 3] = alpha;
        }

        noiseCtx.putImageData(imageData, 0, 0);
    }

    function drawNoise() {
        if (!noiseCanvas || !ctx) return;
        if (Math.random() < 0.3) {
            generateNoise();
        }
        ctx.drawImage(noiseCanvas, 0, 0);
    }

    // 起点：正下方 (Math.PI * 0.5)
    const START_ANGLE_BOTTOM = Math.PI * 0.5; 

    // 初始透明度 0，isInitialized 控制是否开始绘制
    const stateCCW = { angle: START_ANGLE_BOTTOM, globalAlpha: 0 };
    const stateCW  = { angle: START_ANGLE_BOTTOM, globalAlpha: 0 };

    // 缩放状态（用于 CerchiQuiz 缩小效果）
    const scaleState = { scale: 1, isShrinking: false };
    
    // 是否已初始化（用户触发后才开始绘制）
    let isInitialized = false;

    /** @type {{ x: number, y: number, origX?: number, origY?: number }[]} */
    let pointsCCW = [];
    /** @type {{ x: number, y: number, origX?: number, origY?: number }[]} */
    let pointsCW  = [];

    // 平衡两边的最大点数缓存
    const MAX_POINTS_CCW = 260; 
    const MAX_POINTS_CW  = 120;  
    
    let baseCircleRadius = 600;

    let wobbleTime = 0;

    // 维持你之前设定的跑圈入位总时间阈值
    const TARGET_DURATION_CCW = 3.6;
    const TARGET_DURATION_CW = 5.2;

    // 开场 0.8 秒丝滑淡入
    let tl = gsap.timeline({ paused: true });

    // 播放（带循环）
    let isPlaying = false;
    let loopId = null;
    /** @type {number | null} */
    let drawId = null;

    // I token --trail-* sono statici: li risolviamo in RGB una sola volta qui,
    // così il loop di draw evita getComputedStyle + regex per ogni segmento ad ogni frame.
    const readToken = (/** @type {string} */ name, /** @type {string} */ fallback) =>
        (typeof window !== 'undefined' && getComputedStyle(document.documentElement).getPropertyValue(name).trim()) || fallback;
    const trailStartRgb = hexToRgb(readToken('--trail-start', '#6a96df'));
    const trailMidRgb = hexToRgb(readToken('--trail-mid', '#9b59b6'));
    const trailEndRgb = hexToRgb(readToken('--trail-end', '#ff7556'));

    function playIntro() {
        // 重置状态
        stateCCW.angle = START_ANGLE_BOTTOM;
        stateCW.angle = START_ANGLE_BOTTOM;
        stateCCW.globalAlpha = 0;
        stateCW.globalAlpha = 0;
        pointsCCW = [];
        pointsCW = [];
        
        // 重置 timeline
        tl.kill();
        tl = gsap.timeline({ paused: true });
        // 0.8 秒丝滑淡入
        tl.to(stateCCW, { globalAlpha: 1, duration: 0.8, ease: 'power2.out' }, 0);
        tl.to(stateCW,  { globalAlpha: 1, duration: 0.8, ease: 'power2.out' }, 0);
        // 角度动画
        tl.to(stateCCW, { angle: START_ANGLE_BOTTOM + Math.PI * 2.7,  duration: TARGET_DURATION_CCW, ease: 'power3.inOut' }, 0);
        tl.to(stateCW,  { angle: START_ANGLE_BOTTOM - Math.PI * 0.5, duration: TARGET_DURATION_CW,  ease: 'power3.inOut' }, 0);
        
        // 精准拦截在最慢的顺时针轨道的终点（5.2秒）
        tl.add(() => {
            if (!scaleState.isShrinking) {
                tl.pause();
            }
        }, TARGET_DURATION_CW);
        
        tl.play();
        isPlaying = true;
    }

    // 无限循环播放（用于 playIntro 播放完后的自动循环检测）
    function loopIntro() {
        if (!isPlaying) return;

        // 如果 timeline 已暂停，说明动画播放完成
        if (tl.paused()) {
            isPlaying = false;
            return;
        }

        loopId = requestAnimationFrame(loopIntro);
    }

    // 开始循环
    // @param {boolean} loop - true = 无限循环, false = 只播放一次然后暂停
    function startLoop(loop = true) {
        isInitialized = true;
        
        // 取消现有的 loop
        if (loopId) {
            cancelAnimationFrame(loopId);
            loopId = null;
        }
        
        if (loop) {
            // 无限循环模式
            isPlaying = true;
            playIntro();
            loopId = requestAnimationFrame(loopIntro);
        } else {
            // 只播放一次模式
            isPlaying = false; // 重置，因为动画会暂停
            playIntro();
        }
    }
    
    // 开始缩小动画（已禁用）
    function startShrink(targetScale = 0.5, duration = 2, onComplete) {
        // 缩小动画已移除，不做任何事
    }

    // 绘制通用的单条流体线段
    function drawSingleTrail(points, state, startAngle, isClockwise, maxPoints, targetDuration) {
        // 判断当前线条自己是否处于定格暂停阶段
        const isSelfPaused = tl && tl.paused() && tl.time() >= targetDuration && !scaleState.isShrinking;
        
        // 停留后的轻微整体偏移蠕动
        const timeScale = isClockwise ? 1.3 : 1.0;
        const offsetX = isSelfPaused ? Math.sin(wobbleTime * 1.5 * timeScale) * 12 : 0;
        const offsetY = isSelfPaused ? Math.cos(wobbleTime * 1.1 * timeScale) * 10 : 0;

        const centerX = (node.width / 2) + offsetX;
        const centerY = (node.height / 2) + offsetY;

        // 应用缩放
        const currentRadius = (baseCircleRadius + (isSelfPaused ? Math.sin(wobbleTime * 2.3) * 8 : 0)) * scaleState.scale;

        const currentX = centerX + Math.cos(state.angle) * currentRadius;
        const currentY = centerY + Math.sin(state.angle) * currentRadius;

        // 运行期间持续录入点，或者在调用 continueRotation 清空点后进行初次录入
        const isTlActive = tl && tl.isActive() && tl.time() < targetDuration;
        if (isTlActive || points.length === 0) {
            points.push({ x: currentX, y: currentY });
        } 
        
        // 锁定封存：当它跑完入位时固化坐标，防止物理闪烁
        if (isSelfPaused && points.length > 0 && points[0].origX === undefined) {
            for (let i = 0; i < points.length; i++) {
                points[i].origX = points[i].x;
                points[i].origY = points[i].y;
            }
        }

        // 定格状态下的原位呼吸逻辑
        if (isSelfPaused && points.length > 0) {
            for (let i = 0; i < points.length; i++) {
                const ratio = i / (points.length - 1);
                const waveOffset = isClockwise ? Math.PI : 0;
                
                const dx = points[i].origX - (node.width / 2);
                const dy = points[i].origY - (node.height / 2);
                const angleAtPoint = Math.atan2(dy, dx);
                
                const wave = Math.sin(wobbleTime * 2 + ratio * Math.PI * 2 + waveOffset) * 6 * scaleState.scale;
                
                points[i].x = centerX + Math.cos(angleAtPoint) * (currentRadius + wave);
                points[i].y = centerY + Math.sin(angleAtPoint) * (currentRadius + wave);
            }
        }

        // 只有在运动跑圈期间才允许 shift() 裁剪尾巴，确保静止后身形不收缩消失
        if (!isSelfPaused && points.length > maxPoints) {
            points.shift();
        }

        if (points.length > 1) {
            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];
                const ratio = i / (points.length - 1);

                const maxWidth = isClockwise ? 220 : 400;
                const widthWobble = isSelfPaused ? Math.sin(wobbleTime * 3.1 + ratio * Math.PI) * 5 : 0;
                const currentWidth = (60 + (maxWidth - 60) * Math.pow(ratio, 1.3) + widthWobble) * scaleState.scale;

                let baseAlpha;
                if (ratio < 0.3188) {
                    baseAlpha = (ratio / 0.3188) * 0.4;
                } else {
                    baseAlpha = 0.4 + (0.85 - 0.4) * ((ratio - 0.3188) / (1 - 0.3188));
                }
                
                const finalAlpha = baseAlpha * state.globalAlpha;

                const midX = (p1.x + p2.x) / 2;
                const midY = (p1.y + p2.y) / 2;
                const angle = Math.PI / 4;
                const cos45 = Math.cos(angle);
                const sin45 = Math.sin(angle);

                const grad = ctx.createLinearGradient(
                    midX - cos45 * (currentWidth * 0.5),
                    midY - sin45 * (currentWidth * 0.5),
                    midX + cos45 * (currentWidth * 0.5),
                    midY + sin45 * (currentWidth * 0.5)
                );

                grad.addColorStop(0, `rgba(${trailStartRgb}, 0)`);
                grad.addColorStop(0.3, `rgba(${trailStartRgb}, ${finalAlpha})`);
                grad.addColorStop(0.7, `rgba(${trailMidRgb}, ${finalAlpha * 0.9})`);
                grad.addColorStop(1.0, `rgba(${trailEndRgb}, ${finalAlpha * 0.95})`);

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.lineWidth = Math.max(1, currentWidth);
                ctx.strokeStyle = grad;
                ctx.stroke();
            }
        }
    }

    function draw() {
        if (!ctx) return;
        ctx.clearRect(0, 0, node.width, node.height);

        // 只有在初始化后才绘制
        if (!isInitialized) {
            drawId = requestAnimationFrame(draw);
            return;
        }

        wobbleTime += 0.008; 

        drawSingleTrail(pointsCCW, stateCCW, START_ANGLE_BOTTOM, false, MAX_POINTS_CCW, TARGET_DURATION_CCW);
        drawSingleTrail(pointsCW,  stateCW,  START_ANGLE_BOTTOM,  true,  MAX_POINTS_CW,  TARGET_DURATION_CW);

        // 旋转过程中模糊从 60 过渡到 160，停留后保持 160
        const isCurrentlyPaused = tl && tl.paused() && tl.time() >= TARGET_DURATION_CCW;

        // 动画进度超过 80% 时开始过渡
        const isNearEnd = tl && tl.progress() > 0.5;

        if (!isCurrentlyPaused && isNearEnd && !animStarted) {
            // 快到达终点 → 从 60 丝滑过渡到 160
            gsap.killTweensOf(node);
            gsap.to(node, {
                filter: `blur(${BLUR_PAUSED}px) saturate(1)`,
                duration: 1.5,
                ease: 'power2.out'
            });
            animStarted = true;
        }
        // 暂停后保持 160，不做任何操作

        drawNoise();

        drawId = requestAnimationFrame(draw);
    }

    /**
     * @param {string} hex
     */
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : '106, 150, 223';
    }

    draw();

    return {
        destroy() {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', resizeCanvas);
            }
            if (loopId) cancelAnimationFrame(loopId);
            if (drawId) cancelAnimationFrame(drawId);
            tl.kill();
            gsap.killTweensOf(stateCCW);
            gsap.killTweensOf(stateCW);
            gsap.killTweensOf(scaleState);
        },
        startLoop,
        startShrink,
        resumeLoop: () => {
            if (!tl.paused()) {
                // timeline 已在播放，只需重置样式
                animStarted = false;
                node.style.filter = `blur(60px) saturate(1)`;
            } else {
                // timeline 已暂停，重新播放
                isPlaying = true;
                animStarted = false;
                node.style.filter = `blur(60px) saturate(1)`;
                playIntro();
                loopId = requestAnimationFrame(loopIntro);
            }
        }
    };
}