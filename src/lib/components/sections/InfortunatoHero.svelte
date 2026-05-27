<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import DecorativeCircle from '$lib/components/ui/DecorativeCircle.svelte';
	import { trackSection } from '$lib/actions/trackSection.js';

	gsap.registerPlugin(ScrollTrigger);

	/** @type {SVGPathElement | null} */
	let blobContainer1 = null;
	/** @type {SVGPathElement | null} */
	let blobContainer2 = null;
	/** @type {HTMLHeadingElement | null} */
	let blobText = null;
	/** @type {HTMLElement | null} */
	let sectionRef = null;

	// Dati del tracciato SVG per la morfologia fluida del blob organico di sfondo
	const pathData = 'M481.115 405.442C181.913 138.178 -223.629 419.158 -389 593.056L-338.761 931.321C-203.859 847.161 126 304.237 323 931.321C350.247 1018.05 421.997 1054.57 517.5 1059.7C754.61 1072.42 1138.14 891.593 1350.53 805.082C1648.48 683.725 1770.59 557.486 1740.58 284.085C1710.58 10.6835 1370.77 228.986 1133.53 521.916C896.286 814.846 855.118 739.521 481.115 405.442Z';

	onMount(() => {
		// Previene eccezioni ed esecuzioni premature durante il rendering lato server (SSR) o se il DOM non è pronto
		if (!blobContainer1 || !blobContainer2 || !blobText || !sectionRef) return;

		const el1 = blobContainer1;
		const el2 = blobContainer2;
		const txt = blobText;
		const sec = sectionRef;

		gsap.set([el1, el2, txt], { opacity: 1 });

		const ctx = gsap.context(() => {
			// Crea una transizione di parallasse per sfumare i blob man mano che l'utente scorre verso il basso
			gsap.fromTo([el1, el2], 
				{ opacity: 1 },
				{
					opacity: 0.3,
					scrollTrigger: {
						trigger: sec,
						start: 'top top',
						end: 'bottom top',
						scrub: true
					}
				}
			);

			// Gestisce il progressivo dissolversi e lo spostamento verticale del titolo durante lo scroll
			gsap.fromTo(txt,
				{ opacity: 1, y: 0 },
				{
					opacity: 0,
					y: -50,
					scrollTrigger: {
						trigger: sec,
						start: 'top top',
						end: 'bottom 50%',
						scrub: true
					}
				}
			);

			// Mantiene il primo blob in una leggera fluttuazione asincrona e organica costante
			gsap.to(el1, {
				y: '+=40',
				x: '-=20',
				rotation: '+=6',
				duration: 6,
				repeat: -1,
				yoyo: true,
				ease: 'sine.inOut'
			});

			// Introduce una variazione di fase e direzione per la fluttuazione del secondo blob per evitare simmetrie artificiali
			gsap.to(el2, {
				y: '+=30',
				x: '+=20',
				rotation: '-=8',
				duration: 7,
				repeat: -1,
				yoyo: true,
				ease: 'sine.inOut'
			});
		});

		// Evita perdite di memoria e conflitti disattivando tutti i trigger e le animazioni associate
		return () => ctx.revert();
	});
</script>

<section id="infortunato-hero" class="blob-section" bind:this={sectionRef} use:trackSection={{ id: 'infortunato-hero' }}>
	<div class="circles-layer">
		<DecorativeCircle />
	</div>
	
	<div class="sticky-viewport">
		<div class="text-container">
			<h1 bind:this={blobText} class="blob-text">
				L'INFORTUNATO
			</h1>
		</div>

		<svg
			class="blob-svg"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 1280 1311"
			preserveAspectRatio="xMidYMid slice"
		>
			<defs>
				<!-- Configura filtri per simulare una texture analogica e organica sopra le forme vettoriali -->
				<filter id="filter0_fgn_600_977" x="-639" y="-91" width="2634" height="1401.34" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
					<feFlood flood-opacity="0" result="BackgroundImageFix"/>
					<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
					<feGaussianBlur stdDeviation="85" result="effect1_foregroundBlur_600_977"/>
					<feTurbulence type="fractalNoise" baseFrequency="0.333 0.333" numOctaves="3" seed="1910"/>
					<feDisplacementMap in="effect1_foregroundBlur_600_977" scale="40" xChannelSelector="R" yChannelSelector="G" result="displacedImage"/>
					<feMerge result="effect2_texture_600_977">
						<feMergeNode in="displacedImage"/>
					</feMerge>
					<feTurbulence type="fractalNoise" baseFrequency="100 100" stitchTiles="stitch" numOctaves="3" result="noise" seed="2540"/>
					<feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise"/>
					<feComponentTransfer in="alphaNoise" result="coloredNoise1">
						<feFuncA type="discrete" tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0"/>
					</feComponentTransfer>
					<feComposite operator="in" in2="effect2_texture_600_977" in="coloredNoise1" result="noise1Clipped"/>
					<feFlood flood-color="rgba(0, 0, 0, 0.15)" result="color1Flood"/>
					<feComposite operator="in" in2="noise1Clipped" in="color1Flood" result="color1"/>
					<feMerge result="effect3_noise_600_977">
						<feMergeNode in="effect2_texture_600_977"/>
						<feMergeNode in="color1"/>
					</feMerge>
				</filter>
			</defs>

			<g filter="url(#filter0_fgn_600_977)">
				<g class="blob-back">
					<!-- Utilizza il tono medio arancione scuro per creare una silhouette di contrasto profonda -->
					<path bind:this={blobContainer2} d={pathData} fill="var(--arancione-700)" />
				</g>
			</g>

			<g filter="url(#filter0_fgn_600_977)">
				<g>
					<!-- Utilizza il tono arancione vibrante principale per il blob in primo piano per definire l'archetipo dell'Infortunato -->
					<path bind:this={blobContainer1} d={pathData} fill="var(--arancione-500)" />
				</g>
			</g>
		</svg>
	</div>
</section>

<style>
	.blob-section {
		position: relative;
		width: 100%;
		height: 100vh;
		/* Ancorato alla scala cromatica dell'arancione stabilita nel design system globale */
		background-color: var(--arancione-900);
	}
	.sticky-viewport {
		position: sticky;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		overflow: hidden;
	}
	.circles-layer {
		position: absolute;
		inset: 0;
		z-index: 1;
		pointer-events: none;
	}
	.blob-svg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 0;
	}
	.text-container {
		position: absolute;
		inset: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 10;
		padding: 0 2rem;
		pointer-events: none;
	}
	.blob-text {
		text-align: center;
		margin: 0;
		white-space: normal;
		word-wrap: break-word;
		max-width: 100%;
		font-size: var(--text-title-size);
		font-weight: var(--text-title-weight);
		color: var(--background-primary);
		line-height: 1.1;
	}
	.blob-back {
		position: absolute;
		top: 10%;
		left: 0;
		transform: translateX(-30%);
		opacity: 0.8;
	}
</style>
