import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { getLenis } from '$lib/stores/lenis.svelte.js';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/** @param {string} cssVar */
function resolveTokenRGB(cssVar) {
	const el = document.createElement('div');
	el.style.cssText = 'position:fixed;top:-9999px;width:1px;height:1px;';
	el.style.backgroundColor = `var(${cssVar})`;
	document.body.appendChild(el);
	const parts = getComputedStyle(el).backgroundColor.match(/[\d.]+/g) ?? ['0', '0', '0'];
	document.body.removeChild(el);
	return [+parts[0], +parts[1], +parts[2]];
}

/**
 * Svelte Action: animazioni di ingresso + scroll-gate verso la home.
 *
 * - Fade-up leggero sul titolo (.continue-title) al trigger di scroll
 * - Entrance con slide-up + fade-in sul .action-container solo quando il fondo sezione tocca il fondo viewport
 * - In idle (gate attivo, nessuno scroll) il pulsante pulsa leggermente per invitare all'interazione
 * - Scroll continuo verso il basso → il pulsante comunica un effetto di "pulling" verso la conclusione:
 *   sfondo che si riempie (neutral-100 / alpha 0.6 → neutral-200 / alpha 1.0), leggero abbassamento (pull),
 *   crescita di scala (tensione) e glow che si intensifica, tutti proporzionali allo scroll accumulato;
 *   se l'utente smette di scrollare tutti questi effetti decadono gradualmente insieme
 * - Al 100% del fill: pop di conferma sul pulsante, poi un ulteriore scroll naviga via params.onNavigate()
 * - Scroll verso l'alto in qualsiasi momento → reset completo dello stato del gate
 *
 * @param {HTMLElement} node - Elemento section padre
 * @param {{ onNavigate?: () => void, threshold?: number }} [params]
 */
