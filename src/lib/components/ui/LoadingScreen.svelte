<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { loadingOrbit } from '$lib/actions/loadingOrbit.js';
	import { loadingState } from '$lib/stores/loadingState.svelte.js';
	import { lockScroll, unlockScroll } from '$lib/stores/lenis.svelte.js';

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

		Promise.all([fonts, italic, whenGradientReady()]).then(() => {
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
		/* Raggio dell'orbita: parametro d'animazione (non un token di design). Fluido così la distanza
		   tra le lucine scala con lo schermo; il cap 30px tiene il desktop com'era. GSAP lo legge
		   risolto in px dalla matrice computata delle lucine al takeover. */
		--orbit-radius: clamp(20px, 7vmin, 30px);
	}

	/* L'orbita ruota in CSS SOLO nella finestra pre-hydration: si anima già dal frame
	   prerenderizzato, senza attendere il JS (era la causa del "loader in ritardo" su Android).
	   All'hydration l'action aggiunge `is-hydrated` e GSAP subentra per idle e outro (il twinkle
	   in keyframes CSS sfarfallava; quello GSAP originale no). */
	.loading-orbit {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
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

	/* Takeover GSAP all'hydration: le CSS animation battono gli inline style, quindi vanno spente
	   perché i gsap.set su transform/opacity abbiano effetto (il transform statico da stylesheet è
	   invece battuto dagli inline e non serve azzerarlo). `is-hydrated` è aggiunta a runtime
	   dall'action (classList.add): :global() evita che Svelte, non vedendola nel markup, elimini
	   la regola come "selettore inutilizzato". */
	.loading-screen:global(.is-hydrated) .loading-orbit,
	.loading-screen:global(.is-hydrated) .loading-light {
		animation: none;
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
