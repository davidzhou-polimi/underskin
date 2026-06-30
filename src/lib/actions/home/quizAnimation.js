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
 * @property {(() => void)} lockScrollDown - Funzione per bloccare lo scroll verso il basso
 * @property {(() => void)} unlockScrollDown - Funzione per sbloccare lo scroll verso il basso
 * @property {((state: string) => void)} onStateChange - Callback per notificare il cambio di stato a Svelte
 * @property {((step: number) => void)} onStepChange - Callback per notificare il cambio di step a Svelte
 * @property {(() => void)} [onEnterBack] - Callback chiamata quando l'utente rientra nella sezione scrollando dall'alto
 */

/**
 * Action Svelte per orchestrare l'intero flusso di animazioni del Quiz.
 * @param {HTMLElement} node - Il wrapper della sezione del quiz
 * @param {QuizAnimationParams} params - I parametri iniziali di configurazione e le callback
 */
export function quizAnimation(node, params) {
	let { quizState, onStateChange, onStepChange, lockScroll, unlockScroll, lockScrollDown, unlockScrollDown } = params;
	/** @type {() => void} */
	let onEnterBack = params.onEnterBack ?? (() => {});
	
	let circlesTriggered = false;
	/** @type {gsap.core.Timeline | null} */
	let activeTimeline = null;

	const resetTrigger = ScrollTrigger.create({
		trigger: node,
		start: 'top bottom',
		onLeaveBack: () => {
			if (quizState === 'choosing') {
				circlesTriggered = false;
				// Commento solo il PERCHÉ: ripristina lo stato iniziale dei cerchi in modo invisibile solo quando la sezione è completamente uscita dallo schermo in basso
				gsap.set(node.querySelectorAll('.circle-container'), { opacity: 0, y: 50, scale: 0.8 });
			}
		}
	});

	const pinTrigger = ScrollTrigger.create({
		trigger: node,
		start: 'top top',
		end: '+=100%',
		pin: true,
		pinSpacing: true,
		// Riattivazione da sotto: l'utente torna scrollando dalla sezione successiva
		onEnterBack: () => { onEnterBack(); },
		onToggle: (self) => {
			if (self.isActive && !circlesTriggered && quizState === 'choosing') {
				circlesTriggered = true;
				gsap.fromTo(node.querySelectorAll('.circle-container'),
					{ opacity: 0, y: 50, scale: 0.8 },
					{ opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out', stagger: 0.15 }
				);
			}

			// Commento solo il PERCHÉ: notifica Svelte per ripristinare il blocco dello scroll all'attivazione del pin (in ingresso sia da sopra che da sotto)
			if (self.isActive) {
				onEnterBack();
			}

			// Blocca lo scroll verso il basso solo finché l'utente non ha scelto
			if (self.isActive && quizState === 'choosing') lockScrollDown();
			if (!self.isActive) unlockScrollDown();
		}
	});

	/**
	 * Aggiunge la fase comune a entrambi gli scenari:
	 * fisico esce a destra, mentale si rivela con "70%", si riposiziona e il text-panel appare.
	 * @param {gsap.core.Timeline} tl
	 * @param {number | string} startAt - posizione di inizio (0 per caso A, '>' per dopo step B)
	 */
	function addMentalePhase(tl, startAt = '>') {
		tl.addLabel('_mp', startAt);

		// fisico esce a destra + mentale si ingrandisce (simultanei)
		tl.to(node.querySelector('.circle-container.right-side'),
			{ x: 500, opacity: 0, duration: 0.6, ease: 'power2.inOut' }, '_mp');
		tl.to(node.querySelector('.circle-container.left-side'),
			{ x: 0, scale: 2.0, duration: 0.8, ease: 'power3.out' }, '_mp');

		// "mentale" sfuma mentre il cerchio si espande
		tl.to(node.querySelector('.left-side .initial-label'),
			{ opacity: 0, duration: 0.2, ease: 'power2.in' }, '_mp+=0.15');

		// "70% mentale" appare durante l'ingrandimento
		tl.fromTo(node.querySelector('.left-side .percentage-text'),
			{ opacity: 0, scale: 0.85 },
			{ opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' },
			'_mp+=0.3');

		// dopo pausa il cerchio si sposta a sinistra per formare il gruppo centrato
		// Commento solo il PERCHÉ: allinea il valore di fine corsa dell'animazione GSAP alla coordinata della classe CSS is-final per evitare microscatti al cambio di stato
		tl.to(node.querySelector('.circle-container.left-side'),
			{ x: -40, scale: 1.5, duration: 0.7, ease: 'power2.inOut' }, '+=0.35');

		// text-panel entra da destra
		tl.fromTo(node.querySelector('.text-panel'),
			{ opacity: 0, x: 60 },
			{ opacity: 1, x: 0, duration: 0.55, ease: 'power2.out' }, '-=0.25');
	}

	/**
	 * @param {string} side - 'mentale' | 'fisico'
	 */
	function triggerSelectionAnimation(side) {
		if (quizState !== 'choosing') return;

		// Commento solo il PERCHÉ: verifichiamo la presenza del quiz-body PRIMA di mutare lo stato e bloccare lo scroll,
		// così un'uscita anticipata non lascia la pagina bloccata senza la corrispondente unlockScroll().
		const quizBody = node.querySelector('.quiz-body');
		if (!quizBody) return;

		quizState = 'animating';
		onStateChange('animating');
		unlockScrollDown();
		lockScroll();

		// Calcola lo spostamento Y necessario a centrare il quiz-body nella viewport
		// una volta che il titolo sparisce: attualmente il flex centra titolo + quiz-body
		// insieme, quindi il quiz-body risulta sotto il centro ottico del viewport.
		const bodyBounds = quizBody.getBoundingClientRect();
		const yShift = Math.round(window.innerHeight / 2 - (bodyBounds.top + bodyBounds.height / 2));

		activeTimeline = gsap.timeline({
			onComplete: () => {
				quizState = 'results';
				onStateChange('results');
			}
		});

		// fade out del titolo + quiz-body sale al centro del viewport in sincronia
		activeTimeline.to(node.querySelector('.quiz-title-wrap'), {
			opacity: 0,
			y: -60,
			duration: 0.5,
			ease: 'power2.in'
		}, 0);
		activeTimeline.to(quizBody, {
			y: yShift,
			duration: 0.6,
			ease: 'power2.inOut'
		}, 0);

		if (side === 'mentale') {
			// --- SCENARIO A: l'utente seleziona mentale ---
			// La fase mentale parte da posizione 0 (in parallelo al fade del titolo)
			addMentalePhase(activeTimeline, 0);

		} else {
			// --- SCENARIO B: l'utente seleziona fisico ---

			// STEP 1: fisico si ingrandisce di poco + cambio testo in simultanea
			// Il cerchio mentale rimane fermo
			activeTimeline.to(node.querySelector('.circle-container.right-side'),
				{ scale: 1.25, duration: 0.5, ease: 'power2.out' }, 0);
			activeTimeline.to(node.querySelector('.right-side .initial-label'),
				{ opacity: 0, duration: 0.2, ease: 'power2.in' }, 0.1);
			activeTimeline.fromTo(node.querySelector('.right-side .percentage-text'),
				{ opacity: 0, scale: 0.9 },
				{ opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' }, 0.2);

			// STEP 2: fisico torna alla grandezza iniziale (con "30% fisico" ancora visibile)
			activeTimeline.to(node.querySelector('.circle-container.right-side'),
				{ scale: 1.0, duration: 0.45, ease: 'power2.inOut' }, '+=0.3');

			// STEP 3: stessa animazione del caso mentale — inizia subito dopo lo step 2
			addMentalePhase(activeTimeline);
		}
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
			lockScrollDown = newParams.lockScrollDown;
			unlockScrollDown = newParams.unlockScrollDown;
			onStateChange = newParams.onStateChange;
			onStepChange = newParams.onStepChange;
			onEnterBack = newParams.onEnterBack ?? (() => {});
		},
		destroy() {
			node.removeEventListener('click', handleBtnClick);
			unlockScrollDown();
			if (pinTrigger) pinTrigger.kill();
			if (resetTrigger) resetTrigger.kill();
			if (activeTimeline) activeTimeline.kill();
		}
	};
}

/**
 * Anima la transizione tra lo step 1 e lo step 2 del quiz.
 * @param {number} targetStep - Lo step di destinazione (1 o 2)
 * @param {Object} callbacks
 * @param {() => void} callbacks.onStepChange - Callback per aggiornare lo stato di Svelte nel momento esatto tra le due animazioni
 * @param {() => void} [callbacks.onComplete] - Callback invocata al completamento dell'animazione
 */
export function animateQuizStep(targetStep, { onStepChange, onComplete = () => {} }) {
	// Commento solo il PERCHÉ: gsap.timeline orchestra l'animazione sequenziale (fade-out del vecchio step, cambio stato Svelte tramite callback, fade-in del nuovo step con sfocatura)
	if (targetStep === 2) {
		gsap.set('.step-2', { opacity: 0, y: 20, filter: 'blur(10px)' });
		gsap.timeline({ onComplete })
			.to('.step-1', { opacity: 0, y: -20, filter: 'blur(10px)', duration: 0.4, ease: 'power2.in' })
			.add(() => { onStepChange(); })
			.to('.step-2', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' });
	} else if (targetStep === 1) {
		gsap.set('.step-1', { opacity: 0, y: -20, filter: 'blur(10px)' });
		gsap.timeline({ onComplete })
			.to('.step-2', { opacity: 0, y: 20, filter: 'blur(10px)', duration: 0.4, ease: 'power2.in' })
			.add(() => { onStepChange(); })
			.to('.step-1', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' });
	}
}