export function scrollHomeGate(node, params = {}) {
	const { onNavigate, threshold = 1000 } = params;

	let finalThreshold = threshold;

	// Commento solo il PERCHÉ: riduce la soglia di scorrimento necessaria su mobile per rendere 
	// meno faticoso il caricamento del gate tramite swipe consecutivi.
	const mm = gsap.matchMedia();
	mm.add("(max-width: 768px)", () => {
		finalThreshold = 400;
	});
	mm.add("(min-width: 769px)", () => {
		finalThreshold = threshold;
	});

	// containerEl è un div diretto → disponibile immediatamente
	// buttonEl è dentro Button.svelte (child component) → queryato lazily in activateGate
	const containerEl = node.querySelector('.action-container');
	const titleEl = node.querySelector('.continue-title');
	/** @type {HTMLButtonElement | null} */
	let buttonEl = null;
	/** @type {Function | null} */
	let bgSetter = null;
	/** @type {Function | null} */
	let pullSetter = null;
	/** @type {Function | null} */
	let scaleSetter = null;
	/** @type {Function | null} */
	let glowSetter = null;

	const [r100, g100, b100] = resolveTokenRGB('--neutral-100');
	const [r200, g200, b200] = resolveTokenRGB('--neutral-200');

	let accumulated = 0;
	let isGateActive = false;
	let gateReady = false; // finestra di 300ms dopo activateGate, per ignorare il momentum residuo di Lenis
	let maxReached = false;
	let navReady = false;
	let hasNavigated = false;
	let touchStartY = 0;

	/** @type {gsap.core.Tween | null} */
	let decayDelay = null;
	/** @type {gsap.core.Tween | null} */
	let decayTween = null;
	/** @type {gsap.core.Tween | null} */
	let gateReadyDelay = null;
	/** @type {gsap.core.Tween | null} */
	let navReadyDelay = null;
	/** @type {gsap.core.Timeline | null} */
	let popTween = null;
	/** @type {gsap.core.Tween | null} */
	let idleTween = null;

	// FOUC prevention — OUTSIDE context
	// opacity:0 del container gestita via CSS in ContinueNarrationSection.svelte
	// qui impostiamo solo il transform iniziale (containerEl è sempre disponibile)
	if (containerEl) gsap.set(containerEl, { y: 24 });
	if (titleEl) gsap.set(titleEl, { y: 15, opacity: 0 });

	function triggerNav() {
		if (hasNavigated) return;
		hasNavigated = true;
		deactivateGate();
		onNavigate?.();
	}

	function startIdlePulse() {
		if (idleTween || !buttonEl) return;
		idleTween = gsap.to(buttonEl, {
			scale: 1.015,
			duration: 1.1,
			ease: 'sine.inOut',
			yoyo: true,
			repeat: -1
		});
	}

	function stopIdlePulse() {
		idleTween?.kill();
		idleTween = null;
	}

	/** @param {number} progress */
	function updateButtonFeel(progress) {
		const alpha = 0.6 + progress * 0.4;
		const r = Math.round(r100 + (r200 - r100) * progress);
		const g = Math.round(g100 + (g200 - g100) * progress);
		const b = Math.round(b100 + (b200 - b100) * progress);
		bgSetter?.(`rgba(${r}, ${g}, ${b}, ${alpha})`);
		pullSetter?.(progress * 6);
		scaleSetter?.(1 + progress * 0.05);
		glowSetter?.(`0 0 ${4 + progress * 16}px rgba(${r200}, ${g200}, ${b200}, ${0.15 + progress * 0.35})`);
	}

	function startDecay() {
		decayDelay = null;
		if (accumulated <= 0) return;
		const proxy = { v: accumulated };
		decayTween = gsap.to(proxy, {
			v: 0,
			duration: Math.min(accumulated / finalThreshold, 1) * 1.5,
			ease: 'power2.out',
			onUpdate() {
				accumulated = proxy.v;
				updateButtonFeel(proxy.v / finalThreshold);
			},
			onComplete() {
				accumulated = 0;
				decayTween = null;
				if (buttonEl) gsap.set(buttonEl, { clearProps: 'backgroundColor,transform,boxShadow' });
				startIdlePulse();
			}
		});
	}

	function playPopAnimation() {
		popTween?.kill();
		popTween = gsap.timeline({ onComplete: () => { popTween = null; } })
			.to(buttonEl, { scale: 1.04, duration: 0.1, ease: 'power2.out' })
			.to(buttonEl, { scale: 1, duration: 0.22, ease: 'back.out(2)' });
	}

	/** @param {number} deltaY */
	function updateScrollProgress(deltaY) {
		// al massimo: scroll ignorato finché non si apre la finestra navReady, poi naviga
		if (maxReached) {
			if (navReady) triggerNav();
			return;
		}

		// un nuovo scroll verso il basso interrompe il decay in corso
		decayDelay?.kill();
		decayTween?.kill();
		decayDelay = null;
		decayTween = null;

		// primo scroll utile dopo l'idle: ferma il breathing pulse senza salti visivi
		if (accumulated === 0) {
			stopIdlePulse();
			if (buttonEl) gsap.set(buttonEl, { scale: 1 });
		}

		accumulated = Math.min(accumulated + deltaY, finalThreshold);
		const progress = accumulated / finalThreshold;
		updateButtonFeel(progress);

		if (progress >= 1) {
			maxReached = true;
			navReady = false;
			navReadyDelay = gsap.delayedCall(0.3, () => { navReady = true; navReadyDelay = null; });
			playPopAnimation();
			return; // niente decay: lo stato resta al massimo finché l'utente non naviga o risale
		}

		decayDelay = gsap.delayedCall(0.4, startDecay);
	}

	/** @param {WheelEvent} e */
	function onWheelGate(e) {
		if (!isGateActive || !gateReady) return;
		if (e.deltaY <= 0) return; // upward: passa a Lenis → scrolla su → checkGate deactivate (reset completo)
		e.preventDefault();
		e.stopPropagation();
		updateScrollProgress(e.deltaY);
	}

	/** @param {TouchEvent} e */
	function onTouchStartGate(e) {
		touchStartY = e.touches[0].clientY;
	}

	/** @param {TouchEvent} e */
	function onTouchMoveGate(e) {
		if (!isGateActive || !gateReady) return;
		const delta = touchStartY - e.touches[0].clientY;
		touchStartY = e.touches[0].clientY;
		if (delta <= 0) return; // upward: passa a Lenis
		e.preventDefault();
		e.stopPropagation();
		updateScrollProgress(delta);
	}

	function activateGate() {
		// lazy query scoped a containerEl: evita di trovare i bottoni interni alle ArchetypeCard
		if (!buttonEl) {
			buttonEl = containerEl?.querySelector('button') ?? null;
			if (buttonEl) {
				bgSetter = gsap.quickSetter(buttonEl, 'backgroundColor');
				pullSetter = gsap.quickTo(buttonEl, 'y', { duration: 0.3, ease: 'power2.out' });
				scaleSetter = gsap.quickTo(buttonEl, 'scale', { duration: 0.3, ease: 'power2.out' });
				glowSetter = gsap.quickSetter(buttonEl, 'boxShadow');
				// la transition CSS su background-color (Button.svelte) confligge con quickSetter per-frame
				buttonEl.style.setProperty('transition', 'none');
			}
		}
		isGateActive = true;
		gateReady = false;
		gateReadyDelay = gsap.delayedCall(0.3, () => { gateReady = true; gateReadyDelay = null; });
		gsap.to(containerEl, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
		startIdlePulse();
		// capture:true intercetta prima che Lenis (bubble) veda l'evento
		window.addEventListener('wheel', onWheelGate, { passive: false, capture: true });
		window.addEventListener('touchstart', onTouchStartGate, { passive: true, capture: true });
		window.addEventListener('touchmove', onTouchMoveGate, { passive: false, capture: true });
	}

	function deactivateGate() {
		if (!isGateActive) return;
		isGateActive = false;
		gateReady = false;
		maxReached = false;
		navReady = false;
		accumulated = 0;
		gateReadyDelay?.kill();
		navReadyDelay?.kill();
		decayDelay?.kill();
		decayTween?.kill();
		popTween?.kill();
		gateReadyDelay = navReadyDelay = decayDelay = decayTween = popTween = null;
		stopIdlePulse();
		if (buttonEl) {
			gsap.set(buttonEl, { clearProps: 'backgroundColor,transform,boxShadow' });
			buttonEl.style.removeProperty('transition');
		}
		gsap.to(containerEl, { y: 24, opacity: 0, duration: 0.3 });
		window.removeEventListener('wheel', onWheelGate, { capture: true });
		window.removeEventListener('touchstart', onTouchStartGate, { capture: true });
		window.removeEventListener('touchmove', onTouchMoveGate, { capture: true });
	}

	function checkGate() {
		if (hasNavigated) return;
		const rect = node.getBoundingClientRect();
		const atBottom = rect.bottom <= window.innerHeight + 2;
		if (atBottom && !isGateActive) activateGate();
		else if (!atBottom && isGateActive) deactivateGate();
	}

	const lenis = getLenis();
	lenis?.on('scroll', checkGate);
	requestAnimationFrame(checkGate); // check su mount (page load già in sezione)

	const ctx = gsap.context(() => {
		if (titleEl) {
			gsap.to(titleEl, {
				scrollTrigger: {
					trigger: titleEl,
					start: 'top 85%',
					// reverse su onLeaveBack: resetta il tween quando Lenis porta in cima alla pagina,
					// così l'animazione si riproduce correttamente al prossimo scroll verso il basso
					toggleActions: 'play none none reverse',
					invalidateOnRefresh: true
				},
				y: 0,
				opacity: 1,
				duration: 0.6,
				ease: 'power2.out'
			});
		}
	}, node);

	return {
		destroy() {
			lenis?.off('scroll', checkGate);
			deactivateGate();
			ctx.revert();
			mm.revert();
		}
	};
}
