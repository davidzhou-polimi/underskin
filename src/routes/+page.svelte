<script>
	import IntroTextSection from '$lib/components/sections/IntroTextSection.svelte';
	import CerchiQuiz from '$lib/components/ui/CerchiQuiz.svelte';
</script>

<main>
	<IntroTextSection />
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
		background-color: var(--background-primary);
	}
</style>
