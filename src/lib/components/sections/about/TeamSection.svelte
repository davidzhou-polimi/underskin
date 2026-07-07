<script>
	import TeamCarousel from '$lib/components/ui/TeamCarousel.svelte';
	import { sectionPin } from '$lib/actions/sectionPin.js';

	/**
	 * @typedef {Object} Props
	 * @property {string} [title]
	 */

	/** @type {Props} */
	let { title = "Il nostro team!" } = $props();
</script>

<section
	id="team"
	class="team-section"
	use:sectionPin
>
	<div class="team-section__container">
		{#if title}
			<h3 class="section-title">{title}</h3>
		{/if}
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
		width: 100%;
		/* Commento solo il PERCHÉ: utilizza un padding simmetrico sopra e sotto per garantire 
		   che il flex container sia perfettamente centrato in verticale sullo schermo */
		padding: var(--spacing-6) 0;
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

	.section-title {
		/* Commento solo il PERCHÉ: allinea la dimensione del titolo con "Conosci gli archetipi" della homepage
		   utilizzando il token --text-m (2rem) ed il peso regular */
		font-size: var(--text-m);
		font-weight: var(--text-regular);
		color: var(--content-primary);
		/* Commento solo il PERCHÉ: imposta la spaziatura inferiore a var(--spacing-6) (48px) 
		   per renderla perfettamente equidistante e simmetrica alla spaziatura superiore dei dots */
		margin-bottom: var(--spacing-6);
		text-align: center;
	}

	@media (max-width: 768px) {
		.team-section__container {
			/* Commento solo il PERCHÉ: rimuove il limite max-width (che si contrae a 320px su mobile via token spacing-17) 
			   permettendo al viewport del carosello di estendersi al 100% e mostrare le card successive sui bordi */
			max-width: 100%;
		}
	}
</style>
