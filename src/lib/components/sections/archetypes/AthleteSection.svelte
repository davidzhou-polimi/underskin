<script>
	import AthleteCarousel from '$lib/components/ui/AthleteCarousel.svelte';

	/**
	 * @type {{
	 *   type?: 'favorito' | 'infortunato' | 'insoddisfatto',
	 *   revealed?: boolean
	 * }}
	 */
	let { type = 'favorito', revealed = true } = $props();
</script>

<section 
	id="hero" 
	class="athlete-section" 
>
	<div class="athlete-section__container">
		<AthleteCarousel {type} {revealed} />
	</div>
</section>

<style>
	/* Altezza minima a schermo intero per consentire l'estensione su schermi piccoli senza tagliare il contenuto */
	.athlete-section {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		width: 100%;
		/* padding-top evita la sovrapposizione visiva con la navbar fissa durante il rendering iniziale */
		padding-top: var(--spacing-10);
		padding-bottom: var(--spacing-3);
		box-sizing: border-box;
		/* overflow visible consente al carousel di estendersi oltre i lati */
		overflow: visible;
	}

	.athlete-section__container {
		width: 100%;
		max-width: var(--spacing-17);
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	@media (max-width: 768px) {
		.athlete-section {
			/* Riequilibrio del baricentro del deck: min-height segue il box svh di ZoomTransition
			   (con 100vh la sezione traboccherebbe dal box a barra browser visibile, spingendo
			   card e dots sotto la piega) e il padding simmetrico corregge il centro che 56/24
			   spingeva 16px in basso. svh statico: nessun reflow durante lo scroll. */
			min-height: 100vh;
			min-height: 100svh;
			padding-bottom: var(--spacing-10);
		}

		.athlete-section__container {
			/* --spacing-17 mobile (320px) è più stretto della card responsive del deck:
			   il margine laterale lo governa già la card stessa (100vw − 2·spacing-4) */
			max-width: 100%;
		}
	}
</style>
