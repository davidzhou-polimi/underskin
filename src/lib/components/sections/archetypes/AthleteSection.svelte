<script>
	import AthleteCarousel from '$lib/components/sections/archetypes/AthleteCarousel.svelte';

	/**
	 * @type {{
	 *   type?: 'favorito' | 'infortunato' | 'insoddisfatto'
	 * }}
	 */
	let { type = 'favorito' } = $props();
</script>

<section 
	id="hero" 
	class="athlete-section" 
>
	<div class="athlete-section__container">
		<AthleteCarousel {type} />
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
</style>
