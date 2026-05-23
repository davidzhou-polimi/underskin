<script>
	import Bottone from '$lib/components/ui/Bottone.svelte';
	import { goto } from '$app/navigation';
</script>

<main>
	<section class="page-section">
		<Bottone
			class="page-bottone"
			text="Torna alla Narrazione Principale"
			onclick={() => goto('/')}
		/>
	</section>
</main>

<style>
	.page-section {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-background-primary);
		position: relative;
	}

	:global(.page-bottone) {
		position: absolute;
		bottom: 146px;
		left: 50%;
		transform: translateX(-50%);
	}
</style>
