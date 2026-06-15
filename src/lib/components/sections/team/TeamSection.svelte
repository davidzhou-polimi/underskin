<script>
	import TeamCarousel from '$lib/components/ui/TeamCarousel.svelte';
	import { trackSection } from '$lib/actions/trackSection.js';
</script>

<section 
	id="team" 
	class="team-section" 
	use:trackSection={{ id: 'team' }}
>
	<div class="team-section__container">
		<h3 class="section-intro-heading">Conosci il team</h3>
		<TeamCarousel />
	</div>
</section>

<style>
	/* Altezza minima a schermo intero per consentire l'espansione e la flessibilità su schermi piccoli */
	.team-section {
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

	.team-section__container {
		width: 100%;
		max-width: var(--spacing-17);
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.section-intro-heading {
		margin-bottom: var(--spacing-6);
	}
</style>
