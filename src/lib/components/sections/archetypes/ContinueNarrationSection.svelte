<script>
	import ArchetypeCard from '$lib/components/ui/ArchetypeCard.svelte';
	import { trackSection } from '$lib/actions/trackSection.js';
	import { goto } from '$app/navigation';

	/**
	 * @type {{
	 *   archetype?: 'favorito' | 'infortunato' | 'insoddisfatto'
	 * }}
	 */
	let { archetype = 'favorito' } = $props();

	// Lista statica di tutti gli archetipi disponibili
	/**
	 * @type {Array<{
	 *   name: string,
	 *   type: 'favorito' | 'infortunato' | 'insoddisfatto',
	 *   videoSrc: string
	 * }>}
	 */
	const allArchetypes = [
		{ name: "Il favorito", type: "favorito", videoSrc: "/videos/favorito.mp4" },
		{ name: "L'infortunato", type: "infortunato", videoSrc: "/videos/infortunato.mp4" },
		{ name: "L'insoddisfatto", type: "insoddisfatto", videoSrc: "/videos/insoddisfatto.mp4" }
	];

	// Escludiamo l'archetipo corrente per visualizzare solo gli altri due
	let filteredArchetypes = $derived(
		allArchetypes.filter(item => item.type !== archetype)
	);

	// Reindirizziamo alla rotta radice per consentire all'utente di selezionare un altro percorso o rivedere l'intro
	const handleButtonClick = () => {
		goto('/');
	};
</script>

<section 
	id="continue-narration" 
	class="continue-section" 
	use:trackSection={{ id: 'continue-narration' }}
>
	<div class="continue-container">
		<!-- Titolo della sezione con stile tipografico grande coordinato -->
		<h3 class="continue-title">Continua la narrazione</h3>

		<!-- Contenitore delle due card visualizzate in orizzontale -->
		<div class="cards-grid">
			{#each filteredArchetypes as item (item.name)}
				<ArchetypeCard 
					name={item.name} 
					type={item.type} 
					videoSrc={item.videoSrc}
					horizontal={true}
				/>
			{/each}
		</div>

		<!-- Bottone a forma di pillola traslucido con colore background primary, opacità 40% e shadow leggera -->
		<div class="action-container">
			<button 
				type="button" 
				class="glass-effect pill-button" 
				onclick={handleButtonClick}
				aria-label="Torna alla narrazione"
			>
				Torna alla narrazione
			</button>
		</div>
	</div>
</section>

<style>
	.continue-section {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		width: 100%;
		padding-top: var(--spacing-10);
		padding-bottom: var(--spacing-10);
		box-sizing: border-box;
		background-color: var(--background-primary);
		overflow: hidden;
	}

	.continue-container {
		width: 100%;
		max-width: var(--spacing-17);
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-inline: var(--spacing-2);
		box-sizing: border-box;
	}

	.continue-title {
		margin-bottom: var(--spacing-6);
	}

	.cards-grid {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		gap: var(--spacing-4);
		width: 100%;
		margin-bottom: var(--spacing-8);
	}

	.action-container {
		display: flex;
		justify-content: center;
		width: 100%;
	}

	.pill-button {
		color: var(--content-primary);
		font-family: inherit;
		font-size: var(--text-nav-size);
		font-weight: var(--text-nav-active-weight);
		border-radius: 9999px;
		padding: var(--spacing-2) var(--spacing-6);
		cursor: pointer;
		transition: background-color var(--transition-duration-normal) var(--easing-standard),
					transform var(--transition-duration-normal) var(--easing-standard);
	}

	.pill-button:hover {
		background-color: rgb(from var(--neutral-100) r g b / 0.8);
	}

	/* Responsive per schermi più piccoli */
	@media (max-width: 1024px) {
		.cards-grid {
			flex-direction: column;
			gap: var(--spacing-4);
		}
	}
</style>
