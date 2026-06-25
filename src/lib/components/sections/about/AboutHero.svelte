<section class="about-hero">
	<h1 class="title">
		L'atleta dietro la <br />
		performance
	</h1>
</section>

<style>
	.about-hero {
		width: 100%;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-6) var(--spacing-4);
		/* Consente la trasparenza per esporre il canvas InteractiveGradient */
		background-color: transparent;
	}

	.title {
		text-align: center;
		max-width: 90%;
		line-height: 1.05;
		/* Commento solo il PERCHÉ: imposta una dimensione intermedia personalizzata di 7rem 
		   per ridurre leggermente l'ingombro visivo del titolo principale su schermi desktop */
		font-size: 7rem; /* token approssimativo */
		/* Commento solo il PERCHÉ: utilizza il token di colore bianco ghiaccio del brand 
		   per creare un contrasto ottimale sullo sfondo scuro animato */
		color: var(--neutral-50);
	}
</style>
