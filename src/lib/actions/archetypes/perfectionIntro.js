import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { getLenis, lockScrollDown, unlockScrollDown } from '$lib/stores/lenis.svelte.js';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/**
 * Svelte Action per gestire l'animazione di entrata e i trigger di scroll del Perfection Game.
 * Prende ispirazione diretta da thoughtsIntro.js per garantire consistenza e assenza di rimbalzi.
 *
 * @param {HTMLElement} node Il contenitore della sezione
 * @param {Object} params Parametri di configurazione
 * @param {(val: boolean) => void} params.onIntroChange Callback per notificare il cambiamento dello stato dell'intro
 * @param {() => void} params.onReset Callback per resettare lo stato dell'intro
 * @param {boolean} [params.hasCompletedOnce] Indica se l'utente ha già giocato almeno un tentativo
 */
export function perfectionIntro(node, params) {
	const { onIntroChange, onReset } = params;
	let hasCompletedOnce = params.hasCompletedOnce ?? false;

	// Commento solo il PERCHÉ: blocco direzionale verso il basso mentre la sezione è in cima e l'utente non ha
	// ancora giocato; la risalita resta libera. Centralizzato nello store (listener capture, Lenis-aware).
	let downLocked = false;
	/** @param {boolean} active */
	function setDownLock(active) {
		if (active && !hasCompletedOnce) {
			if (!downLocked) {
				downLocked = true;
				lockScrollDown();
				getLenis()?.scrollTo(node, { immediate: true, force: true });
			}
		} else if (downLocked) {
			downLocked = false;
			unlockScrollDown();
		}
	}

	// Raggruppa i trigger in un contesto GSAP per consentire una rimozione pulita e sicura delle risorse
	const ctx = gsap.context(() => {
		const headerText = node.querySelector('.header-text');
		const targetCircle = node.querySelector('.target-circle');
		const blobWrapper = node.querySelector('.blob-wrapper');

		if (!headerText || !targetCircle || !blobWrapper) return;

		let introCompleted = false;
		/** @type {gsap.core.Timeline | null} */
		let activeTimeline = null;

		// Imposta lo stato iniziale (invisibile e spostato) per evitare flash grafici
		gsap.set([headerText, targetCircle, blobWrapper], { opacity: 0 });
		gsap.set(targetCircle, { scale: 0.8 });
		gsap.set(headerText, { y: 20 });

		// Primo ScrollTrigger: attiva l'entrata quando si scende e la sezione occupa il 75% della viewport
		ScrollTrigger.create({
			trigger: node,
			start: 'top 75%',
			onEnter: () => {
				if (introCompleted) return;

				if (activeTimeline) {
					activeTimeline.kill();
				}

				onIntroChange(false);

				activeTimeline = gsap.timeline({
					onComplete: () => {
						introCompleted = true;
						onIntroChange(true);
						activeTimeline = null;
					}
				});

				// Animazione coordinata ad alta fedeltà
				activeTimeline.to(headerText, {
					opacity: 1,
					y: 0,
					duration: 1.2,
					ease: 'power3.out'
				}, 0);

				activeTimeline.to(targetCircle, {
					opacity: 1,
					scale: 1,
					duration: 1.4,
					ease: 'back.out(1.2)'
				}, 0.2);

				activeTimeline.to(blobWrapper, {
					opacity: 1,
					duration: 1.2,
					ease: 'power2.out'
				}, 0.4);
			}
		});

		// Secondo ScrollTrigger: gestisce il reset e il rilascio dello scroll solo quando si risale quasi interamente (al 95%) verso la Hero
		// Questo crea la zona cuscinetto che immunizza il sistema dai micro-rimbalzi inerziali
		ScrollTrigger.create({
			trigger: node,
			start: 'top 95%',
			onLeaveBack: () => {
				introCompleted = false;

				if (activeTimeline) {
					activeTimeline.kill();
					activeTimeline = null;
				}

				onReset();

				// Commento solo il PERCHÉ: uccide i tween degli altri elementi e solo la proprietà opacity di blobWrapper per evitare di distruggere il tween di oscillazione x/scale del gioco
				gsap.killTweensOf([headerText, targetCircle]);
				gsap.killTweensOf(blobWrapper, 'opacity');

				// Ripristina istantaneamente lo stato iniziale nascosto
				gsap.set([headerText, targetCircle, blobWrapper], { opacity: 0 });
				gsap.set(targetCircle, { scale: 0.8 });
				gsap.set(headerText, { y: 20 });
			}
		});

		// Terzo ScrollTrigger: blocca lo scroll verso il basso quando la sezione è in cima alla viewport,
		// finché l'utente non ha giocato almeno un tentativo. La risalita resta sempre consentita.
		ScrollTrigger.create({
			trigger: node,
			start: 'top top',
			end: 'bottom top',
			onToggle: (self) => setDownLock(self.isActive)
		});

	}, node);

	return {
		/**
		 * @param {{ hasCompletedOnce?: boolean }} newParams
		 */
		update(newParams) {
			hasCompletedOnce = newParams.hasCompletedOnce ?? false;
			if (hasCompletedOnce) setDownLock(false);
		},
		destroy() {
			setDownLock(false);
			ctx.revert();
		}
	};
}
