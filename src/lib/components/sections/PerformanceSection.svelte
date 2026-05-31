<script>
	import { trackSection } from '$lib/actions/trackSection.js';
	import { layers } from '$lib/stores/layers.svelte.js';

	let opacity = $derived.by(() => {
		return layers.getLayerOpacity(2);
	});
	let layerStyle = $derived(layers.getLayerStyle(2));
</script>

<section id="performance" class="performance-section" style:opacity={opacity} style={layerStyle} use:trackSection>
	<div class="content-wrapper">
		<blockquote class="quote-text">
			La performance non consuma solo il corpo: modella
			<span class="gradient-text animate-gradient-text my-archetypes-color">identità, abitudini e ossessioni</span>.
			Nel tempo emergono schemi ricorrenti, modi diversi di vivere il peso della performance.
		</blockquote>
	</div>
</section>

<style>
	.performance-section {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 80px;
		background-color: var(--background-primary);
		will-change: opacity;
	}

	.content-wrapper {
		max-width: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-6);
		text-align: center;
	}

	.quote-text {
		font-size: var(--text-title);
		font-weight: var(--text-important-weight);
		color: var(--content-primary);
		font-family: var(--font-family-base);
		line-height: 1.6;
		margin: 0;
		padding: 0;
		border: none;
	}

	.my-archetypes-color {
		--gradient-c1: var(--archetipi-favorito);
		--gradient-c2: var(--archetipi-insoddisfatto);
		--gradient-c3: var(--archetipi-infortunato);
	}
</style>
