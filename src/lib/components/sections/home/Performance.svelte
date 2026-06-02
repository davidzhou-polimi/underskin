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
			La performance non consuma solo il corpo: <br />
			modella <span class="gradient-text animate-gradient-text my-archetypes-color">identità</span>,
			<span class="gradient-text animate-gradient-text my-archetypes-color">abitudini</span> e
			<span class="gradient-text animate-gradient-text my-archetypes-color">ossessioni</span>.<br />
			Nel tempo emergono schemi ricorrenti, modi<br />
			diversi di vivere il peso della performance.
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
		font-size: var(--text-l);
		line-height: 1.5;
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
</style>
