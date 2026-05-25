import { gsap } from 'gsap';

/**
 * Counter-clockwise only trail canvas action.
 * Animation starts when user scrolls down.
 * Tail remains visible after animation completes.
 *
 * @param {HTMLCanvasElement} node
 */
export function trailCanvasCCW(node) {
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
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
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

    // Right semicircle CCW: top-right (−π/2) → bottom-right (π/2) via the left arc
    const START_ANGLE_TOP_RIGHT = -Math.PI * 0.5;

    const stateCCW = { angle: START_ANGLE_TOP_RIGHT, globalAlpha: 0, triggered: false };

    /** @type {{ x: number, y: number, origX?: number, origY?: number }[]} */
    let pointsCCW = [];

    const MAX_POINTS_CCW = 200;
    const CIRCLE_RADIUS = 600;

    let wobbleTime = 0;

    const tl = gsap.timeline({ paused: true });

    const TARGET_DURATION_CCW = 1.8;

    // Smooth fade in at start
    tl.to(stateCCW, { globalAlpha: 1, duration: 0.8, ease: 'power2.out' }, 0);

    // CCW run: top-right → bottom-right (π radians of CCW travel = right semicircle)
    tl.to(stateCCW, {
        angle: START_ANGLE_TOP_RIGHT + Math.PI,
        duration: TARGET_DURATION_CCW,
        ease: 'power3.inOut'
    }, 0);

    // Freeze at the end — NO fade out, tail stays visible
    tl.add(() => {
        tl.pause();
    }, TARGET_DURATION_CCW);

    // Track scroll position - start animation when section is visible in viewport
    let hasTriggered = false;

    if (typeof IntersectionObserver !== 'undefined') {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasTriggered) {
                        hasTriggered = true;
                        if (!stateCCW.triggered) {
                            stateCCW.triggered = true;
                            tl.play();
                        }
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.1 }
        );
        observer.observe(node);
    }

    const isRunComplete = () => tl.progress() >= 1;

    // 保存动画完成时的中心位置（不含蠕动），用于定格状态的呼吸计算
    let frozenCenterX = 0;
    let frozenCenterY = 0;
    let hasFrozenCenter = false;

    function drawSingleTrailCCW(points, state, maxPoints) {
        // 蠕动效果：从 0 渐变到目标值，避免突然跳跃
        const wobbleStrength = isRunComplete() ? 1 : 0;
        const wobblePhase = isRunComplete() ? wobbleTime : 0;
        const offsetX = Math.sin(wobblePhase * 1.5) * 12 * wobbleStrength;
        const offsetY = Math.cos(wobblePhase * 1.1) * 10 * wobbleStrength;

        // 固定中心位置（不含蠕动）
        const fixedCenterX = node.width / 2 + 200;
        const fixedCenterY = node.height / 2 - 400;

        // 实际绘制中心（含蠕动）
        const centerX = fixedCenterX + offsetX;
        const centerY = fixedCenterY + offsetY;

        // 动画完成时保存固定中心位置
        if (isRunComplete() && !hasFrozenCenter) {
            frozenCenterX = fixedCenterX;
            frozenCenterY = fixedCenterY;
            hasFrozenCenter = true;
        }

        // 半径呼吸效果
        const radiusWobbleStrength = isRunComplete() ? 1 : 0;
        const radiusWobblePhase = isRunComplete() ? wobbleTime : 0;
        const currentRadius = CIRCLE_RADIUS + Math.sin(radiusWobblePhase * 2.3) * 8 * radiusWobbleStrength;

        const currentX = centerX + Math.cos(state.angle) * currentRadius;
        const currentY = centerY + Math.sin(state.angle) * currentRadius;

        if (tl.time() < TARGET_DURATION_CCW || points.length === 0) {
            points.push({ x: currentX, y: currentY });
        }

        // 定格状态下，使用固定的中心位置进行呼吸计算
        if (isRunComplete() && points.length > 0 && points[0].origX === undefined) {
            for (let i = 0; i < points.length; i++) {
                points[i].origX = points[i].x;
                points[i].origY = points[i].y;
            }
        }

        if (isRunComplete() && points.length > 0) {
            for (let i = 0; i < points.length; i++) {
                const ratio = i / (points.length - 1);
                const waveOffset = Math.PI;

                const dx = points[i].origX - frozenCenterX;
                const dy = points[i].origY - frozenCenterY;
                const angleAtPoint = Math.atan2(dy, dx);

                const wave = Math.sin(wobbleTime * 2 + ratio * Math.PI * 2 + waveOffset) * 6;

                points[i].x = fixedCenterX + Math.cos(angleAtPoint) * (CIRCLE_RADIUS + wave);
                points[i].y = fixedCenterY + Math.sin(angleAtPoint) * (CIRCLE_RADIUS + wave);
            }
        }

        if (!isRunComplete() && points.length > maxPoints) {
            points.shift();
        }

        if (points.length > 1) {
            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];
                const ratio = i / (points.length - 1);

                const maxWidth = 400;
                const widthWobbleStrength = isRunComplete() ? 1 : 0;
                const widthWobble = Math.sin(wobbleTime * 3.1 + ratio * Math.PI) * 5 * widthWobbleStrength;
                // Tail tapers from baseWidth (thin at tip) to maxWidth (thick at head)
                const baseWidth = 12;
                const currentWidth = baseWidth + (maxWidth - baseWidth) * Math.pow(ratio, 0.7) + widthWobble;

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

                // Single color from CSS variable
                const color = getCSSVar('--archetipi-favorito', '#6a96df');
                const colorRgb = hexToRgb(color);

                grad.addColorStop(0, `rgba(${colorRgb}, 0)`);
                grad.addColorStop(0.3, `rgba(${colorRgb}, ${finalAlpha})`);
                grad.addColorStop(0.7, `rgba(${colorRgb}, ${finalAlpha * 0.9})`);
                grad.addColorStop(1.0, `rgba(${colorRgb}, ${finalAlpha * 0.95})`);

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

    let animationId;

    function draw() {
        if (!ctx) return;

        if (!stateCCW.triggered) {
            animationId = requestAnimationFrame(draw);
            return;
        }

        ctx.clearRect(0, 0, node.width, node.height);

        wobbleTime += 0.008;

        drawSingleTrailCCW(pointsCCW, stateCCW, MAX_POINTS_CCW);

        drawNoise();

        animationId = requestAnimationFrame(draw);
    }

    /**
     * @param {string} varName
     * @param {string} fallback
     */
    function getCSSVar(varName, fallback) {
        if (typeof document === 'undefined') return fallback;
        const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        return value || fallback;
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

    animationId = requestAnimationFrame(draw);

    return {
        destroy() {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', resizeCanvas);
            }
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            tl.kill();
        }
    };
}
