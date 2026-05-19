import { gsap } from 'gsap';

/**
 * @param {HTMLCanvasElement} node
 */
export function trailCanvasBlue2(node) {
	const ctx = node.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
        node.width = window.innerWidth;
        node.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const state = {
        progress: 0,
        waveAmplitude: 220, // 更大波动幅度
        globalAlpha: 1
    };

    /** @type {any[]} */
    let points = [];
    const MAX_POINTS = 130;

    const BLUE_START = '#6A96DF';
    const BLUE_MID = '#3555A0';
    const BLUE_END = '#1E3A6E';

    // ── 【曲线路径生成器】 ──────────────────────────────────────────
    // 动态计算多弯曲路径。从右上角到左下角的波浪轨迹
    /** @param {number} t */
    function getBezierPoint(t) {
        const w = node.width;
        const h = node.height;

        // 基础正弦多重组合波形（控制曲线弯曲几个弯）
        const wave = Math.sin(t * Math.PI * 3.5) * state.waveAmplitude;
        
        // 叠加一层次级微幅高频波动
        const detailWave = Math.cos(t * Math.PI * 6.0) * (state.waveAmplitude * 0.2);

        // 轨迹起点和终点规划：右上角 -> 左下角
        const startX = w + 100;  // 右上角外开始
        const endX = -100;       // 左下角外结束
        const startY = h * 0.15; // 屏幕上方 15%
        const endY = h * 1.85;   // 屏幕下方 185%（跨越两屏）

        // 线性过渡 + 弯曲振幅叠加
        const x = startX + (endX - startX) * t;
        const y = startY + (endY - startY) * t + wave + detailWave;

        return { x, y };
    }

    // ── 【GSAP 时间轴重构】 ─────────────────────────────────────────
    const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 2.0, // 每次划完后歇两秒
        onStart: () => { points = []; state.globalAlpha = 1; },
        onRepeat: () => { points = []; state.globalAlpha = 1; }
    });

    // 阶段 1：进度 0 到 1 极速滑行，主导多段弯曲曲线的运动
    tl.to(state, { 
        progress: 1, 
        duration: 1.8,    // 延长了一点时间，让复杂的弯曲有足够时间舒展
        ease: 'power2.inOut' 
    });
    
    // 阶段 2：淡出收尾
    tl.to(state, { 
        globalAlpha: 0, 
        duration: 0.5, 
        ease: 'power1.out' 
    }, '-=0.3'); // 提前 0.3 秒开始淡出

    function draw() {
        if (!ctx) return;
        ctx.clearRect(0, 0, node.width, node.height);

        // 采样当前时间点的曲线坐标
        const currentPos = getBezierPoint(state.progress);

        if (tl.isActive() && state.progress < 0.99) {
            points.push({ x: currentPos.x, y: currentPos.y });
        }

        if (points.length > MAX_POINTS) points.shift();

        if (points.length > 1) {
            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];
                const ratio = i / (points.length - 1);
                
                // 曲线拖尾宽度渐变
                const currentWidth = 60 + (450 - 60) * Math.pow(ratio, 1.3);

                let baseAlpha;
                if (ratio < 0.3188) {
                    baseAlpha = (ratio / 0.3188) * 0.4;
                } else {
                    baseAlpha = 0.4 + (0.85 - 0.4) * ((ratio - 0.3188) / (1 - 0.3188));
                }
                const finalAlpha = baseAlpha * state.globalAlpha;

                const midX = (p1.x + p2.x) / 2;
                const midY = (p1.y + p2.y) / 2;
                
                // 计算当前两个点之间的切线斜角，保证渐变方向永远垂直于曲线弯曲的方向
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const tangentAngle = Math.atan2(dy, dx) + Math.PI / 2; // 旋转90度得到法线
                
                const cosNorm = Math.cos(tangentAngle);
                const sinNorm = Math.sin(tangentAngle);

                // 创建顺应弯曲形态的自适应线性渐变
                const grad = ctx.createLinearGradient(
                    midX - cosNorm * (currentWidth * 0.5),
                    midY - sinNorm * (currentWidth * 0.5),
                    midX + cosNorm * (currentWidth * 0.5),
                    midY + sinNorm * (currentWidth * 0.5)
                );

                grad.addColorStop(0, `rgba(${hexToRgb(BLUE_START)}, 0)`);
                grad.addColorStop(0.25, `rgba(${hexToRgb(BLUE_START)}, ${finalAlpha})`);
                grad.addColorStop(0.65, `rgba(${hexToRgb(BLUE_MID)}, ${finalAlpha * 0.9})`);
                grad.addColorStop(1.0, `rgba(${hexToRgb(BLUE_END)}, ${finalAlpha * 0.95})`);

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.lineWidth = currentWidth;
                ctx.strokeStyle = grad;
                ctx.stroke();
            }
        }

        requestAnimationFrame(draw);
    }

    /** @param {string} hex */
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : '106, 150, 223';
    }

    draw();

    return {
        destroy() {
            window.removeEventListener('resize', resizeCanvas);
            tl.kill();
        }
    };
}