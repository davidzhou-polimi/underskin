<script>
	import { performanceReveal } from '$lib/actions/home/performanceReveal.js';
</script>

<section id="performance" class="performance-section">
	<div class="perf-content">
		<blockquote class="perf-quote" use:performanceReveal={{ triggerId: '#performance' }}>
			La performance non consuma solo il corpo: <br />
			modella
			<span class="gradient-text animate-gradient-text my-archetypes-color"> identità, abitudini e ossessioni</span>.<br />
			Nel tempo emergono schemi ricorrenti, modi<br />
			diversi di vivere il peso della performance.
		</blockquote>
	</div>
</section>

<style>
	.performance-section {
		position: relative;
		width: 100%;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 80px;
		background-color: transparent;
	}

	.perf-quote {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: var(--text-important-weight);
		font-size: var(--text-l);
		line-height: 1.5;
		color: var(--content-primary);
		text-align: center;
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
