<script>
	import HeroSection from '$lib/components/sections/HeroSection.svelte';
	import CerchiQuiz from '$lib/components/ui/CerchiQuiz.svelte';
	import CerchiConRisultati from '$lib/components/ui/CerchiConRisultati.svelte';
</script>

<main>
	<HeroSection />
	<section class="cerchi-quiz-section">
		<CerchiQuiz property1="Default" />
	</section>
	<section class="cerchi-risultati-section" id="cerchi-risultati">
		<CerchiConRisultati />
	</section>
</main>

<style>
	.cerchi-quiz-section {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-background-primary);
	}

	.cerchi-risultati-section {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-background-primary);
	}
</style>
