<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { loadingOrbit } from '$lib/actions/loadingOrbit.js';
	import { loadingState } from '$lib/stores/loadingState.svelte.js';
	import { lockScroll, unlockScroll } from '$lib/stores/lenis.svelte.js';
	import { relativePathname } from '$lib/utils/routePath.js';

	// Durata minima perché l'orbita si legga come intenzionale, e cap massimo di sicurezza
	// (fallback se WebGL/font/rete restano appesi): oltre il cap si esce comunque.
	const MIN_MS = 1600;
	const MAX_MS = 7000;

	// Letto alla creazione dell'action (che gira prima di onMount): niente $state.
	const reducedMotion = browser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	let visible = $state(true);
	let outro = $state(false);

	// Commento solo il PERCHÉ: il reveal scopre il canvas del gradiente, quindi svelare prima che abbia
	// dipinto mostrerebbe un vuoto. Attendiamo il suo primo frame invece del vecchio gate su `window load`,
	// che aspettava OGNI asset eager (anche sotto la piega) e su mobile trascinava il loader verso il cap.
	// Il canvas persiste e potrebbe non avere ancora il renderer al mount: breve polling via rAF; il
	// timeout evita che un eventuale fallimento WebGL blocchi il loader oltre il necessario.
	/** @param {number} [timeoutMs] */
	function whenGradientReady(timeoutMs = 3000) {
		return new Promise((resolve) => {
			const started = performance.now();
			const tick = () => {
				const canvas = /** @type {any} */ (document.querySelector('.interactive-gradient-canvas'));
				const renderer = canvas?.__gradientRenderer;
				if (renderer?.firstFrame) {
					renderer.firstFrame.then(() => resolve(undefined));
					return;
				}
				if (performance.now() - started > timeoutMs) {
					resolve(undefined);
					return;
				}
				requestAnimationFrame(tick);
			};
			tick();
		});
	}

	// Su /about il reveal scopre subito le foto del team (sono l'unica immagine above-the-fold del
	// sito): alzare il velo prima che siano decodificate le farebbe comparire a scatti dopo il
	// loader. Attendere le <img> reali del DOM (non un preload di path) copre esattamente la
	// risoluzione che il browser ha scelto dallo srcset. Timeout proprio: una foto lenta non deve
	// trascinare il loader fino al cap globale.
	/** @param {number} [timeoutMs] */
	function whenAboutImagesReady(timeoutMs = 4500) {
		if (!relativePathname(page.url.pathname).startsWith('/about')) return Promise.resolve(undefined);
		const imgs = Array.from(document.querySelectorAll('.team-member-image'));
		if (imgs.length === 0) return Promise.resolve(undefined);
		const decoded = Promise.all(
			imgs.map((img) => /** @type {HTMLImageElement} */ (img).decode().catch(() => undefined))
		);
		return Promise.race([decoded, new Promise((r) => setTimeout(r, timeoutMs))]);
	}

	function onReveal() {
		// Sblocca l'entrata della pagina (es. introReveal) a metà del fade-out dell'overlay, in
		// overlap con la maschera che finisce di aprirsi: il timing esatto vive in loadingOrbit.js (REVEAL_AT).
		loadingState.complete = true;
	}

	function onDone() {
		visible = false;
		unlockScroll();
	}

	onMount(() => {
		lockScroll();
		const start = performance.now();

		/** @type {ReturnType<typeof setTimeout> | undefined} */
		let minTimer;
		const capTimer = setTimeout(() => (outro = true), MAX_MS);

		// "Pronto" = web font pronti E gradiente che ha dipinto il primo frame (ciò che il reveal scopre).
		const fonts = document.fonts ? document.fonts.ready : Promise.resolve();

		// document.fonts.ready da solo NON copre l'italic: un @font-face viene richiesto solo quando
		// un glifo che lo usa entra nel render tree, ma l'unico testo italic (il quote del quiz) è
		// display:none fino al suo step → il loader si alzerebbe senza attenderlo e lo swap avverrebbe
		// on-demand allo scroll. Forziamo qui la richiesta così che fonts.ready la includa.
		const italic = document.fonts
			? document.fonts.load('italic 400 1rem "Rethink Sans"').catch(() => undefined)
			: Promise.resolve();

		Promise.all([fonts, italic, whenGradientReady(), whenAboutImagesReady()]).then(() => {
			const wait = Math.max(0, MIN_MS - (performance.now() - start));
			minTimer = setTimeout(() => (outro = true), wait);
		});

		return () => {
			clearTimeout(capTimer);
			clearTimeout(minTimer);
		};
	});
</script>

