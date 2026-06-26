<script>
	import { performanceReveal } from '$lib/actions/home/performanceReveal.js';
</script>

<section 
	id="about-statement" 
	class="about-statement-section" 
>
	<div class="statement-content">
		<blockquote 
			class="statement-quote" 
			use:performanceReveal={{ triggerId: '#about-statement' }}
		>
			Riconoscere l'atleta dietro il dato è un 
			<span class="gradient-text animate-gradient-text my-archetypes-color">atto di empatia</span>,<br />
			il primo passo verso una cultura dello sport più umana.
		</blockquote>
	</div>
</section>

<style>
	.about-statement-section {
		position: relative;
		width: 100%;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 var(--spacing-6);
		/* Consente la trasparenza per esporre il canvas InteractiveGradient */
		background-color: transparent;
	}

	.statement-content {
		position: relative;
		z-index: 10;
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.statement-quote {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: var(--text-important-weight);
		/* Commento solo il PERCHÉ: utilizza il token --text-xl (3.5rem) per dare 
		   la massima forza visiva e autorevolezza alla dichiarazione di chiusura dell'About */
		font-size: var(--text-l);
		line-height: 1.5;
		color: var(--content-primary);
		text-align: center;
		margin: 0;
		padding: 0;
		border: none;
		/* Commento solo il PERCHÉ: espande la larghezza massima a var(--spacing-17) per evitare 
		   che il font più grande (3.5rem) mandi a capo le righe in modo indesiderato, 
		   mantenendo la citazione disposta esattamente su due righe pulite */
		max-width: var(--spacing-17);
	}

	.my-archetypes-color {
		/* Commento solo il PERCHÉ: associa le variabili del gradiente animato ai colori specifici 
		   dei tre archetipi per creare l'effetto cromatico corale UnderSkin */
		--gradient-c1: var(--archetipi-favorito);
		--gradient-c2: var(--archetipi-insoddisfatto);
		--gradient-c3: var(--archetipi-infortunato);
	}
</style>
