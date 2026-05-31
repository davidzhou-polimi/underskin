<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { trackSection } from '$lib/actions/trackSection.js';
	import { layers } from '$lib/stores/layers.svelte.js';

	let contentWrapper;
	let isVisible = $state(false);
	let hasAnimated = $state(false);

	let opacity = $derived.by(() => {
		return layers.getLayerOpacity(2);
	});
	let layerStyle = $derived(layers.getLayerStyle(2));

	onMount(() => {
		// Imposta stato iniziale con blur come nell'azione blurScrollReveal
		gsap.set('.perf-quote', {
			opacity: 0,
			filter: 'blur(15px)',
			y: 20
		});
	});

	$effect(() => {
		if (opacity > 0 && !hasAnimated) {
			isVisible = true;
			setTimeout(() => {
				animateQuote();
			}, 100);
		}

		if (opacity === 0) {
			isVisible = false;
			hasAnimated = false;
		}
	});

	function animateQuote() {
		if (hasAnimated) return;

		// Animazione blur come in blurScrollReveal
		gsap.to('.perf-quote', {
			opacity: 1,
			filter: 'blur(0px)',
			y: 0,
			duration: 1,
			ease: 'power2.out',
			onComplete: () => {
				hasAnimated = true;
			}
		});
	}
</script>

<section id="performance" class="performance-section" style:opacity={opacity} style={layerStyle} use:trackSection>
	<div class="perf-content" bind:this={contentWrapper}>
		<blockquote class="perf-quote">
			La performance non consuma solo il corpo: modella
			<span class="gradient-text animate-gradient-text my-archetypes-color">identità, abitudini e ossessioni</span>.
			Nel tempo emergono schemi ricorrenti, modi diversi di vivere il peso della performance.
		</blockquote>
	</div>
</section>

<style>
	.performance-section {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 80px;
		background-color: var(--background-primary);
		will-change: opacity;
	}

	.perf-quote {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: var(--text-important-weight);
		font-size: var(--text-title);
		line-height: 1.6;
		color: var(--content-primary);
		text-align: center;
		margin: 0;
		padding: 0;
		border: none;
	}

	.my-archetypes-color {
		--gradient-c1: var(--archetipi-favorito);
		--gradient-c2: var(--archetipi-insoddisfatto);
		--gradient-c3: var(--archetipi-infortunato);
	}

	.gradient-text {
		background: linear-gradient(90deg, var(--gradient-c1), var(--gradient-c2), var(--gradient-c3));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	@keyframes gradient-shift {
		0%, 100% { background-position: 0% 50%; }
		50% { background-position: 100% 50%; }
	}

	.animate-gradient-text {
		background-size: 200% 200%;
		animation: gradient-shift 3s ease infinite;
	}
</style>
