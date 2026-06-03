<script>
	import AthleteCarousel from '$lib/components/ui/AthleteCarousel.svelte';
	import { trackSection } from '$lib/actions/trackSection.js';

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
	use:trackSection={{ id: 'hero' }}
>
	<div class="athlete-section__container">
		<AthleteCarousel {type} />
	</div>
</section>

<style>
	.athlete-section {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100vh;
		width: 100%;
		/* padding-top evita la sovrapposizione visiva con la navbar fissa durante il rendering iniziale */
		padding-top: var(--spacing-10);
		padding-bottom: var(--spacing-3);
		box-sizing: border-box;
		/* overflow nasconde le card del carosello che escono lateralmente e previene scrollbar verticali indesiderate */
		overflow: hidden;
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
