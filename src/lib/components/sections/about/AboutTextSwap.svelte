<script>
	import { scrollableTextSwap } from '$lib/actions/about/scrollableTextSwap.js';
</script>

<section class="about-text-swap" use:scrollableTextSwap>
	<div class="text-container">
		<div class="text-block text-block-current">
			<h4 class="caption">
				Le Olimpiadi Milano Cortina 2026 sono un sistema di misurazione millimetrica: <br />centesimi di
				secondo, punteggi decimali, medaglieri rigidi.
			</h4>
			<h4 class="caption gradient-animated">
				Ma cosa succede quando riduciamo un essere umano a un puro dato oggettivo?
			</h4>
		</div>

		<div class="text-block text-block-next">
			<h4 class="caption">
				UnderSkin nasce per andare oltre il mito dell'atleta invincibile. Per scavare sotto la pelle
				della performance d'élite e dare spazio a ciò che raramente viene raccontato: la pressione delle
				aspettative, il peso psicologico del "quasi", le cadute silenziose e la lenta ricostruzione di sé
				dopo il dolore.
			</h4>
		</div>
	</div>
</section>

<style>
	.about-text-swap {
		position: relative;
		width: 100%;
		/* height: 100vh e display: block sono essenziali per il pinning di GSAP ScrollTrigger */
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
		/* Posizionamento assoluto per sovrapporre i blocchi al centro ed eseguire la transizione */
		position: absolute;
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
</style>
