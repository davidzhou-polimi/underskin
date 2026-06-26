<script>
	import { introReveal } from '$lib/actions/home/introReveal.js';
</script>

<section class="intro-section" use:introReveal>
	<svg class="circles-svg" viewBox="0 0 800 800" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
		<circle class="intro-circle circle-inner" cx="400" cy="400" r="275"
			fill="none"
			stroke="var(--content-primary)"
			stroke-opacity="0.38"
			stroke-width="2"
			stroke-dasharray="0 11"
			stroke-linecap="round"
		/>
		<circle class="intro-circle circle-middle" cx="400" cy="400" r="445"
			fill="none"
			stroke="var(--content-primary)"
			stroke-opacity="0.24"
			stroke-width="2"
			stroke-dasharray="0 11"
			stroke-linecap="round"
		/>
		<circle class="intro-circle circle-outer" cx="400" cy="400" r="630"
			fill="none"
			stroke="var(--content-primary)"
			stroke-opacity="0.13"
			stroke-width="2"
			stroke-dasharray="0 11"
			stroke-linecap="round"
		/>
	</svg>

	<h1 class="intro-title">UnderSkin</h1>

	<div class="scroll-hint" aria-label="Scorri per iniziare">
		<div class="scroll-hint-content">
			<span class="scroll-label">Scorri per iniziare</span>
			<svg class="scroll-arrow" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
				<path d="M12 5v14M5 12l7 7 7-7" stroke="var(--content-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
			</svg>
		</div>
	</div>
</section>

<style>
	.intro-section {
		position: relative;
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: transparent;
		overflow: hidden;
		perspective: 1200px;
		transform-style: preserve-3d;
	}

	.circles-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		overflow: visible;
		transform-style: preserve-3d;
		will-change: transform;
	}

	.intro-title {
		position: relative;
		z-index: 1;
		margin: 0;
		font-family: var(--font-family-base);
		font-size: var(--text-title-size);
		font-weight: var(--text-title-weight);
		color: var(--content-primary);
		line-height: 1;
		transform-style: preserve-3d;
		will-change: transform;
	}

	.scroll-hint {
		position: absolute;
		bottom: var(--spacing-8);
		left: 50%;
		transform: translateX(-50%);
		z-index: 1;
	}

	.scroll-hint-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-1);
	}

	.scroll-label {
		font-family: var(--font-family-base);
		font-size: var(--text-service-size);
		font-weight: var(--text-service-weight);
		color: var(--content-secondary);
	}

	.scroll-arrow {
		display: block;
		opacity: 0.6;
	}
</style>

