import { gsap } from 'gsap';

/**
 * Action Svelte per l'effetto slot-machine "70% mentale" su Canvas con GSAP.
 * Il loop di disegno viene automaticamente messo in pausa quando la scheda
 * non è visibile (Visibility API), risparmiando GPU durante il background.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {{ onUpdateMask?: (url: string) => void }} [params]
 */
export function slotMachineCanvas(canvas, params = {}) {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	let rafId = 0;
	let destroyed = false;

	// Legge la dimensione font computata per adattarsi alla viewport corrente
	const computed = getComputedStyle(document.documentElement);
	/* Utilizza --text-xl poiché --text-hero è stato rimosso */
	const fontSizeStr = getComputedStyle(canvas).fontSize || computed.getPropertyValue('--text-xl') || '80px';

	let fontSize = parseFloat(fontSizeStr);
	if (fontSizeStr.includes('rem')) {
		fontSize = fontSize * parseFloat(getComputedStyle(document.documentElement).fontSize);
	}
	if (isNaN(fontSize) || fontSize <= 0) fontSize = 80;

	// Configura le dimensioni logiche e DPR del canvas per alta nitidezza su display Retina
	const dpr = window.devicePixelRatio || 1;
	const rowHeight = fontSize * 1.2;
	const charWidth = fontSize * 0.65;
	const logicalWidth = charWidth * 3.5 + fontSize * 3.5;
	const logicalHeight = rowHeight;

	canvas.width = logicalWidth * dpr;
	canvas.height = logicalHeight * dpr;
	canvas.style.width = `${logicalWidth}px`;
	canvas.style.height = `${logicalHeight}px`;
	ctx.scale(dpr, dpr);

	// Modello dati per le trasformazioni geometriche pilotate da GSAP
	const animData = {
		tensY: -fontSize * 0.4,
		onesY: -fontSize * 0.5,
		textX: -40,
		textOpacity: 0
	};

	const tl = gsap.timeline({ delay: 0.05 });
	tl.to(animData, { tensY: 0, duration: 0.55, ease: 'back.out(3.5)' }, 0);
	tl.to(animData, { onesY: 0, duration: 0.65, ease: 'back.out(4)' }, 0.05);
	tl.to(animData, { textX: 0, textOpacity: 1, duration: 0.6, ease: 'power2.out' }, 0.12);

	function draw() {
		// ctx è già verificato all'avvio, ma il type-checker non lo propaga automaticamente nelle closure
		if (!ctx) return;
		if (destroyed) return;

		ctx.clearRect(0, 0, logicalWidth, logicalHeight);
		ctx.fillStyle = '#000000';
		ctx.textBaseline = 'top';

		const yOffset = (logicalHeight - fontSize) / 2;

		// Decina "7" con effetto slot-machine verticale
		ctx.font = `700 ${fontSize}px 'Rethink Sans', sans-serif`;
		ctx.fillText('7', 0, yOffset + animData.tensY);

		// Unità "0"
		const onesX = charWidth * 0.9;
		ctx.fillText('0', onesX, yOffset + animData.onesY);

		// Simbolo "%"
		const percentX = onesX + charWidth * 0.9;
		ctx.fillText('%', percentX, yOffset);

		// Testo "mentale" con dissolvenza in entrata
		ctx.save();
		ctx.globalAlpha = animData.textOpacity;
		ctx.font = `700 ${fontSize}px 'Rethink Sans', sans-serif`;
		ctx.fillText('mentale', percentX + charWidth * 1.0 + 24 + animData.textX, yOffset);
		ctx.restore();

		// Esporta l'immagine come maschera CSS per il layer gradiente soprastante
		if (params.onUpdateMask) {
			params.onUpdateMask(`url(${canvas.toDataURL('image/png')})`);
		}

		rafId = requestAnimationFrame(draw);
	}

	// Mette in pausa il loop quando la scheda non è visibile per risparmiare GPU
	function onVisibilityChange() {
		if (document.hidden) {
			cancelAnimationFrame(rafId);
		} else if (!destroyed) {
			rafId = requestAnimationFrame(draw);
		}
	}

	document.addEventListener('visibilitychange', onVisibilityChange);
	rafId = requestAnimationFrame(draw);

	return {
		destroy() {
			destroyed = true;
			cancelAnimationFrame(rafId);
			document.removeEventListener('visibilitychange', onVisibilityChange);
			tl.kill();
		}
	};
}
