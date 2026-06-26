import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { tooltip } from '$lib/stores/tooltipState.svelte.js';

// Registrazione di ScrollTrigger, necessaria per i plugin GSAP in framework frontend
if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/**
 * @typedef {{ target: number, lines: string[] }} OutroStage
 */

/**
 * Azione Svelte per la sezione Outro: scrub-on-scroll del cerchio percentuale (0 → primo stadio)
 * e successivo avanzamento a click tra gli stadi. Possiede ScrollTrigger e tween — come da AGENTS.md
 * la logica GSAP vive qui, non nel componente — e pilota direttamente il DOM interno della sezione.
 *
 * @param {HTMLElement} node - La sezione `.outro-scroll-container`
 * @param {{ stages: OutroStage[] }} params - Stadi statistici (target % e righe descrittive)
 */
export function outroReveal(node, params) {
	const stages = params.stages;

	const revealCircleEl = node.querySelector('.reveal-circle');
	const percentageTextEl = node.querySelector('.circle-percentage');
	const descriptionTextEl = node.querySelector('.circle-description');
	const stageEl = node.querySelector('.circle-stage');

	let scrollPhaseComplete = false;
	let currentIndex = -1;
	let currentValue = 0;
	let isAnimating = false;

	const hasMoreStages = () => scrollPhaseComplete && currentIndex < stages.length - 1;

	// Gestiamo il ciclo di vita di tween e ScrollTrigger tramite un contesto dedicato per il cleanup automatico.
	const ctx = gsap.context(() => {}, node);

	// Commento solo il PERCHÉ: un'unica funzione di render evita di duplicare (con arrotondamenti divergenti)
	// la scrittura di percentuale e stroke-dasharray sparsa tra scrub, attivazione e avanzamento.
	/** @param {number} v */
	function renderValue(v) {
		if (percentageTextEl) percentageTextEl.textContent = `${Math.round(v)}%`;
		if (revealCircleEl) {
			revealCircleEl.setAttribute('stroke-dasharray', `${v.toFixed(2)} ${(100 - v).toFixed(2)}`);
		}
	}

	/** @param {string[]} lines */
	function updateDescription(lines) {
		if (!descriptionTextEl) return;
		descriptionTextEl.innerHTML = '';
		lines.forEach((line, i) => {
			const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
			tspan.setAttribute('x', '235.5');
			tspan.setAttribute('dy', i === 0 ? '0' : '1.3em');
			tspan.textContent = line;
			descriptionTextEl.appendChild(tspan);
		});
	}

	/** Aggancia la barra al target dello stadio 0, rivela la descrizione, abilita la modalità click */
	function activateScrollStage() {
		const t = stages[0].target;
		renderValue(t);
		currentValue = t;
		currentIndex = 0;
		scrollPhaseComplete = true;
		updateDescription(stages[0].lines);
		ctx.add(() => {
			if (descriptionTextEl) gsap.to(descriptionTextEl, { opacity: 1, duration: 0.3 });
		});
	}

	/** L'utente è tornato indietro: il controllo torna al tween di scrub */
	function resetScrollStage() {
		scrollPhaseComplete = false;
		currentIndex = -1;
		currentValue = 0;
		ctx.add(() => {
			if (descriptionTextEl) gsap.set(descriptionTextEl, { opacity: 0 });
		});
		tooltip.hide();
	}

	/** @param {number} stageIndex */
	function animateToStage(stageIndex) {
		if (isAnimating) return;
		isAnimating = true;

		const stage = stages[stageIndex];
		const fromValue = currentValue;

		ctx.add(() => {
			gsap.to(descriptionTextEl, {
				opacity: 0,
				duration: 0.3,
				onComplete: () => {
					updateDescription(stage.lines);
					if (descriptionTextEl) gsap.to(descriptionTextEl, { opacity: 1, duration: 0.3 });
				}
			});

			const obj = { value: fromValue };
			gsap.to(obj, {
				value: stage.target,
				duration: 1.2,
				ease: 'power1.out',
				onUpdate() {
					renderValue(obj.value);
				},
				onComplete() {
					currentValue = stage.target;
					currentIndex = stageIndex;
					isAnimating = false;
					// Ultimo stadio: rimuovi cursore e tooltip immediatamente
					if (stageIndex === stages.length - 1) tooltip.hide();
				}
			});
		});
	}

	function onClick() {
		if (!hasMoreStages() || isAnimating) return;
		animateToStage(currentIndex + 1);
	}

	/** @param {KeyboardEvent} e */
	function onKeydown(e) {
		if (e.key === 'Enter') onClick();
	}

	function onMouseEnter() {
		if (hasMoreStages()) tooltip.show('Click', 'semplice', 'pointer');
	}

	function onMouseLeave() {
		tooltip.hide();
	}

	// Stato iniziale del DOM
	renderValue(0);
	ctx.add(() => {
		if (descriptionTextEl) gsap.set(descriptionTextEl, { opacity: 0 });
	});

	// Scrub-on-scroll: .value scorre da 0 al target del primo stadio mentre la sezione entra
	ctx.add(() => {
		const scrollObj = { value: 0 };
		gsap.to(scrollObj, {
			value: stages[0].target,
			ease: 'none',
			onUpdate() {
				renderValue(scrollObj.value);
			},
			scrollTrigger: {
				trigger: node,
				start: 'top bottom', // parte appena la sezione entra dal basso
				end: 'top top', // finisce quando il cerchio è al centro = scena sticky
				scrub: 0.8,
				onUpdate(self) {
					// Commento solo il PERCHÉ: usare progress garantisce la transizione allo stato interattivo
					// non appena il cerchio si completa, evitando i ritardi dei callback onLeave su dispositivi reali.
					if (self.progress >= 0.99) {
						if (!scrollPhaseComplete) activateScrollStage();
					} else {
						if (scrollPhaseComplete) resetScrollStage();
					}
				}
			}
		});
	});

	if (stageEl) {
		stageEl.addEventListener('click', onClick);
		stageEl.addEventListener('keydown', /** @type {EventListener} */ (onKeydown));
		stageEl.addEventListener('mouseenter', onMouseEnter);
		stageEl.addEventListener('mouseleave', onMouseLeave);
	}

	return {
		destroy() {
			if (stageEl) {
				stageEl.removeEventListener('click', onClick);
				stageEl.removeEventListener('keydown', /** @type {EventListener} */ (onKeydown));
				stageEl.removeEventListener('mouseenter', onMouseEnter);
				stageEl.removeEventListener('mouseleave', onMouseLeave);
			}
			ctx.revert(); // revert() killa tween + ScrollTrigger del contesto
		}
	};
}
