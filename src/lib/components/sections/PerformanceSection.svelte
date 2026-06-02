<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import { trackSection } from '$lib/actions/trackSection.js';

	let contentWrapper;

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		// Impostiamo lo stato iniziale del testo (sfocato e traslato verso il basso)
		gsap.set('.perf-quote', {
			opacity: 0,
			filter: 'blur(15px)',
			y: 20
		});

		// Attiviamo l'animazione quando la sezione entra in vista
		const st = gsap.to('.perf-quote', {
			opacity: 1,
			filter: 'blur(0px)',
			y: 0,
			duration: 1.2,
			ease: 'power2.out',
			scrollTrigger: {
				trigger: '#performance',
				start: 'top 75%',
				toggleActions: 'play none none reverse'
			}
		});

		return () => {
			if (st.scrollTrigger) {
				st.scrollTrigger.kill();
			}
			st.kill();
		};
	});
</script>

<section id="performance" class="performance-section" use:trackSection>
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
		position: relative;
		width: 100%;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 80px;
		background-color: var(--background-primary);
	}

	.perf-quote {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: var(--text-important-weight);
		/* Usa il token standard per testi importanti in quanto --text-title è ridondante */
		font-size: var(--text-important-size);
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
