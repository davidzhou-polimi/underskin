import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/**
 * @typedef {Object} QuizAnimationParams
 * @property {string} quizState - Lo stato reattivo del quiz ('choosing' | 'animating' | 'results')
 * @property {(() => void)} lockScroll - Funzione per bloccare lo scroll della pagina
 * @property {(() => void)} unlockScroll - Funzione per sbloccare lo scroll della pagina
 * @property {((state: string) => void)} onStateChange - Callback per notificare il cambio di stato a Svelte
 * @property {((step: number) => void)} onStepChange - Callback per notificare il cambio di step a Svelte
 */

/**
 * Action Svelte per orchestrare l'intero flusso di animazioni del Quiz.
 * @param {HTMLElement} node - Il wrapper della sezione del quiz
 * @param {QuizAnimationParams} params - I parametri iniziali di configurazione e le callback
 */
export function quizAnimation(node, params) {
	let { quizState, onStateChange, onStepChange, lockScroll, unlockScroll } = params;
	
	let circlesTriggered = false;
	/** @type {gsap.core.Timeline | null} */
	let activeTimeline = null;

	const pinTrigger = ScrollTrigger.create({
		trigger: node,
		start: 'top top',
		end: '+=100%',
		pin: true,
		pinSpacing: true,
		onToggle: (self) => {
			if (!self.isActive && self.progress === 0 && quizState === 'choosing') {
				circlesTriggered = false;
				gsap.set(node.querySelectorAll('.circle-container'), { opacity: 0, y: 50, scale: 0.8 });
			}

			if (self.isActive && !circlesTriggered && quizState === 'choosing') {
				circlesTriggered = true;
				gsap.fromTo(node.querySelectorAll('.circle-container'), 
					{ opacity: 0, y: 50, scale: 0.8 },
					{ opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out', stagger: 0.15 }
				);
			}
		}
	});

	/**
	 * @param {string} side - 'mentale' | 'fisico'
	 */
	function triggerSelectionAnimation(side) {
		if (quizState !== 'choosing') return;
		
		quizState = 'animating';
		onStateChange('animating');
		lockScroll();

		activeTimeline = gsap.timeline({
			onComplete: () => {
				quizState = 'results';
				onStateChange('results');
			}
		});

		activeTimeline.to(node.querySelector('.quiz-title-wrap'), { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' }, 0);

		if (side === 'mentale') {
			// --- SCENARIO A ---

			// STEP 1: tutto simultaneo — fisico esce a destra, mentale si ingrandisce E il testo cambia mentre cresce
			activeTimeline.to(node.querySelector('.circle-container.right-side'), { x: 500, opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 0);
			activeTimeline.to(node.querySelector('.circle-container.left-side'), { x: 0, scale: 2.0, duration: 0.8, ease: 'power3.out' }, 0);
			// Il testo "mentale" sfuma mentre il cerchio si espande
			activeTimeline.to(node.querySelector('.left-side .initial-label'), { opacity: 0, duration: 0.2, ease: 'power2.in' }, 0.15);
			// "70% mentale" appare durante l'ingrandimento (il cerchio è già grande e lo contiene)
			activeTimeline.fromTo(
				node.querySelector('.left-side .percentage-text'),
				{ opacity: 0, scale: 0.85 },
				{ opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' },
				0.3
			);

			// STEP 2: dopo una pausa, il cerchio si sposta a sinistra per formare il gruppo centrato
			activeTimeline.to(
				node.querySelector('.circle-container.left-side'),
				{ x: -80, scale: 1.5, duration: 0.7, ease: 'power2.inOut' },
				'+=0.35'
			);

		} else {
			// --- SCENARIO B ---

			// STEP 1: tutto simultaneo — il cerchio fisico si ingrandisce sul posto, il testo cambia mentre cresce
			// Il cerchio mentale (sinistra) rimane visibile e fermo, nessuna animazione su di esso
			activeTimeline.to(node.querySelector('.circle-container.right-side'), {
				x: 0, scale: 2.0, duration: 0.8, ease: 'power3.out'
			}, 0);
			// Il testo "fisico" sfuma mentre il cerchio si espande
			activeTimeline.to(node.querySelector('.right-side .initial-label'), {
				opacity: 0, duration: 0.2, ease: 'power2.in'
			}, 0.15);
			// "30% fisico" appare durante l'ingrandimento
			activeTimeline.fromTo(
				node.querySelector('.right-side .percentage-text'),
				{ opacity: 0, scale: 0.85 },
				{ opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' },
				0.3
			);

			// TODO: step 2 — riposizionamento cerchi e step 3 — text panel da definire con l'utente
		}

		// STEP 3: text-panel appare a destra del cerchio (entra da destra verso la posizione di gruppo centrato)
		activeTimeline.fromTo(node.querySelector('.text-panel'),
			{ opacity: 0, x: 60 },
			{ opacity: 1, x: 0, duration: 0.55, ease: 'power2.out' },
			'-=0.25'
		);
	}

	/**
	 * @param {Event} e
	 */
	function handleBtnClick(e) {
		const targetEl = /** @type {HTMLElement} */ (e.target);
		const btn = targetEl.closest('.interactive-circle-btn');
		if (!btn || quizState !== 'choosing') return;
		
		const container = btn.closest('.circle-container');
		if (!container) return;

		if (container.classList.contains('left-side')) {
			triggerSelectionAnimation('mentale');
		} else if (container.classList.contains('right-side')) {
			triggerSelectionAnimation('fisico');
		}
	}

	node.addEventListener('click', handleBtnClick);

	return {
		/**
		 * @param {QuizAnimationParams} newParams
		 */
		update(newParams) {
			quizState = newParams.quizState;
			lockScroll = newParams.lockScroll;
			unlockScroll = newParams.unlockScroll;
			onStateChange = newParams.onStateChange;
			onStepChange = newParams.onStepChange;
		},
		destroy() {
			node.removeEventListener('click', handleBtnClick);
			if (pinTrigger) pinTrigger.kill();
			if (activeTimeline) activeTimeline.kill();
		}
	};
}