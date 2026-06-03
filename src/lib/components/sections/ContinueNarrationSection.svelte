<script>
	import ArchetypeCard from '$lib/components/ui/ArchetypeCard.svelte';
	import { trackSection } from '$lib/actions/trackSection.js';

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

	// Azione per scorrere dolcemente all'inizio della pagina all'interazione con il bottone
	const handleButtonClick = () => {
		const target = document.getElementById('favorito') || document.getElementById('hero') || document.body;
		target.scrollIntoView({ behavior: 'smooth' });
	};
</script>

<section 
	id="continue-narration" 
	class="continue-section" 
	use:trackSection={{ id: 'continue-narration' }}
>
	<div class="continue-container">
		<!-- Titolo della sezione con stile tipografico grande coordinato -->
		<h2 class="continue-title">Continua la narrazione</h2>

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
				class="pill-button" 
				onclick={handleButtonClick}
				aria-label="Torna all'inizio della narrazione"
			>
				Torna all'inizio
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
		padding-inline: var(--spacing-4);
		box-sizing: border-box;
	}

	.continue-title {
		font-size: var(--text-l);
		font-weight: 700;
		color: var(--content-primary);
		text-align: center;
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
		/* Background primary con il 40% di opacità */
		background-color: color-mix(in srgb, var(--background-primary) 40%, transparent);
		color: var(--content-primary);
		font-family: inherit;
		font-size: var(--text-nav-size);
		font-weight: var(--text-nav-active-weight);
		border: 1px solid color-mix(in srgb, var(--content-primary) 15%, transparent);
		border-radius: 9999px;
		padding: var(--spacing-2) var(--spacing-6);
		cursor: pointer;
		/* Shadow leggera per separarlo dal background */
		box-shadow: 0px 4px 12px rgba(7, 30, 69, 0.06);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		transition: background-color var(--transition-duration-normal) var(--easing-standard),
					transform var(--transition-duration-normal) var(--easing-standard),
					box-shadow var(--transition-duration-normal) var(--easing-standard);
	}

	.pill-button:hover {
		background-color: color-mix(in srgb, var(--background-primary) 60%, transparent);
		transform: translateY(-2px);
		box-shadow: 0px 6px 16px rgba(7, 30, 69, 0.1);
	}

	/* Responsive per schermi più piccoli */
	@media (max-width: 1024px) {
		.cards-grid {
			flex-direction: column;
			gap: var(--spacing-4);
		}
	}
</style>
