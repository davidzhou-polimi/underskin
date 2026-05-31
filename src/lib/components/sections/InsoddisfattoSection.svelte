<script>
	// Commento solo il PERCHÉ: Importa trackSection per aggiornare lo store dello scroll
	// e InteractiveGradient per renderizzare lo sfondo animato specifico di questa sezione.
	import { trackSection } from '$lib/actions/trackSection.js';
	import InteractiveGradient from '$lib/components/ui/InteractiveGradient.svelte';
</script>

<section id="insoddisfatto" class="insoddisfatto-section" use:trackSection>
	<!--
		Commento solo il PERCHÉ: Imposta il gradiente con la tonalità viola associata
		all'archetipo insoddisfatto e copre l'intero viewport.
	-->
	<InteractiveGradient
		config={{
			colors: ['var(--background-primary)', 'var(--archetipi-insoddisfatto)'],
			coverage: 1.0,
			maskClamp: [0.0, 1.0]
		}}
	/>
	<div class="content">
		<h2>Sezione Insoddisfatto</h2>
	</div>
</section>

<style>
	.insoddisfatto-section {
		position: relative;
		overflow: hidden;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--content-primary);
	}

	.content {
		position: relative;
		z-index: 1;
		text-align: center;
	}
</style>
