<script>
	import { trackSection } from '$lib/actions/trackSection.js';
</script>

<section id="favorito" class="favorito-section" use:trackSection>
	<div class="content">
		<h2>FAVORITO</h2>
	</div>
</section>

<style>
	/* Use relative positioning and hidden overflow to properly bound the absolute canvas */
	.favorito-section {
		position: relative;
		overflow: hidden;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		color: color-mix(in srgb, var(--content-dark-primary) 70%, transparent);
        font-size: var(--text-title-size);
        font-weight: var(--text-title-weight);
	}

	.content {
		position: relative;
		z-index: 1;
		text-align: center;
	}
</style>
