<script>
	// Importa qui in sequenza le macro-sezioni dalla cartella components/sections/
	import IntrusiveThoughts from '$lib/components/sections/IntrusiveThoughts.svelte';
</script>

<main>
	<!-- Impila qui le sezioni (l'aggiornamento dello store è gestito internamente tramite use:trackSection) -->
	<IntrusiveThoughts />
</main>
