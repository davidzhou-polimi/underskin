import { gsap, ScrollTrigger } from '$lib/utils/gsapSetup.js';
import { scrollX } from '$lib/stores/scrollX.svelte.js';
import { BREAKPOINT } from '$lib/actions/scrollytelling/presets.js';

/**
 * Azione Svelte per la sequenza orizzontale della sezione Burnout: la scritta gigante
 * attraversa lo schermo spingendo via il primo blocco di testo e trascinando dentro il
 * secondo. Scrive il progresso su scrollX così il gradiente di sfondo reagisce al
 * movimento orizzontale (depth/parallax X del renderer).
 *
 * Solo desktop: su mobile la sezione usa il flusso verticale press-and-hold di
 * burnoutMobile.js e questo trigger non deve esistere.
 *
 * @param {HTMLElement} node - Il contenitore esterno della sezione (500vh, sticky interno)
 */
export function burnoutScroll(node) {
	const introEl = node.querySelector('.intro-wrapper');
	const outroEl = node.querySelector('.outro-wrapper');
	const marqueeEl = node.querySelector('.marquee-container');

	if (!introEl || !outroEl || !marqueeEl) return;

	const mm = gsap.matchMedia();

	mm.add(BREAKPOINT.desktop, () => {
		/** @param {number} progress */
		function apply(progress) {
			const scrollMultiplier = 520;
			const startOffset = 140;
			const tailOffset = 350;

			// La scritta parte fuori schermo a destra (startOffset vw) e attraversa lo schermo
			const burnoutPositionVw = startOffset - progress * scrollMultiplier;
			gsap.set(marqueeEl, { x: `${burnoutPositionVw}vw` });

			// Il primo blocco viene spinto via da sinistra man mano che la scritta lo raggiunge
			const introPush = Math.max(0, Math.min(1, (60 - burnoutPositionVw) / 90));
			gsap.set(introEl, {
				scale: 1 - introPush * 0.1,
				x: `${-introPush * 120}vw`,
				opacity: Math.max(0, Math.min(1, 1 - introPush * 1.15)),
				filter: `blur(${introPush * 10}px)`
			});

			// Il secondo blocco entra da destra agganciato alla coda della scritta e si
			// pianta al centro quando questa raggiunge il centro schermo
			const tailOfBurnout = burnoutPositionVw + tailOffset;
			const outroX = Math.max(0, tailOfBurnout);
			const outroOpacity = Math.max(0, Math.min(1, (60 - outroX) / 30));
			gsap.set(outroEl, {
				scale: 0.9 + outroOpacity * 0.1,
				x: `${outroX}vw`,
				opacity: outroOpacity,
				filter: `blur(${(1 - outroOpacity) * 8}px)`
			});
		}

		const trigger = ScrollTrigger.create({
			trigger: node,
			start: 'top top',
			end: 'bottom bottom',
			scrub: true,
			invalidateOnRefresh: true,
			onUpdate: (self) => {
				apply(self.progress);
				// Formula unica nello store: il gradiente legge scrollX in unità viewport
				scrollX.syncFromTrigger(self);
			}
		});

		// Stato iniziale coerente anche se il mount avviene a scroll già avvenuto (refresh/navigazione)
		apply(trigger.progress);
		scrollX.syncFromTrigger(trigger);

		return () => {
			trigger.kill();
			// Evita che un valore residuo continui a deformare il gradiente su altre rotte o su mobile
			scrollX.viewports = 0;
		};
	});

	return {
		destroy() {
			mm.revert();
		}
	};
}
