<script>
	import { scrollableTextSwap } from '$lib/actions/aboutScrollAnimation.js';

	let currentTextElement;
	let nextTextElement;
	let scrollContainerElement;
</script>

<section id="about-section">
	<div class="section section-1">
		<h1 class="title">L'atleta dietro la <br />performance</h1>
	</div>

	<div
		class="section section-2"
		bind:this={scrollContainerElement}
		use:scrollableTextSwap={{
			currentElement: currentTextElement,
			nextElement: nextTextElement,
			trigger: scrollContainerElement
		}}
	>
		<div class="text-container">
			<div class="text-block text-block-current" bind:this={currentTextElement}>
				<h4 class="caption">
					Le Olimpiadi Milano Cortina 2026 sono un sistema di misurazione millimetrica: <br />centesimi di
					secondo, punteggi decimali, medaglieri rigidi.
				</h4>
				<h4 class="caption gradient-animated">
					Ma cosa succede quando riduciamo un essere umano a un puro dato oggettivo?
				</h4>
			</div>

			<div class="text-block text-block-next" bind:this={nextTextElement}>
				<h4 class="caption">
					UnderSkin nasce per scollare l'etichetta dell'eroismo a tutti i costi e guardare sotto la
					superficie della performance d'élite. Vogliamo dare voce a ciò che normalmente non si vede: le
					aspettative schiaccianti, il peso psicologico del "quasi", la ricostruzione di un'identità
					dopo il dolore.
				</h4>
			</div>
		</div>
	</div>

	<div class="section section-3">
		<h2 class="important">
			Scegliere di guardare l'atleta come persona è il primo atto di empatia verso una cultura della
			prestazione più umana.
		</h2>
	</div>
</section>

<style>
	#about-section {
		width: 100%;
		background-color: var(--background-primary);
	}

	.section {
		width: 100%;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-6) var(--spacing-4);
	}

	/* Sezione 1: Titolo principale */
	.section-1 {
		background-color: var(--background-primary);
	}

	.title {
		text-align: center;
		max-width: 90%;
		line-height: 1.2;
	}

	/* Sezione 2: Messaggio con scroll animation */
	.section-2 {
		position: relative;
		background-color: var(--background-primary);
		height: 100vh; /* Riportato a 100vh per combaciare con l'altezza dello schermo durante il pinning */
		display: block; /* Importante per consentire il corretto funzionamento del pin di GSAP */
		padding: 0;
	}

	.text-container {
		position: relative;
		width: 100%;
		height: 100vh; /* Il contenitore interno occupa lo schermo intero */
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.text-block {
		position: absolute; /* Entrambi i blocchi occupano lo stesso spazio centrale sovrapposto */
		width: 100%;
		max-width: 70%;
		padding: 0 var(--spacing-4);
		text-align: center;
		will-change: transform, opacity;
	}

	.text-block-current {
		z-index: 1;
	}

	.text-block-next {
		z-index: 0;
	}

	.caption {
		text-align: center;
		margin: var(--spacing-4) 0;
		line-height: 1.5;
	}

	.gradient-animated {
		background: linear-gradient(
			120deg,
			var(--archetipi-favorito),
			var(--archetipi-insoddisfatto),
			var(--archetipi-infortunato)
		);
		background-size: 300% 100%;
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		animation: global-shift-gradient 6s linear infinite;
	}

	@keyframes global-shift-gradient {
		0% {
			background-position: 0% center;
		}
		50% {
			background-position: 100% center;
		}
		100% {
			background-position: 0% center;
		}
	}

	/* Sezione 3: Messaggio conclusivo */
	.section-3 {
		background-color: var(--background-primary);
	}

	.important {
		text-align: center;
		margin: 0;
		line-height: 1.4;
		max-width: 70%;
	}
</style>