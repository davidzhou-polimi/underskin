<script>
	// Commento solo il PERCHÉ: Importa trackSection per sincronizzare lo scroll attivo
	// e InteractiveGradient per il canvas dello sfondo.
	import { trackSection } from '$lib/actions/trackSection.js';
	import InteractiveGradient from '$lib/components/ui/InteractiveGradient.svelte';
</script>

<section id="infortunato" class="infortunato-section" use:trackSection>
	<!--
		Commento solo il PERCHÉ: Imposta il gradiente con la tonalità arancione associata
		all'archetipo infortunato coprendo l'intero sfondo.
	-->
	<InteractiveGradient
		config={{
			colors: ['var(--background-primary)', 'var(--archetipi-infortunato)'],
			coverage: 1.0,
			maskClamp: [0.0, 1.0]
		}}
	/>
	<div class="content">
		<h2>Sezione Infortunato</h2>
	</div>
</section>

<style>
	.infortunato-section {
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