{#if visible}
	<div
		class="loading-screen"
		aria-hidden="true"
		use:loadingOrbit={{ outro, onReveal, onDone, reducedMotion }}
	>
		<div class="loading-orbit">
			<span class="loading-light light-favorito"></span>
			<span class="loading-light light-insoddisfatto"></span>
			<span class="loading-light light-infortunato"></span>
		</div>
	</div>
{/if}

<style>
	.loading-screen {
		position: fixed;
		inset: 0;
		/* Sopra canvas (-1), navbar e tooltip: non esiste un token z-index, uso un literal alto
		   (come il canvas usa -1) per garantire che il velo copra tutto durante il caricamento. */
		z-index: 9999;
		background-color: var(--background-primary);
		overflow: hidden;
		/* Raggio dell'orbita: parametro d'animazione (non un token di design). Proporzionale alla
		   dimensione delle lucine (30px/48px = 0.625 sul desktop, invariato) così su mobile, dove
		   --spacing-6 scende a 32px, il raggio scala insieme e il gap resta in proporzione. GSAP lo
		   legge risolto in px dalla matrice computata delle lucine al takeover. */
		--orbit-radius: calc(var(--spacing-6) * 0.625);
	}

	/* L'orbita ruota in CSS (compositor) per TUTTA l'idle: si anima già dal frame prerenderizzato
	   e non congela mai — il main thread durante il caricamento è al massimo del carico
	   (hydration, prima draw WebGL del gradiente) e un'animazione guidata da JS lì si blocca coi
	   frame per poi recuperare il tempo in un colpo (salto avanti). GSAP prende il transform solo
	   all'outro (`is-collapsing`), a main thread quieto; all'hydration (`is-hydrated`) prende solo
	   le opacità delle lucine (il twinkle in keyframes CSS sfarfallava; quello GSAP originale no). */
	.loading-orbit {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		/* Promuove lo spin al compositor: durante il burst di hydration il main thread è bloccato
		   e senza layer la rotazione congela per poi "recuperare" in avanti al primo paint. */
		will-change: transform;
		animation: loading-orbit-spin 3.4s linear infinite;
	}

	.loading-light {
		position: absolute;
		top: 0;
		left: 0;
		width: var(--spacing-6);
		height: var(--spacing-6);
		/* Centra la lucina sull'origine dell'orbita: così l'origine di trasformazione coincide col
		   centro dell'orbita e rotate→translateY danno lo STESSO raggio per tutte (niente più raggi
		   diversi come col vecchio translate(-50%,-50%) applicato dentro il frame ruotato). */
		margin: calc(var(--spacing-6) / -2);
		border-radius: 50%;
		/* Base "accesa": l'accensione è la keyframe light-appear (0→1). */
		opacity: 1;
		/* Posizione orbitale: ruota alla propria fase (120° l'una dall'altra) e si allontana di
		   --orbit-radius. Il genitore .loading-orbit ruota l'intero gruppo. */
		transform: rotate(var(--angle, 0deg)) translateY(calc(var(--orbit-radius) * -1));
		/* Bordi non netti ("lucina"): il colore sfuma a trasparente prima del bordo; un lieve blur
		   aggiunge alone. Nessun token per il blur → literal minimo con questo commento. */
		filter: blur(3px);
		pointer-events: none;
		animation: light-appear 0.5s ease-out both;
	}

	.light-favorito {
		--angle: 0deg;
		background: radial-gradient(circle, var(--archetipi-favorito) 0%, transparent 68%);
	}

	.light-insoddisfatto {
		--angle: 120deg;
		background: radial-gradient(circle, var(--archetipi-insoddisfatto) 0%, transparent 68%);
		animation-delay: 0.08s;
	}

	.light-infortunato {
		--angle: 240deg;
		background: radial-gradient(circle, var(--archetipi-infortunato) 0%, transparent 68%);
		animation-delay: 0.16s;
	}

	/* Handoff opacità all'hydration: le CSS animation battono gli inline style, quindi la
	   light-appear (fill both) va spenta perché le opacity GSAP (fine accensione + twinkle)
	   abbiano effetto. Solo le lucine: lo spin dell'orbita resta in CSS fino all'outro.
	   `is-hydrated`/`is-collapsing` sono aggiunte a runtime dall'action (classList.add):
	   :global() evita che Svelte, non vedendole nel markup, elimini le regole come
	   "selettori inutilizzati". */
	.loading-screen:global(.is-hydrated) .loading-light {
		animation: none;
	}

	/* Avvio outro: GSAP prende il transform per la spirale — lo spin CSS (che batterebbe gli
	   inline style) va spento e il layer promosso non serve più. */
	.loading-screen:global(.is-collapsing) .loading-orbit {
		animation: none;
		will-change: auto;
	}

	@keyframes loading-orbit-spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* to = valore base (opacity 1): la lucina appare sfumando dall'invisibile. */
	@keyframes light-appear {
		from {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.loading-orbit {
			animation: none;
		}
	}
</style>
