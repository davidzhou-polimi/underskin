<script>
	/**
	 * Assunzioni per questa pagina rotta:
	 * 1. Questa è la homepage temporaneamente vuota.
	 * 2. Eredita automaticamente la Navbar dal layout di gruppo (app).
	 * 3. Le sezioni del profilo Favorito sono state correttamente spostate nella rotta dedicata /favorito.
	 */
</script>

<svelte:head>
	<title>Home — UnderSkin</title>
	<meta name="description" content="Chi siamo e la filosofia dietro il progetto UnderSkin." />
</svelte:head>

<div id="hero" class="empty-home-placeholder">
	<h1 class="home-title">Home</h1>
</div>

<style>
	/* Contenitore centrato a schermo intero per presentare visivamente la rotta Home */
	.empty-home-placeholder {
		width: 100%;
		min-height: 100vh;
		background-color: var(--background-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-family-base);
		color: var(--content-primary);
	}

	.home-title {
		font-size: var(--text-xl);
		font-weight: 700;
	}
</style>
