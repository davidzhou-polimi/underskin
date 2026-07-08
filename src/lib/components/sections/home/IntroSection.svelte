<script>
	import { introReveal } from '$lib/actions/home/introReveal.js';
	import ScrollHint from '$lib/components/ui/ScrollHint.svelte';
</script>

<section class="intro-section" use:introReveal>
	<svg class="circles-svg" viewBox="0 0 800 800" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
		<circle class="intro-circle circle-inner" cx="400" cy="400" r="270"
			fill="none"
			stroke="var(--content-primary)"
			stroke-opacity="0.24"
			stroke-width="2"
			stroke-dasharray="0 11.016"
			stroke-linecap="round"
		/>
		<circle class="intro-circle circle-middle" cx="400" cy="400" r="440"
			fill="none"
			stroke="var(--content-primary)"
			stroke-opacity="0.32"
			stroke-width="2"
			stroke-dasharray="0 11.014"
			stroke-linecap="round"
		/>
		<circle class="intro-circle circle-outer" cx="400" cy="400" r="630"
			fill="none"
			stroke="var(--content-primary)"
			stroke-opacity="0.16"
			stroke-width="2"
			stroke-dasharray="0 10.996"
			stroke-linecap="round"
		/>
	</svg>

	<h1 class="intro-title" aria-label="UnderSkin">
		{#each "UnderSkin" as letter}
			<span class="intro-letter" aria-hidden="true">{letter}</span>
		{/each}
	</h1>

	<div class="scroll-hint">
		<ScrollHint showText={true} text="Scorri per iniziare" />
	</div>
</section>

<style>
	.intro-section {
		position: relative;
		width: 100%;
		/* svh (viewport minimo, statico) invece di vh: l'intro è a scroll bloccato, quindi deve stare
		   nell'area realmente visibile anche con la toolbar del browser aperta, altrimenti lo scroll cue
		   in basso finisce sotto la chrome. svh è statico (non ricalcola come dvh) → nessun thrashing di
		   ScrollTrigger. Su desktop svh == vh: nessun cambiamento. Fallback vh per browser senza svh. */
		height: 100vh;
		height: 100svh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: transparent;
		overflow: hidden;
		perspective: 1200px;
		transform-style: preserve-3d;
	}

	.circles-svg {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 60rem;
		height: 60rem;
		pointer-events: none;
		overflow: visible;
		transform-style: preserve-3d;
		will-change: transform;
	}

	@media (max-width: 768px) {
		/* Con la barra browser ritirata (ritorni programmatici in cima: navigazione client,
		   "Vai alla conclusione" + risalita) il viewport visibile è lvh ma la sezione resta
		   100svh: il cue ancorato al fondo sezione fluttuava ~130px sopra il fondo schermo.
		   L'offset dvh lo aggancia al fondo REALE (a barra visibile dvh=svh → identico a prima);
		   position:fixed non è percorribile perché perspective rende la sezione containing block.
		   overflow-y visibile (clip solo orizzontale, per i cerchi da 30rem) perché il cue possa
		   sporgere sotto il box sezione; clip non crea scroll container. L'offset del cue vive
		   nel media block in fondo al foglio: deve seguire la regola base per vincere la cascata. */
		.intro-section {
			overflow: visible;
			overflow-x: clip;
		}

		.circles-svg {
			/* Commento solo il PERCHÉ: riduce la dimensione dei cerchi di sfondo per
			   mantenerli interamente visibili ed armoniosi sul viewport ridotto dei telefoni */
			width: 30rem;
			height: 30rem;
		}

		.intro-title {
			/* In uscita le lettere salgono di yPercent -9 sforando il box (line-height 1) e la
			   mask, ripetendosi sopra il box, le taglia con un bordo netto. Il padding dà headroom
			   DENTRO l'area mascherata (zona solida 0→85%); il margin compensa così i glifi non si
			   spostano a riposo. In em: proporzionale al font come l'escursione yPercent. */
			padding-top: 0.15em;
			margin-top: calc(var(--spacing-2) - 0.15em);
		}
	}

	.intro-title {
		position: relative;
		z-index: 1;
		margin: 0;
		margin-top: var(--spacing-2);
		font-family: var(--font-family-base);
		font-size: var(--text-title-size);
		font-weight: var(--text-title-weight);
		color: var(--content-primary);
		line-height: 1;
		transform-style: preserve-3d;
		will-change: transform;
		/* Commento solo il perché: Combina un fade inferiore con un gradiente orizzontale che sfuma solo i bordi esterni del titolo per mantenerlo nitido e leggibile al centro, fungendo da "lente" statica entro cui le lettere si muovono e sfumano. Aumentiamo l'area solida all'85% per evitare il clipping delle lettere quando salgono dal basso. */
		mask-image: 
			linear-gradient(to bottom, #000 85%, transparent 100%), 
			linear-gradient(to right, transparent 0%, #000 15%, #000 75%, transparent 100%);
		mask-composite: intersect;
	}

	.intro-letter {
		display: inline-block;
		will-change: transform, filter, opacity;
		/* Commento solo il perché: espone una variabile CSS per gestire in modo performante e cross-browser il blur da GSAP */
		filter: blur(var(--blur-val, 0px));
		transform-style: preserve-3d;
	}

	.scroll-hint {
		position: absolute;
		bottom: var(--scroll-hint-bottom);
		left: 50%;
		transform: translateX(-50%);
		z-index: 1;
		/* Wrapper di sola posizione: su mobile può sporgere sopra la sezione successiva
		   e non deve intercettarne i tap. */
		pointer-events: none;
	}

	@media (max-width: 768px) {
		.scroll-hint {
			/* Aggancio al fondo REALE del viewport (vedi commento sul media block più sopra):
			   a barra visibile dvh=svh → identico alla regola base, che resta come fallback
			   per i browser senza dvh. */
			bottom: calc(var(--scroll-hint-bottom) - (100dvh - 100svh));
		}
	}
</style>

