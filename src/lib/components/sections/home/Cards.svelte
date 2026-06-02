<script>
	import { horizontalScroll } from '$lib/actions/horizontalScroll.js';

	const cards = [
		{
			label: 'Il Favorito',
			tag: 'Chi si sente al sicuro',
			description:
				'Si siede sempre allo stesso posto. Non perché sia superstizioso, ma perché quella poltrona lo ha già accolto: conosce la distanza dall\'occhio al telo, sa dove mettere il telefono, sa che lì il buio è il suo.',
		},
		{
			label: 'L\'Insoddisfatto',
			tag: 'Chi vuole di più',
			description:
				'Lascia il cinema con qualcosa da ridire. Non per cinismo, ma perché il film l\'ha sfiorato senza colpirlo. Cerca quella scena che gli rimanga addosso per settimane, quella che cambia il modo di guardare.',
		},
		{
			label: 'L\'Infortunato',
			tag: 'Chi viene trovato',
			description:
				'Non si considerava un cinefilo. Poi un pomeriggio libero, un consiglio distratto, uno schermo acceso — e qualcosa è cambiato. Non sa ancora dare un nome a quello che prova, ma vuole sentirlo ancora.',
		},
	];
</script>

<section class="h-scroll-section" use:horizontalScroll>
	<div class="h-scroll-track">
		<div class="h-scroll-intro">
			<p class="intro-label">I tre archetipi</p>
			<h2 class="intro-headline">Chi sei<br/>al cinema?</h2>
		</div>

		{#each cards as card, i}
			<article class="h-scroll-card">
				<div class="card-inner">
					<span class="card-number">0{i + 1}</span>
					<h3 class="card-title">{card.label}</h3>
					<p class="card-tag">{card.tag}</p>
					<p class="card-desc">{card.description}</p>
				</div>
			</article>
		{/each}

		<div class="h-scroll-end">
			<p class="end-cta">Scopri il tuo profilo</p>
		</div>
	</div>
</section>

<style>
	.h-scroll-section {
		position: relative;
		width: 100%;
		height: 100vh;
		overflow: hidden;
	}

	/* Track traslato da GSAP in orizzontale */
	.h-scroll-track {
		display: flex;
		align-items: center;
		height: 100%;
		width: max-content;
		gap: var(--spacing-10);
		padding-inline: var(--spacing-11);
	}

	/* ── Intro slide ── */
	.h-scroll-intro {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-3);
		min-width: 40vw;
	}

	.intro-label {
		font-size: var(--text-s);
		font-weight: 500;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--content-dark-primary) 50%, transparent);
	}

	.intro-headline {
		font-size: var(--text-2xl);
		font-weight: 700;
		line-height: 0.9;
		letter-spacing: -0.03em;
		color: var(--content-dark-primary);
	}

	/* ── Cards ── */
	.h-scroll-card {
		min-width: 36vw;
		max-width: 480px;
		height: 60vh;
	}

	.card-inner {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-3);
		padding: var(--spacing-8);
		width: 100%;
		height: 100%;
		justify-content: flex-end;
		background: color-mix(in srgb, var(--content-dark-primary) 5%, transparent);
		border: 1px solid color-mix(in srgb, var(--content-dark-primary) 10%, transparent);
		border-radius: var(--radius-l);
		backdrop-filter: blur(8px);
	}

	.card-number {
		font-size: var(--text-s);
		font-weight: 500;
		letter-spacing: 0.1em;
		color: color-mix(in srgb, var(--content-dark-primary) 40%, transparent);
		align-self: flex-start;
		margin-block-end: auto;
	}

	.card-title {
		font-size: var(--text-l);
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1;
		color: var(--content-dark-primary);
	}

	.card-tag {
		font-size: var(--text-xs);
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--content-dark-primary) 55%, transparent);
	}

	.card-desc {
		font-size: var(--text-xs);
		line-height: 1.6;
		color: color-mix(in srgb, var(--content-dark-primary) 70%, transparent);
		max-width: 36ch;
	}

	/* ── End slide ── */
	.h-scroll-end {
		min-width: 30vw;
		display: flex;
		align-items: center;
	}

	.end-cta {
		font-size: var(--text-m);
		font-weight: 600;
		letter-spacing: -0.02em;
		color: color-mix(in srgb, var(--content-dark-primary) 60%, transparent);
	}
</style>
