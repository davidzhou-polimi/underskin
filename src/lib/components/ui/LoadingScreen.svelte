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

	function onReveal() {
		// Sblocca l'entrata della pagina (es. introReveal) solo dopo che l'overlay è del tutto
		// sparito + un breve gap: il timing esatto vive in loadingOrbit.js (REVEAL_GAP).
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

		// "Pronto" = tutte le risorse eager scaricate (window load) E i web font pronti
		// (document.fonts: window load non attende i @font-face con font-display:swap).
		const loaded = document.readyState === 'complete'
			? Promise.resolve()
			: new Promise((resolve) => window.addEventListener('load', () => resolve(undefined), { once: true }));
		const fonts = document.fonts ? document.fonts.ready : Promise.resolve();

		Promise.all([loaded, fonts]).then(() => {
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
		<span class="loading-light light-favorito"></span>
		<span class="loading-light light-insoddisfatto"></span>
		<span class="loading-light light-infortunato"></span>
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
	}

	.loading-light {
		position: absolute;
		top: 50%;
		left: 50%;
		width: var(--spacing-6);
		height: var(--spacing-6);
		border-radius: 50%;
		/* Invisibili nel frame prerenderizzato: senza JS i punti sarebbero impilati al centro.
		   L'action le posiziona in orbita e poi le "accende" in dissolvenza. */
		opacity: 0;
		/* Bordi non netti ("lucina"): il colore sfuma a trasparente prima del bordo; un lieve blur
		   aggiunge alone. Nessun token per il blur → literal minimo con questo commento. */
		filter: blur(3px);
		pointer-events: none;
	}

	.light-favorito {
		background: radial-gradient(circle, var(--archetipi-favorito) 0%, transparent 68%);
	}

	.light-insoddisfatto {
		background: radial-gradient(circle, var(--archetipi-insoddisfatto) 0%, transparent 68%);
	}

	.light-infortunato {
		background: radial-gradient(circle, var(--archetipi-infortunato) 0%, transparent 68%);
	}
</style>
