<script>
	import { zoomTextTransition } from '$lib/actions/zoomTextTransition.js';
	import { trackSection } from '$lib/actions/trackSection.js';
</script>

<section id="zoom-transition" class="zoom-section" use:trackSection use:zoomTextTransition>
	
	<div class="intro-container">
		<span class="first-text">Alcuni casi a</span>
		
		<h1 class="zoom-text">
			Milano Cortina
			<span class="break-line">2026</span>
		</h1>
	</div>

	<div class="next-section-content">
		<div class="content-wrapper">
			<h2>Nuova Sezione</h2>
		</div>
	</div>

</section>

<style>
	/* Definiamo un colore temporaneo a tinta unita (es. un grigio scuro o blu profondo del brand) */
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

	/* Stile primo testo richiesto: --text-caption-size + --text-caption-weight + --content-primary */
	.first-text {
		font-size: var(--text-caption-size);
		font-weight: var(--text-caption-weight);
		color: var(--content-primary);
		margin-bottom: var(--spacing-4);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Stile secondo testo richiesto: --text-footer-size + --text-footer-weight */
	.zoom-text {
		font-size: var(--text-footer-size);
		font-weight: var(--text-footer-weight);
		color: var(--azzurro-600); 
		margin: var(--spacing-0);
		line-height: 1.1;
		text-align: center;
		
		/* Suggerisce al browser di ottimizzare il rendering dello zoom hardware */
		will-change: transform; 
	}

	.break-line {
		display: block;
	}

	/* Schermata successiva rivelata dallo zoom */
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
		/* Lo sfondo ha lo stesso identico colore del testo per dare l'effetto di continuità */
		background-color: var(--azzurro-600);
	}

	.content-wrapper {
		text-align: center;
		/* Colore di contrasto per i testi interni alla nuova sezione */
		color: var(--background-primary);
		padding: var(--spacing-4);
	}

	.content-wrapper h2 {
		font-size: var(--text-xl);
		margin-bottom: var(--spacing-2);
	}
</style>