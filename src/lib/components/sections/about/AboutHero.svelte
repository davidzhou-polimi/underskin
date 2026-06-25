<section class="about-hero">
	<h1 class="title">
		L'atleta dietro la <br />
		<span class="gradient-text animate-gradient-text my-archetypes-color">performance</span>
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
		line-height: 1;
	}

	.my-archetypes-color {
		/* Collega i tre archetipi principali al gradiente animato globale */
		--gradient-c1: var(--archetipi-favorito);
		--gradient-c2: var(--archetipi-insoddisfatto);
		--gradient-c3: var(--archetipi-infortunato);
	}
</style>
