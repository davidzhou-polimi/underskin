<script>
	import IntroTextSection from '$lib/components/sections/IntroTextSection.svelte';
</script>

<main>
	<IntroTextSection />
</main>
	import CerchiQuiz from '$lib/components/ui/CerchiQuiz.svelte';
</script>

<main>
	<section class="cerchi-quiz-section">
		<CerchiQuiz />
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
</style>
