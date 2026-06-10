<script>
	import ArchetypeCarousel from '$lib/components/ui/ArchetypeCarousel.svelte';
	import { trackSection } from '$lib/actions/trackSection.js';
</script>

<section 
	id="archetypes" 
	class="archetype-section" 
	use:trackSection={{ id: 'archetypes' }}
>
	<div class="archetype-section__container">
		<ArchetypeCarousel />
	</div>
</section>

<style>
	/* Altezza minima a schermo intero per consentire l'espansione e la flessibilità su schermi piccoli */
	.archetype-section {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		margin-top: -15vh;
		width: 100%;
		padding-top: var(--spacing-10);
		padding-bottom: var(--spacing-3);
		box-sizing: border-box;
		/* Nascondiamo l'overflow orizzontale della sezione per evitare scrollbar,
		   consentendo comunque lo spazio necessario per le ombre */
		overflow: hidden;
	}

	.archetype-section__container {
		width: 100%;
		max-width: var(--spacing-17);
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
</style>
