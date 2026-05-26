<script>
	import IntroTextSection from '$lib/components/sections/IntroTextSection.svelte';
	import CerchiQuiz from '$lib/components/ui/CerchiQuiz.svelte';
	import PerformanceSection from '$lib/components/sections/PerformanceSection.svelte';
</script>

<main>
	<IntroTextSection />
	<section class="cerchi-quiz-section">
		<CerchiQuiz />
	</section>
	<PerformanceSection />
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
