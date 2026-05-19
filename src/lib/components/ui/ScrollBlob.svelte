<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	gsap.registerPlugin(ScrollTrigger);

	/** @type {SVGGElement | null} */
	let blobContainer1;
	/** @type {SVGGElement | null} */
	let blobContainer2;
	/** @type {HTMLDivElement | null} */
	let blobText;

	const pathData = 'M481.115 405.442C181.913 138.178 -223.629 419.158 -389 593.056L-338.761 931.321C-203.859 847.161 126 304.237 323 931.321C350.247 1018.05 421.997 1054.57 517.5 1059.7C754.61 1072.42 1138.14 891.593 1350.53 805.082C1648.48 683.725 1770.59 557.486 1740.58 284.085C1710.58 10.6835 1370.77 228.986 1133.53 521.916C896.286 814.846 855.118 739.521 481.115 405.442Z';

	onMount(() => {
		gsap.set([blobContainer1, blobContainer2, blobText], { opacity: 0 });

		const ctx = gsap.context(() => {
			gsap.to([blobContainer1, blobContainer2, blobText], {
				opacity: 1,
				duration: 2,
				ease: 'power1.out',
				stagger: 0.6,
				scrollTrigger: {
					trigger: '.blob-section',
					start: 'top 80%',
					end: 'bottom 100%',
					scrub: 1.5
				}
			});

			// 静止时持续漂浮的动画
			gsap.to(blobContainer1, {
				y: '+=40',
				x: '-=15',
				rotation: '+=8',
				duration: 5,
				repeat: -1,
				yoyo: true,
				ease: 'sine.inOut'
			});

			gsap.to(blobContainer2, {
				y: '+=40',
				x: '+=18',
				rotation: '-=10',
				duration: 6,
				repeat: -1,
				yoyo: true,
				ease: 'sine.inOut'
			});
		});

		return () => ctx.revert();
	});
</script>

<section class="blob-section">
	<div bind:this={blobText} class="blob-text">
		FAVORITO
	</div>
	<svg
		class="blob-svg"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 1280 1311"
		preserveAspectRatio="xMidYMid slice"
	>
		<defs>
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
			<g bind:this={blobContainer2} class="blob-back">
				<path d={pathData} fill="#3555A0" />
			</g>
		</g>

		<g filter="url(#filter0_fgn_600_977)">
			<g bind:this={blobContainer1}>
				<path d={pathData} fill="#6A96DF" />
			</g>
		</g>
	</svg>
</section>

<style>
	.blob-section {
		position: relative;
		min-height: 100vh;
		overflow: hidden;
	}

	.blob-svg {
		position: sticky;
		top: 0;
		width: 100%;
		height: 100vh;
		pointer-events: none;
	}

	.blob-text {
		position: sticky;
		top: 50vh;
		left: 50%;
		z-index: 10;
		text-align: center;
		font-family: "Rethink Sans";
		font-size: 128px;
		font-style: normal;
		font-weight: 800;
		line-height: normal;
		background: linear-gradient(90deg, rgba(255, 255, 255, 0.40) 0.01%, #FFF 13.17%, rgba(255, 255, 255, 0.92) 46.38%, rgba(255, 255, 255, 0.40) 63.95%, #FFF 101.54%);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		pointer-events: none;
	}

	.blob-back {
		position: absolute;
		top: 10%;
		left: 0;
		transform: translateX(-30%);
		opacity: 0.8;
	}
</style>
