<script>
	import { scrollTextReveal } from '$lib/actions/scrollTextReveal.js';
	import { trackSection } from '$lib/actions/trackSection.js';
</script>

<section id="intro-text" class="intro-section" use:trackSection use:scrollTextReveal>
	<div class="text-container">
		<p class="reveal-line">Milano-Cortina 2026</p>
		<p class="reveal-line">2.900 atleti</p>
		<p class="reveal-line">1 vita di sacrifici</p>
		<p class="reveal-line">4 anni di preparazione</p>
		<div class="reveal-line final-phrase">
			<span>Tutto per soli</span>
			<span class="break-line">120 secondi di performance</span>
		</div>
	</div>
</section>

<style>
	.intro-section {
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--background-primary);
		overflow: hidden;
	}

	.text-container {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		align-items: center;
		justify-items: center;
		text-align: center;
		width: 100%;
		padding: var(--spacing-4);
	}

	/* Impiliamo i testi al centro esatto usando CSS Grid */
	.reveal-line {
		grid-area: 1 / 1 / 2 / 2;
		margin: var(--spacing-0);
		
		/* Stili espliciti richiesti con i tuoi token di design */
		font-size: var(--text-important-size);
		font-weight: var(--text-important-weight);
		color: var(--content-primary);
		
		font-family: var(--font-family-base);
		line-height: 1.4;
	}

	.final-phrase {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.break-line {
		display: block;
		margin-top: var(--spacing-1);
	}
</style>