<script>
	import CerchiQuiz from '$lib/components/ui/CerchiQuiz.svelte';
</script>

<svelte:head>
	<title>CerchiQuiz Test</title>
</svelte:head>

<main>
	<section class="test-section">
		<h1>CerchiQuiz Test Page</h1>
		
		<div class="test-item">
			<h2>Default</h2>
			<CerchiQuiz property1="Default" />
		</div>
		
		<div class="test-item">
			<h2>Over 1 (hover)</h2>
			<CerchiQuiz property1="over 1" />
		</div>
		
		<div class="test-item">
			<h2>Over 2 (hover)</h2>
			<CerchiQuiz property1="over 2" />
		</div>
		
		<div class="test-item">
			<h2>Click 1</h2>
			<CerchiQuiz property1="click1" />
		</div>
		
		<div class="test-item">
			<h2>Click 2</h2>
			<CerchiQuiz property1="click2" />
		</div>
	</section>
</main>

<style>
	main {
		min-height: 100vh;
		background-color: var(--color-background-primary);
		padding: 40px;
	}
	
	.test-section {
		max-width: 1200px;
		margin: 0 auto;
	}
	
	h1 {
		font-family: 'Rethink Sans', sans-serif;
		font-size: 32px;
		color: var(--color-content-primary);
		margin-bottom: 40px;
	}
	
	h2 {
		font-family: 'Rethink Sans', sans-serif;
		font-size: 20px;
		color: var(--color-content-primary);
		margin-bottom: 20px;
	}
	
	.test-item {
		margin-bottom: 60px;
		padding: 40px;
		background: white;
		border-radius: 16px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
