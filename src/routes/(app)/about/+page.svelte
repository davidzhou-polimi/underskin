<script>
	/**
	 * Assunzioni per questa pagina rotta:
	 * 1. Questa è la pagina About temporaneamente vuota.
	 * 2. Eredita automaticamente la Navbar dal layout di gruppo (app).
	 * 3. Utilizziamo <svelte:head> per impostare i metadati SEO iniziali.
	 */
</script>

<svelte:head>
	<title>About — UnderSkin</title>
	<meta name="description" content="Chi siamo e la filosofia dietro il progetto UnderSkin." />
</svelte:head>

<main id="about">
	<div class="about-container">
		<h1 class="about-title">About</h1>
		<p class="about-placeholder">La filosofia ed il team dietro al progetto UnderSkin.</p>
	</div>
</main>

<style>
	#about {
		width: 100%;
		min-height: 100vh;
		background-color: var(--background-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-6) var(--spacing-4);
	}

	.about-container {
		text-align: center;
		font-family: var(--font-family-base);
		color: var(--content-primary);
	}

	.about-title {
		font-size: var(--text-xl);
		font-weight: 700;
		margin-bottom: var(--spacing-2);
	}

	.about-placeholder {
		font-size: var(--text-s);
		color: var(--neutral-500);
	}
</style>
