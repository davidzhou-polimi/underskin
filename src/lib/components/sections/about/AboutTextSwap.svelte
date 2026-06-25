<script>
	import { scrollableTextSwap } from '$lib/actions/about/scrollableTextSwap.js';
</script>

<section class="about-text-swap" use:scrollableTextSwap>
	<div class="text-container">
		<!-- Primo Blocco di Testo -->
		<div class="text-block text-block-current">
			<p class="about-narrative-text">
				Le Olimpiadi Milano Cortina 2026 sono un sistema<br />
				di misurazione millimetrica: centesimi di secondo,<br />
				punteggi decimali, medaglieri rigidi.
				<br /><br />
				Ma cosa succede quando riduciamo un essere<br />
				umano a un <span class="highlighted-keyword gradient-text animate-gradient-text about-theme-color">puro dato oggettivo</span>?
			</p>
		</div>

		<!-- Secondo Blocco di Testo -->
		<div class="text-block text-block-next">
			<p class="about-narrative-text">
				UnderSkin nasce per scavare sotto la superficie<br />
				della performance d'élite, per andare <span class="highlighted-keyword gradient-text animate-gradient-text about-theme-color">oltre il mito</span><br />
				intramontabile dell'atleta invincibile.
				<br /><br />
				Vogliamo dare voce a tutto ciò che normalmente<br />
				non si vede: la pressione delle aspettative, il peso<br />
				psicologico del "quasi", il corpo che cede e la lenta<br />
				<span class="highlighted-keyword gradient-text animate-gradient-text about-theme-color">ricostruzione di sé</span>.
			</p>
		</div>
	</div>
</section>

<style>
	.about-text-swap {
		position: relative;
		width: 100%;
		/* height: 100vh e display: block sono fondamentali per consentire il pinning di GSAP ScrollTrigger */
		height: 100vh;
		display: block;
		padding: 0;
		background-color: transparent;
	}

	.text-container {
		position: relative;
		width: 100%;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.text-block {
		/* Posizionamento assoluto per sovrapporre i due blocchi ed eseguire la transizione incrociata */
		position: absolute;
		/* Commento solo il PERCHÉ: centra in modo assoluto e impeccabile l'elemento sia in orizzontale 
		   che in verticale senza utilizzare le proprietà di `transform` (che andrebbero in conflitto 
		   con le animazioni `xPercent` di GSAP nell'Action) */
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		margin: auto;
		height: fit-content;
		/* Commento solo il PERCHÉ: contrae il contenitore sulla larghezza reale della riga di testo più lunga, 
		   permettendo a `margin: auto` di centrare matematicamente l'intero blocco sullo schermo */
		width: fit-content;
		/* Commento solo il PERCHÉ: imposta la larghezza massima di lettura ideale (circa 70 caratteri) 
		   per creare un blocco tipografico compatto ed elegantemente centrato sullo schermo */
		max-width: var(--spacing-17);
		padding: 0 var(--spacing-6);
		will-change: transform, opacity;
	}

	.text-block-current {
		z-index: 1;
	}

	.text-block-next {
		z-index: 0;
	}

	.about-narrative-text {
		font-family: var(--font-family-base);
		/* Commento solo il PERCHÉ: utilizza il token di dimensione media (2rem) come NarrativeText 
		   per elevare l'importanza visiva del testo rispetto a un normale paragrafo di servizio */
		font-size: var(--text-m);
		font-weight: var(--text-body-weight);
		line-height: 1.5;
		color: var(--content-primary);
		/* Commento solo il PERCHÉ: allinea il testo a sinistra (bandiera) per un aspetto editoriale premium, 
		   mentre il blocco genitore rimane centrato sullo schermo */
		text-align: left;
		margin: 0;
	}

	.highlighted-keyword {
		position: relative;
		display: inline;
		/* Commento solo il PERCHÉ: utilizza il peso grassetto definito per attirare l'attenzione 
		   sulle parole chiave principali durante la lettura */
		font-weight: var(--text-bold);
	}

	.about-theme-color {
		/* Commento solo il PERCHÉ: unisce i colori primari di tutti e tre gli archetipi 
		   per simboleggiare l'anima corale della pagina About all'interno del gradiente animato */
		--gradient-c1: var(--archetipi-favorito);
		--gradient-c2: var(--archetipi-insoddisfatto);
		--gradient-c3: var(--archetipi-infortunato);
	}
</style>
