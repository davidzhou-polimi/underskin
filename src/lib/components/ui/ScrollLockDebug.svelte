<script>
	/**
	 * Overlay dev-only del ScrollLockManager: rende visibili a colpo d'occhio lock
	 * rimasti appesi o acquire negati durante il QA. Montato dal layout root solo
	 * in dev — mai renderizzato in produzione.
	 */
	import { scrollLock } from '$lib/stores/scrollLock.svelte.js';
	import { getLenis } from '$lib/stores/lenis.svelte.js';

	let lenisStopped = $state(false);

	// Polling leggero invece di hook interni a Lenis: è strumentazione usa-e-getta,
	// non deve accoppiarsi al ciclo di vita dell'istanza.
	$effect(() => {
		const interval = setInterval(() => {
			lenisStopped = getLenis()?.isStopped ?? false;
		}, 250);
		return () => clearInterval(interval);
	});
</script>

<div class="scroll-lock-debug" class:active={scrollLock.mode !== 'none'}>
	lock: {scrollLock.mode}
	{#if scrollLock.owner}({scrollLock.owner}){/if}
	· lenis: {lenisStopped ? 'stopped' : 'running'}
</div>

<style>
	/* Strumentazione dev: esente dai token di design, non è UI di prodotto. */
	.scroll-lock-debug {
		position: fixed;
		bottom: 4px;
		left: 4px;
		z-index: 9999;
		pointer-events: none;
		font: 11px/1.4 monospace;
		padding: 2px 6px;
		border-radius: 3px;
		color: #9f9;
		background: rgba(0, 0, 0, 0.6);
	}

	.scroll-lock-debug.active {
		color: #ff6;
		background: rgba(128, 0, 0, 0.75);
	}
</style>
