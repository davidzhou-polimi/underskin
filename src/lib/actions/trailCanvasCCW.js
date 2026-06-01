import { gsap } from 'gsap';

/**
 * Counter-clockwise only trail canvas action.
 * Identical animation to the CCW portion of `trailCanvas`, with no CW counterpart.
 * Animation only starts when user scrolls down.
 *
 * @param {HTMLCanvasElement} node
 */
export function trailCanvasCCW(node) {
    if (!node || typeof node.getContext !== 'function') return;

    const ctx = node.getContext('2d');
    if (!ctx) return;

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

    const MAX_POINTS_CCW = 160;
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

    // Freeze exactly at 1.8s (end of run-in) — use add() to fire at that position
    tl.add(() => {
        tl.pause();
    }, TARGET_DURATION_CCW);

    // Redundant fade out after the pause point
    tl.to(stateCCW, {
        angle: START_ANGLE_TOP_RIGHT + Math.PI * 1.4,
        globalAlpha: 0,
        duration: 1.4,
        ease: 'power1.out'
    }, '>');

    // Track scroll position manually for more reliable triggering
    let hasScrolled = false;

    function onScroll() {
        if (!hasScrolled && window.scrollY > 50) {
            hasScrolled = true;
            if (!stateCCW.triggered) {
                stateCCW.triggered = true;
                tl.play();
            }
            window.removeEventListener('scroll', onScroll);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    const isRunComplete = () => tl.progress() >= 1;

    function drawSingleTrailCCW(points, state, maxPoints) {
        const offsetX = isRunComplete() ? Math.sin(wobbleTime * 1.5) * 12 : 0;
        const offsetY = isRunComplete() ? Math.cos(wobbleTime * 1.1) * 10 : 0;

        const centerX = (node.width / 2+200) + offsetX;
        const centerY = (node.height / 2-400) + offsetY;

        const currentRadius = CIRCLE_RADIUS + (isRunComplete() ? Math.sin(wobbleTime * 2.3) * 8 : 0);

        const currentX = centerX + Math.cos(state.angle) * currentRadius;
        const currentY = centerY + Math.sin(state.angle) * currentRadius;

        if (tl.time() < TARGET_DURATION_CCW || points.length === 0) {
            points.push({ x: currentX, y: currentY });
        }

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

                const dx = points[i].origX - (node.width / 2);
                const dy = points[i].origY - (node.height / 2);
                const angleAtPoint = Math.atan2(dy, dx);

                const wave = Math.sin(wobbleTime * 2 + ratio * Math.PI * 2 + waveOffset) * 6;

                points[i].x = centerX + Math.cos(angleAtPoint) * (CIRCLE_RADIUS + wave);
                points[i].y = centerY + Math.sin(angleAtPoint) * (CIRCLE_RADIUS + wave);
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
                const widthWobble = isRunComplete() ? Math.sin(wobbleTime * 3.1 + ratio * Math.PI) * 5 : 0;
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
                window.removeEventListener('scroll', onScroll);
            }
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            tl.kill();
        }
    };
}
