import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/**
 * @typedef {{ target: number, lines: string[] }} OutroStage
 */

/**
 * Azione Svelte per la sezione Outro: scrollytelling discreto guidato da ScrollTrigger.
 * Lo scroll attiva il passaggio tra i vari stadi statistici, ma le animazioni del cerchio
 * e dei testi sono gestite da tween autonomi che si completano sempre sul valore esatto
 * dello stage, evitando che il cerchio si fermi su percentuali errate o intermedie.
 *
 * @param {HTMLElement} node - La sezione `.outro-scroll-container`
 * @param {{ stages: OutroStage[] }} params - Stadi statistici (target % e righe descrittive)
 */
export function outroReveal(node, params) {
	const stages = params.stages;

	const revealCircleEl = node.querySelector('.reveal-circle');
	const percentageTextEl = node.querySelector('.circle-percentage');
	const descriptionEls = node.querySelectorAll('.circle-description');

	let activeIndex = -1;
	/** @type {gsap.core.Tween | null} */
	let currentTween = null;
	/** @type {gsap.core.Tween[]} */
	let currentTextTweens = [];

	// Valore numerico corrente utilizzato come stato per il tween discreto del cerchio
	const animState = { value: 0 };

	// Commento solo il PERCHÉ: un'unica funzione di render evita di duplicare
	// la scrittura di percentuale e stroke-dasharray.
	/** @param {number} v */
	function renderValue(v) {
		if (percentageTextEl) percentageTextEl.textContent = `${Math.round(v)}%`;
		if (revealCircleEl) {
			revealCircleEl.setAttribute('stroke-dasharray', `${v.toFixed(2)} ${(100 - v).toFixed(2)}`);
		}
	}

	// Stato iniziale
	renderValue(0);

	/**
	 * Esegue una transizione fluida e discreta verso lo stage selezionato.
	 * Il cerchio e i testi si animano verso i valori esatti del target.
	 * 
	 * @param {number} targetIndex 
	 */
	function goToStage(targetIndex) {
		activeIndex = targetIndex;
		const stage = stages[targetIndex];

		// Commento solo il PERCHÉ: interrompe l'animazione del cerchio precedente per evitare
		// conflitti o sovrapposizioni se l'utente scrolla velocemente tra più stadi.
		if (currentTween) currentTween.kill();

		ctx.add(() => {
			currentTween = gsap.to(animState, {
				value: stage.target,
				duration: 0.5,
				ease: 'power2.out',
				onUpdate() {
					renderValue(animState.value);
				}
			});
		});

		// Commento solo il PERCHÉ: interrompe i vecchi fade dei testi in corso prima di avviarne di nuovi
		currentTextTweens.forEach(t => t.kill());
		currentTextTweens = [];

		ctx.add(() => {
			descriptionEls.forEach((el, idx) => {
				const targetOpacity = idx === targetIndex ? 1 : 0;
				
				// Commento solo il PERCHÉ: esegue un cross-fade rapido e pulito tra i testi degli stadi,
				// garantendo che solo il testo attivo sia visibile al 100% e gli altri a 0%.
				const t = gsap.to(el, {
					opacity: targetOpacity,
					duration: 0.25,
					ease: 'power1.out',
					overwrite: 'auto'
				});
				currentTextTweens.push(t);
			});
		});
	}

	/**
	 * Ripristina lo stato iniziale (0% e nessun testo visibile) quando l'utente
	 * esce dalla sezione verso l'alto, garantendo un ingresso pulito alla successiva visita.
	 */
	function resetToStart() {
		activeIndex = -1;

		if (currentTween) currentTween.kill();
		currentTextTweens.forEach(t => t.kill());
		currentTextTweens = [];

		ctx.add(() => {
			currentTween = gsap.to(animState, {
				value: 0,
				duration: 0.4,
				ease: 'power2.out',
				onUpdate() {
					renderValue(animState.value);
				}
			});

			descriptionEls.forEach((el) => {
				const t = gsap.to(el, {
					opacity: 0,
					duration: 0.2,
					ease: 'power1.out',
					overwrite: 'auto'
				});
				currentTextTweens.push(t);
			});
		});
	}

	// Gestiamo il ciclo di vita di tween e ScrollTrigger tramite un contesto dedicato per il cleanup automatico.
	const ctx = gsap.context(() => {
		ScrollTrigger.create({
			trigger: node,
			start: 'top top',
			end: 'bottom bottom',
			onLeaveBack: () => {
				resetToStart();
			},
			onUpdate: (self) => {
				const progress = self.progress;
				
				// Commento solo il PERCHÉ: se l'utente torna sopra l'inizio della sezione, 
				// resettiamo lo stato grafico a 0 anziché mantenere il primo stage attivo.
				if (progress <= 0) {
					resetToStart();
					return;
				}

				// Commento solo il PERCHÉ: mappa il progresso lineare dello scroll [0, 1] in zone discrete
				// proporzionali al numero di stadi, determinando quale statistica attivare.
				let index = Math.floor(progress * stages.length);
				if (index < 0) index = 0;
				if (index >= stages.length) index = stages.length - 1;

				if (index !== activeIndex) {
					goToStage(index);
				}
			}
		});
	}, node);

	return {
		destroy() {
			ctx.revert(); // revert() fa il kill di tutti i tween e ScrollTrigger registrati nel contesto
		}
	};
}
