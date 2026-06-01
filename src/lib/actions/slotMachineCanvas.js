import { gsap } from 'gsap';

/**
 * Action Svelte per gestire l'effetto slot-machine 70% mentale su Canvas con GSAP.
 * Ottimizza le performance separando il loop di disegno e GSAP dallo stato principale del componente.
 * 
 * @param {HTMLCanvasElement} canvas 
 * @param {{ onUpdateMask: (url: string) => void }} params 
 */
export function slotMachineCanvas(canvas, params = {}) {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;
	
	let animationFrameId;

	// 1. Estrae la dimensione font computata per la viewport
	const computed = getComputedStyle(document.documentElement);
	const heroFontSizeStr = getComputedStyle(canvas).fontSize || computed.getPropertyValue('--text-hero') || '80px';
	
	let fontSize = parseFloat(heroFontSizeStr);
	if (heroFontSizeStr.includes('rem')) {
		fontSize = fontSize * parseFloat(getComputedStyle(document.documentElement).fontSize);
	}
	if (isNaN(fontSize) || fontSize <= 0) fontSize = 80;

	// 2. Configura le dimensioni logiche e DPR del canvas per alta nitidezza
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

	// 3. Modello dati per le trasformazioni geometriche gestite da GSAP
	const animData = { 
		tensY: -fontSize * 0.4,
		onesY: -fontSize * 0.5,
		textX: -40,
		textOpacity: 0
	};

	// 4. Innesca l'animazione traslazionale GSAP
	const tl = gsap.timeline({ delay: 0.05 });

	tl.to(animData, {
		tensY: 0,
		duration: 0.55,
		ease: 'back.out(3.5)'
	}, 0);

	tl.to(animData, {
		onesY: 0,
		duration: 0.65,
		ease: 'back.out(4)'
	}, 0.05);

	tl.to(animData, {
		textX: 0,
		textOpacity: 1,
		duration: 0.6,
		ease: 'power2.out'
	}, 0.12);

	// 5. Ciclo continuo di disegno su canvas
	function draw() {
		if (!ctx) return;
		ctx.clearRect(0, 0, logicalWidth, logicalHeight);

		// Disegna caratteri neri coprenti per la maschera CSS
		ctx.fillStyle = '#000000';
		ctx.textBaseline = 'top';

		const yOffset = (logicalHeight - fontSize) / 2;

		// A. Decina "7"
		ctx.font = `700 ${fontSize}px 'Rethink Sans', sans-serif`;
		ctx.fillText('7', 0, yOffset + animData.tensY);

		// B. Unità "0"
		const onesX = charWidth * 0.9;
		ctx.fillText('0', onesX, yOffset + animData.onesY);

		// C. Percentuale "%"
		const percentX = onesX + charWidth * 0.9;
		ctx.fillText('%', percentX, yOffset);

		// D. Testo "mentale" spinto verso destra
		ctx.save();
		const baseTextX = percentX + charWidth * 1.0 + 24; 
		
		ctx.globalAlpha = animData.textOpacity;
		ctx.font = `700 ${fontSize}px 'Rethink Sans', sans-serif`;
		
		ctx.fillText('mentale', baseTextX + animData.textX, yOffset);
		ctx.restore();

		// Ritorna l'immagine in Base64 via callback al componente genitore
		if (params.onUpdateMask) {
			params.onUpdateMask(`url(${canvas.toDataURL('image/png')})`);
		}

		animationFrameId = requestAnimationFrame(draw);
	}

	draw();

	return {
		destroy() {
			cancelAnimationFrame(animationFrameId);
			tl.kill();
		}
	};
}
