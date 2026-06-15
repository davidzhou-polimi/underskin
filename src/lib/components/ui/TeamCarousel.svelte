<script>
	import TeamCard from '$lib/components/ui/TeamCard.svelte';
	import { horizontalCarousel } from '$lib/actions/horizontalCarousel.js';
	import { autoplay } from '$lib/actions/autoplay.js';
	// Definiamo i 3 membri del team statici con i rispettivi tipi e sorgenti video
	/**
	 * @type {Array<{
	 *   name: string,
	 *   type: 'favorito' | 'infortunato' | 'insoddisfatto',
	 *   videoSrc: string
	 * }>}
	 */
	const teams = [
		{ name: "Il favorito", type: "favorito", videoSrc: "/videos/favorito.mp4" },
		{ name: "L'infortunato", type: "infortunato", videoSrc: "/videos/infortunato.mp4" },
		{ name: "L'insoddisfatto", type: "insoddisfatto", videoSrc: "/videos/insoddisfatto.mp4" }
	];
</script>

<div
	class="team-carousel-container"
	role="region"
	aria-label="Team Showcase Carousel"
>
	<div class="teams-static-grid">
		{#each teams as team, i (team.name)}
			<div class="card-wrapper">
				<TeamCard
					name={team.name}
					videoSrc={team.videoSrc}
					type={team.type}
					isPlaying={false}
				/>
			</div>
		{/each}
	</div>
</div>

<style>
	.team-carousel-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		overflow: visible;
		padding: var(--spacing-2) 0;
		outline: none;
	}

	/* Disposizione orizzontale centrata che previene il wrapping su desktop */
	.teams-static-grid {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: center;
		gap: var(--spacing-6);
		width: 100%;
	}

	.card-wrapper {
		width: 357px;
		height: 461px;
		will-change: transform;
		flex-shrink: 0; /* Impedisce alle card di restringersi e perdere le proporzioni corrette */
	}

	/* Passaggio al layout verticale per tablet e dispositivi mobili */
	@media (max-width: 1150px) {
		.teams-static-grid {
			flex-direction: column;
			align-items: center;
			flex-wrap: wrap;
		}
	}
</style>
