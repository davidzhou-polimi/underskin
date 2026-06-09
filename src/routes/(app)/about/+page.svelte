<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import AboutSection from '$lib/components/sections/about/About.svelte';
	import ArchetypeSection from '$lib/components/sections/archetypes/ArchetypeSection.svelte';
	import Footer from '$lib/components/sections/home/Footer.svelte';
	import InteractiveGradient from '$lib/components/ui/InteractiveGradient.svelte';
	import { trackScrollProgress } from '$lib/actions/trackScrollProgress.js';

	// Configurazione cromatica universale bilanciata per lo sfondo
	const defaultColors = [
		'#6a96df', // Favorito (Azzurro/Teal)
		'#8035d2', // Insoddisfatto (Viola)
		'#d86143'  // Infortunato (Arancione/Salmone)
	];

	// Commento solo il PERCHÉ: definisce i membri del team con l'immagine di anteprima temporanea ed alternanza cromatica (viola, azzurro, arancione)
	const teamMembers = [
		{ name: "Fang Ding", type: "insoddisfatto", imageSrc: "/images/athletes/ilia-malinin.png" },
		{ name: "Chiara Fois", type: "favorito", imageSrc: "/images/athletes/ilia-malinin.png" },
		{ name: "Ilaria La Spada", type: "infortunato", imageSrc: "/images/athletes/ilia-malinin.png" },
		{ name: "Ziying Shao", type: "insoddisfatto", imageSrc: "/images/athletes/ilia-malinin.png" },
		{ name: "Lucrezia Vallar", type: "favorito", imageSrc: "/images/athletes/ilia-malinin.png" },
		{ name: "David Zhou", type: "infortunato", imageSrc: "/images/athletes/ilia-malinin.png" }
	];

	let activeConfig = $state({
		colors: defaultColors,
		speed: 0.45,
		noiseSteps: 6.0,
		mouseStrength: 0.15
	});

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		// Commento solo il PERCHÉ: accelera il movimento del gradiente in prossimità del footer per dare intensità cromatica
		ScrollTrigger.create({
			trigger: 'footer',
			start: 'top bottom',
			end: 'bottom bottom',
			onUpdate: (self) => {
				if (self.isActive) {
					activeConfig.speed = 1.2;
					activeConfig.noiseSteps = 12.0;
				} else {
					activeConfig.speed = 0.45;
					activeConfig.noiseSteps = 6.0;
				}
			},
			refreshPriority: 0.8
		});
	});
</script>

<svelte:head>
	<title>About - UnderSkin</title>
	<meta name="description" content="Chi siamo e la filosofia dietro il progetto UnderSkin." />
</svelte:head>

<InteractiveGradient config={activeConfig} />

<main id="about" use:trackScrollProgress>
	<AboutSection />
	<ArchetypeSection 
		title="Il Nostro Team!" 
		items={teamMembers} 
		clickable={false} 
	/>
	<Footer />
</main>

<style>
	#about {
		position: relative;
		width: 100%;
		min-height: 100vh;
		/* Commento solo il PERCHÉ: mantiene lo sfondo trasparente esponendo il canvas fixed */
		background: transparent;
	}
</style>
