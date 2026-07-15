<script>
	import { scrollSection } from '$lib/actions/scrollytelling/scrollSection.js';
</script>

<section
	id="performance"
	class="performance-section"
	use:scrollSection={{
		id: "performance",
		pin: { length: "short", scrub: "auto" },
		reveal: { preset: "fadeIn", target: ".perf-content", dwell: "medium" },
		mobile: false
	}}
>
	<div class="perf-content">
		<!-- Desktop Quote -->
		<blockquote class="perf-quote desktop-only">
			La performance non consuma solo il corpo: <br />
			modella
			<span class="gradient-text animate-gradient-text my-archetypes-color"> identità, abitudini e ossessioni</span>.<br />
			Nel tempo emergono schemi ricorrenti, modi<br />
			diversi di vivere il peso della performance.
		</blockquote>

		<!-- Mobile Quote -->
		<blockquote class="perf-quote mobile-only">
			La performance non consuma <br />
			solo il corpo: ma modella <br />
			<span class="gradient-text animate-gradient-text my-archetypes-color"> identità, abitudini, ossessioni</span>.
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

	.mobile-only {
		display: none;
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

	@media (max-width: 768px) {
		.performance-section {
			/* Commento solo il PERCHÉ: nasconde completamente la sezione Performance originale su mobile 
			   perché viene integrata all'interno del processo di scrollytelling di ArchetypeSection */
			display: none;
		}
	}
</style>
