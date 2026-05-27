<script>
	import { zoomTextTransition } from '$lib/actions/zoomTextTransition.js';
	import { trackSection } from '$lib/actions/trackSection.js';
</script>

<section id="zoom-transition" class="zoom-section" use:trackSection use:zoomTextTransition>
	
	<div class="intro-container">
		<span class="first-text">Alcuni casi a</span>
		
		<h1 class="zoom-text">
			Milano Cortina
			<span class="break-line">
				2<span class="target-digit">0</span>26
			</span>
		</h1>
	</div>

	<div class="next-section-content">
		<div class="content-wrapper">
			<h2>Nuova Sezione</h2>
		</div>
	</div>

</section>

<style>
	.zoom-section {
		--placeholder-color: var(--content-primary, #111111);
		position: relative;
		height: 100vh;
		width: 100vw;
		overflow: hidden;
		background-color: var(--background-primary);
		font-family: var(--font-family-base);
	}

	.intro-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		z-index: 1;
		padding: var(--spacing-4);
	}

	.first-text {
		font-size: var(--text-caption-size);
		font-weight: var(--text-caption-weight);
		color: var(--content-primary);
		margin-bottom: var(--spacing-4);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.zoom-text {
		font-size: var(--text-footer-size);
		font-weight: var(--text-footer-weight);
		color: var(--azzurro-600); 
		margin: var(--spacing-0);
		line-height: 1.1;
		text-align: center;
		will-change: transform; /* Ottimizza le performance dello zoom hardware */

        /* SOLUZIONE ANTI-PIXEL: Forza il browser a usare il motore 3D 
		   sub-pixel antialiasing mantenendo il vettore più definito durante lo zoom */
		transform-style: preserve-3d;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		
		will-change: transform;
	}

	.break-line {
		display: block;
	}

	/* Rendiamo lo span un blocco in linea per permettere il calcolo geometrico esatto */
	.target-digit {
		display: inline-block;
	}

	.next-section-content {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2;
		background-color: var(--azzurro-600); /* Colore azzurro coerente con il testo dello zoom */
	}

	.content-wrapper {
		text-align: center;
		color: var(--background-primary);
		padding: var(--spacing-4);
	}

	.content-wrapper h2 {
		font-size: var(--text-xl);
		margin-bottom: var(--spacing-2);
	}
</style>