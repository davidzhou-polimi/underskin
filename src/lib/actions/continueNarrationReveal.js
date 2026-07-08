import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';
import { getLenis } from '$lib/stores/lenis.svelte.js';

/**
 * Svelte Action: animazioni di ingresso della sezione "Continua a esplorare".
 *
 * - Fade-up leggero sul titolo (.continue-title) al trigger di scroll
 * - Entrance con slide-up + fade-in sul .action-container solo quando il fondo sezione tocca il
 *   fondo viewport (e uscita speculare risalendo); in vista il pulsante pulsa leggermente per
 *   invitare al tap — la navigazione avviene SOLO al click del Button (nessuno scroll-gate)
 * - onVisibilityChange(visible) notifica quando QUALSIASI parte della sezione è in viewport
 *   (trigger dedicato): riusato dal gradiente per restare invisibile per tutto il tempo in cui
 *   la sezione è visibile, non solo quando è interamente a schermo
 *
 * @param {HTMLElement} node - Elemento section padre
 * @param {{ onVisibilityChange?: (visible: boolean) => void }} [params]
 */
export function continueNarrationReveal(node, params = {}) {
	const { onVisibilityChange } = params;

	// containerEl è un div diretto → disponibile immediatamente
	// buttonEl è dentro Button.svelte (child component) → queryato lazily in showAction
	const containerEl = node.querySelector('.action-container');
	const titleEl = node.querySelector('.continue-title');
	/** @type {HTMLButtonElement | null} */
	let buttonEl = null;

	let isActionVisible = false;

	/** @type {gsap.core.Tween | null} */
	let idleTween = null;

	// FOUC prevention — OUTSIDE context
	// opacity:0 del container gestita via CSS in ContinueNarrationSection.svelte
	// qui impostiamo solo il transform iniziale (containerEl è sempre disponibile)
	if (containerEl) gsap.set(containerEl, { y: 24 });
	if (titleEl) gsap.set(titleEl, { y: 15, opacity: 0 });

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

	function showAction() {
		// lazy query scoped a containerEl: evita di trovare i bottoni interni alle ArchetypeCard
		if (!buttonEl) buttonEl = containerEl?.querySelector('button') ?? null;
		isActionVisible = true;
		gsap.to(containerEl, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
		startIdlePulse();
	}

	function hideAction() {
		if (!isActionVisible) return;
		isActionVisible = false;
		stopIdlePulse();
		if (buttonEl) gsap.set(buttonEl, { clearProps: 'transform' });
		gsap.to(containerEl, { y: 24, opacity: 0, duration: 0.3 });
	}

	function checkActionVisibility() {
		const rect = node.getBoundingClientRect();
		const atBottom = rect.bottom <= window.innerHeight + 2;
		if (atBottom && !isActionVisible) showAction();
		else if (!atBottom && isActionVisible) hideAction();
	}

	const lenis = getLenis();
	lenis?.on('scroll', checkActionVisibility);
	requestAnimationFrame(checkActionVisibility); // check su mount (page load già in sezione)

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

		// Commento solo il PERCHÉ: trigger dedicato alla visibilità della sezione, separato dalla
		// comparsa del bottone (che scatta solo a sezione interamente a schermo): il gradiente deve
		// restare invisibile per TUTTO il tempo in cui una parte qualsiasi della sezione è in viewport.
		// onToggle valuta anche lo stato iniziale: un reload già dentro la sezione parte corretto.
		if (onVisibilityChange) {
			ScrollTrigger.create({
				trigger: node,
				start: 'top bottom',
				end: 'bottom top',
				onToggle: (self) => onVisibilityChange(self.isActive)
			});
		}
	}, node);

	return {
		destroy() {
			lenis?.off('scroll', checkActionVisibility);
			stopIdlePulse();
			ctx.revert();
		}
	};
}
