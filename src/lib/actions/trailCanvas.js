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

    // 初始透明度 0 慢慢淡入
    const stateCCW = { angle: START_ANGLE_BOTTOM, globalAlpha: 0 };
    const stateCW  = { angle: START_ANGLE_BOTTOM, globalAlpha: 0 };

    /** @type {{ x: number, y: number, origX?: number, origY?: number }[]} */
    let pointsCCW = [];
    /** @type {{ x: number, y: number, origX?: number, origY?: number }[]} */
    let pointsCW  = [];

    // 平衡两边的最大点数缓存
    const MAX_POINTS_CCW = 260; 
    const MAX_POINTS_CW  = 120;  
    
    const CIRCLE_RADIUS = 600;

    let wobbleTime = 0;

    const tl = gsap.timeline();

    // 维持你之前设定的跑圈入位总时间阈值
    const TARGET_DURATION_CCW = 3.6;
    const TARGET_DURATION_CW = 5.2;

    // 开场 0.8 秒丝滑淡入
    tl.to(stateCCW, { globalAlpha: 1, duration: 0.8, ease: 'power2.out' }, 0);
    tl.to(stateCW,  { globalAlpha: 1, duration: 0.8, ease: 'power2.out' }, 0);

    // 💡 核心改动：逆时针恢复长跑（+2.5π），顺时针转动角度变小（-1.25π）
    tl.to(stateCCW, { angle: START_ANGLE_BOTTOM + Math.PI * 2.7,  duration: TARGET_DURATION_CCW, ease: 'power3.inOut' }, 0);
    tl.to(stateCW,  { angle: START_ANGLE_BOTTOM - Math.PI * 0.5, duration: TARGET_DURATION_CW,  ease: 'power3.inOut' }, 0);
    
    // 精准拦截在最慢的顺时针轨道的终点（5.2秒）
    tl.add(() => {
        tl.pause();
    }, TARGET_DURATION_CW);

    // 绘制通用的单条流体线段
    function drawSingleTrail(points, state, startAngle, isClockwise, maxPoints, targetDuration) {
        const isSelfPaused = tl.time() >= targetDuration;
        
        // 停留后的轻微整体偏移蠕动
        const timeScale = isClockwise ? 1.3 : 1.0;
        const offsetX = isSelfPaused ? Math.sin(wobbleTime * 1.5 * timeScale) * 12 : 0;
        const offsetY = isSelfPaused ? Math.cos(wobbleTime * 1.1 * timeScale) * 10 : 0;

        const centerX = (node.width / 2) + offsetX;
        const centerY = (node.height / 2) + offsetY;

        const currentRadius = CIRCLE_RADIUS + (isSelfPaused ? Math.sin(wobbleTime * 2.3) * 8 : 0);

        const currentX = centerX + Math.cos(state.angle) * currentRadius;
        const currentY = centerY + Math.sin(state.angle) * currentRadius;

        // 运行期间持续录入点
        if (tl.time() < targetDuration || points.length === 0) {
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
                
                const wave = Math.sin(wobbleTime * 2 + ratio * Math.PI * 2 + waveOffset) * 6;
                
                points[i].x = centerX + Math.cos(angleAtPoint) * (CIRCLE_RADIUS + wave);
                points[i].y = centerY + Math.sin(angleAtPoint) * (CIRCLE_RADIUS + wave);
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
                const currentWidth = 60 + (maxWidth - 60) * Math.pow(ratio, 1.3) + widthWobble;

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

                const trailStart = (typeof window !== 'undefined' && getComputedStyle(document.documentElement).getPropertyValue('--trail-start').trim()) || '#6a96df';
                const trailMid = (typeof window !== 'undefined' && getComputedStyle(document.documentElement).getPropertyValue('--trail-mid').trim()) || '#9b59b6';
                const trailEnd = (typeof window !== 'undefined' && getComputedStyle(document.documentElement).getPropertyValue('--trail-end').trim()) || '#ff7556';

                grad.addColorStop(0, `rgba(${hexToRgb(trailStart)}, 0)`);
                grad.addColorStop(0.3, `rgba(${hexToRgb(trailStart)}, ${finalAlpha})`);
                grad.addColorStop(0.7, `rgba(${hexToRgb(trailMid)}, ${finalAlpha * 0.9})`);
                grad.addColorStop(1.0, `rgba(${hexToRgb(trailEnd)}, ${finalAlpha * 0.95})`);

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

        wobbleTime += 0.008; 

        drawSingleTrail(pointsCCW, stateCCW, START_ANGLE_BOTTOM, false, MAX_POINTS_CCW, TARGET_DURATION_CCW); 
        drawSingleTrail(pointsCW,  stateCW,  START_ANGLE_BOTTOM,  true,  MAX_POINTS_CW,  TARGET_DURATION_CW);  

        drawNoise();

        requestAnimationFrame(draw);
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
            tl.kill();
        }
    };
}