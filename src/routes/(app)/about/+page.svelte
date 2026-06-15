<script>
	import AboutSection from '$lib/components/sections/about/About.svelte';
	import TeamSection from '$lib/components/sections/team/TeamSection.svelte';
	import Footer from '$lib/components/sections/home/Footer.svelte';
	import InteractiveGradient from '$lib/components/ui/InteractiveGradient.svelte';
	import { trackScrollProgress } from '$lib/actions/trackScrollProgress.js';

	// Tracciamento reattivo della finestra (Svelte 5 Runes)
	let scrollY = $state(0);
	let innerHeight = $state(0);

	/**
	 * PALETTE CROMATICA UNIFICATA E PERFETTAMENTE BILANCIATA
	 * Per evitare la prevalenza dell'arancione, i colori sono stati alternati uno a uno
	 * (Azzurro -> Viola -> Arancione) incrociando anche le tonalità (Chiaro / Medium / Scuro).
	 * Questo costringe l'algoritmo del canvas a distribuire i pesi visivi in egual misura.
	 */
	const TOTAL_COLORS = [
		"var(--azzurro-200)",             // Chiaro - Favorito
		"var(--viola-600)",               // Scuro  - Insoddisfatto
		"var(--arancione-200)",           // Chiaro - Infortunato

		"var(--archetipi-favorito)",      // Medium - Favorito
		"var(--viola-200)",               // Chiaro - Insoddisfatto
		"var(--arancione-600)",           // Scuro  - Infortunato

		"var(--azzurro-600)",             // Scuro  - Favorito
		"var(--archetipi-insoddisfatto)", // Medium - Insoddisfatto
		"var(--archetipi-infortunato)"    // Medium - Infortunato
	];

	// LOGICA DI SCROLL COMPUTATA REATTIVAMENTE ($derived)

	// 1. Rileva se l'utente si trova nel corpo centrale della pagina (dopo la hero)
	let isPastFirstViewport = $derived(scrollY > innerHeight / 1.5);

	// 2. Rileva con precisione quando l'utente raggiunge la fine della pagina (footer)
	let isNearPageBottom = $derived(
		typeof document !== 'undefined' &&
		scrollY > (document.documentElement.scrollHeight - innerHeight * 1.8)
	);

	// 3. Generazione dinamica della configurazione dello sfondo in base alla posizione di scroll
	let activeConfig = $derived(
		isNearPageBottom
			? {
				  colors: TOTAL_COLORS,
				  speed: 2.2,          // Accelerazione visiva d'impatto sul Footer
				  coverage: 1.0,       // Copertura totale immersiva per il finale della pagina
				  focusCenter: /** @type {[number, number]} */ ([0.5, -0.1]),
				  focusRadius: /** @type {[number, number]} */ ([1.4, 1.0])
			  }
			: isPastFirstViewport
				? {
					  colors: TOTAL_COLORS,
					  coverage: 0.35,  // Trasparenza controllata ed elegante sotto i testi centrali
					  speed: 0.6
				  }
				: {
					  colors: TOTAL_COLORS,
					  coverage: 0.5,   // Presenza intermedia e stabile nella sezione iniziale
					  speed: 0.8
				  }
	);
</script>

<svelte:window bind:scrollY bind:innerHeight />

<svelte:head>
	<title>About - UnderSkin</title>
	<meta name="description" content="Chi siamo e la filosofia dietro il progetto UnderSkin." />
</svelte:head>

<InteractiveGradient config={activeConfig} />

<main id="about" use:trackScrollProgress>
	<AboutSection />
	<TeamSection />
	<Footer />
</main>

<style>
	#about {
		position: relative;
		width: 100%;
		min-height: 100vh;
		/* Mantiene lo sfondo trasparente esponendo il canvas fixed */
		background: transparent;
	}

	#about :global(.hero-footer) {
		/* Annulla il margine negativo globale del footer per distanziare in modo pulito la sezione team dall'elemento di chiusura */
		margin-top: var(--spacing-11);
	}
</style>
