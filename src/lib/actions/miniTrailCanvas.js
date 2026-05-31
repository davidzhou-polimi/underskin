import { gsap } from 'gsap';

/**
 * Mini trail canvas per i cerchi del quiz
 * @param {HTMLCanvasElement} node
 * @param {{ size?: number }} options
 */
export function miniTrailCanvas(node, options = {}) {
    if (!node || typeof node.getContext !== 'function') return;

    const ctx = node.getContext('2d');
    if (!ctx) return;

    const size = options.size || 400;
    node.width = size;
    node.height = size;

    // Legge gli stessi token CSS usati da slotMachineCanvas e dal CSS hover gradient
    const computed = getComputedStyle(document.documentElement);
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 128, g: 53, b: 210 };
    }

    const color1 = hexToRgb(computed.getPropertyValue('--archetipi-favorito').trim() || '#6a96df');
    const color2 = hexToRgb(computed.getPropertyValue('--archetipi-insoddisfatto').trim() || '#8035d2');
    const color3 = hexToRgb(computed.getPropertyValue('--archetipi-infortunato').trim() || '#d86146');

    const colors = [color1, color2, color3];

    // Stato per l'animazione rotante
    const state = { angle: 0 };
    let points = [];
    const MAX_POINTS = 240;
    let animating = true;
    let wobbleTime = 0;

    function getColorByAngle(angle) {
        const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const segment = (Math.PI * 2) / colors.length;
        const index = Math.floor(normalizedAngle / segment);
        const t = (normalizedAngle % segment) / segment;
        const nextIndex = (index + 1) % colors.length;

        const c1 = colors[index];
        const c2 = colors[nextIndex];

        return {
            r: Math.round(c1.r + (c2.r - c1.r) * t),
            g: Math.round(c1.g + (c2.g - c1.g) * t),
            b: Math.round(c1.b + (c2.b - c1.b) * t)
        };
    }

    function draw() {
        if (!animating) return;

        ctx.clearRect(0, 0, size, size);

        wobbleTime += 0.02;
        const wobbleRadius = 5;

        // Aggiungi nuovo punto
        if (points.length < MAX_POINTS) {
            const x = size / 2 + Math.cos(state.angle) * (size * 0.3);
            const y = size / 2 + Math.sin(state.angle) * (size * 0.3);
            points.push({ x, y, angle: state.angle });
        }

        // Muovi i punti verso l'esterno
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            const distFromCenter = Math.sqrt(Math.pow(p.x - size / 2, 2) + Math.pow(p.y - size / 2, 2));
            const maxDist = size * 0.48;
            const speed = 4;

            if (distFromCenter < maxDist) {
                const dx = (p.x - size / 2) / distFromCenter;
                const dy = (p.y - size / 2) / distFromCenter;
                const wobble = Math.sin(wobbleTime + i * 0.3) * wobbleRadius;

                p.x += dx * speed + wobble * 0.15;
                p.y += dy * speed + wobble * 0.15;
            }
        }

        // Rimuovi punti troppo vecchi
        if (points.length >= MAX_POINTS) {
            points.shift();
        }

        // Disegna i punti più grandi
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            const alpha = (i / points.length) * 0.9;
            const color = getColorByAngle(p.angle);
            const radius = 98 + (i / points.length) * 24;  // Punti più grandi

            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
            ctx.fill();
        }

        // Rotazione continua
        state.angle += 0.02;

        requestAnimationFrame(draw);
    }

    // Avvia l'animazione
    draw();

    return {
        destroy() {
            animating = false;
        }
    };
}
