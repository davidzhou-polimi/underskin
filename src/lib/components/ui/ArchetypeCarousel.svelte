<script>
	import ArchetypeCard from '$lib/components/ui/ArchetypeCard.svelte';

	// Configurazione dei tre archetipi statici da mostrare simultaneamente
	/**
	 * @type {Array<{
	 *   name: string,
	 *   type: 'favorito' | 'infortunato' | 'insoddisfatto',
	 *   videoSrc: string
	 * }>}
	 */
	const archetypes = [
		{ name: "Il favorito", type: "favorito", videoSrc: "/videos/favorito.mp4" },
		{ name: "L'infortunato", type: "infortunato", videoSrc: "/videos/infortunato.mp4" },
		{ name: "L'insoddisfatto", type: "insoddisfatto", videoSrc: "/videos/insoddisfatto.mp4" }
	];
</script>

<div
	class="archetypes-static-grid"
	role="region"
	aria-label="Archetype Showcase"
>
	{#each archetypes as archetype (archetype.name)}
		<div class="card-wrapper">
			<ArchetypeCard
				name={archetype.name}
				videoSrc={archetype.videoSrc}
				type={archetype.type}
				isPlaying={false}
			/>
		</div>
	{/each}
</div>

<style>
	/* Disposizione orizzontale centrata che previene il wrapping su desktop */
	.archetypes-static-grid {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: center;
		gap: var(--spacing-6);
		width: 100%;
		padding: var(--spacing-2) 0;
	}

	.card-wrapper {
		width: 357px;
		height: 461px;
		will-change: transform;
		flex-shrink: 0; /* Impedisce alle card di restringersi e perdere le proporzioni corrette */
	}

	/* Passaggio al layout verticale per tablet e dispositivi mobili */
	@media (max-width: 1150px) {
		.archetypes-static-grid {
			flex-direction: column;
			align-items: center;
			flex-wrap: wrap;
		}
	}
</style>
