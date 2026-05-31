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

	// Curva fluida per la forma organica del blob di sfondo
	const pathData = 'M481.115 405.442C181.913 138.178 -223.629 419.158 -389 593.056L-338.761 931.321C-203.859 847.161 126 304.237 323 931.321C350.247 1018.05 421.997 1054.57 517.5 1059.7C754.61 1072.42 1138.14 891.593 1350.53 805.082C1648.48 683.725 1770.59 557.486 1740.58 284.085C1710.58 10.6835 1370.77 228.986 1133.53 521.916C896.286 814.846 855.118 739.521 481.115 405.442Z';

	onMount(() => {
		// Evita esecuzioni premature prima che il DOM sia completamente pronto
		if (!blobContainer1 || !blobContainer2 || !blobText || !sectionRef) return;

		const el1 = blobContainer1;
		const el2 = blobContainer2;
		const txt = blobText;
		const sec = sectionRef;

		gsap.set([el1, el2, txt], { opacity: 1 });

		const ctx = gsap.context(() => {
			// Dissolve i blob gradualmente per dare una transizione fluida verso la sezione successiva
			gsap.fromTo([el1, el2], 
				{ opacity: 1 },
				{
					opacity: 0.35,
					scrollTrigger: {
						trigger: sec,
						start: 'top top',
						end: 'bottom top',
						scrub: true
					}
				}
			);

			// Dissolvenza e parallasse verticale del titolo durante lo scroll per aumentarne la profondità visiva
			gsap.fromTo(txt,
				{ opacity: 1, y: 0 },
				{
					opacity: 0,
					y: -80,
					scrollTrigger: {
						trigger: sec,
						start: 'top top',
						end: 'bottom 50%',
						scrub: true
					}
				}
			);

			// Fluttuazione organica continua asincrona per simulare dinamismo naturale (blob primario)
			gsap.to(el1, {
				y: '+=50',
				x: '-=30',
				rotation: '+=8',
				duration: 8,
				repeat: -1,
				yoyo: true,
				ease: 'sine.inOut'
			});

			// Fluttuazione con fase e direzione sfalsate per creare un senso di complessità asimmetrica (blob secondario)
			gsap.to(el2, {
				y: '+=40',
				x: '+=30',
				rotation: '-=10',
				duration: 9,
				repeat: -1,
				yoyo: true,
				ease: 'sine.inOut'
			});
		});

		// Cleanup obbligatorio di GSAP per scongiurare memory leak
		return () => ctx.revert();
	});
</script>

<section id="insoddisfatto-hero" class="blob-section" bind:this={sectionRef} use:trackSection={{ id: 'insoddisfatto-hero' }}>
	<div class="sticky-viewport">
		<!-- Livello intermedio dei cerchi decorativi posizionato per scorrere dietro la scritta del titolo -->
		<div class="circles-layer">
			<DecorativeCircle />
		</div>
		
		<div class="text-container">
			<h1 bind:this={blobText} class="blob-text">
				L'INSODDISFATTO
			</h1>
		</div>

		<svg
			class="blob-svg"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 1280 1311"
			preserveAspectRatio="xMidYMid slice"
		>
			<defs>
				<!-- Filtro di sfuocatura e distorsione texture a grana fine per simulare un effetto analogico e morbido -->
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
					<feFlood flood-color="rgba(0, 0, 0, 0.12)" result="color1Flood"/>
					<feComposite operator="in" in2="noise1Clipped" in="color1Flood" result="color1"/>
					<feMerge result="effect3_noise_600_977">
						<feMergeNode in="effect2_texture_600_977"/>
						<feMergeNode in="color1"/>
					</feMerge>
				</filter>
			</defs>

			<!-- Utilizziamo i colori viola per rispecchiare l'identità cromatica de L'Insoddisfatto -->
			<g filter="url(#filter0_fgn_600_977)">
				<g class="blob-back">
					<path bind:this={blobContainer2} d={pathData} fill="var(--viola-700)" />
				</g>
			</g>

			<g filter="url(#filter0_fgn_600_977)">
				<g>
					<path bind:this={blobContainer1} d={pathData} fill="var(--viola-500)" />
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
		/* Sfondo chiaro come da mockup per creare contrasto con i blob viola */
		background-color: var(--background-primary);
		overflow: hidden;
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

	/* Sovrascriviamo il colore dei pallini di sfondo per renderli visibili sullo sfondo chiaro */
	:global(#insoddisfatto-hero .circles-layer .dot),
	:global(#insoddisfatto-hero .circles-layer .dot-right) {
		fill: rgba(128, 53, 210, 0.09) !important;
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
		/* Il colore chiaro crea un effetto di ritaglio satinato sopra i blob viola scuri */
		color: var(--background-primary);
		line-height: 1.1;
		
		/* Morbido bagliore per impreziosire i contorni del testo in caso di sovrapposizioni parziali */
		text-shadow: 0 4px 40px rgba(128, 53, 210, 0.2);
	}
	.blob-back {
		position: absolute;
		top: 10%;
		left: 0;
		transform: translateX(-30%);
		opacity: 0.8;
	}
</style>
