<script>
	/**
	 * Assunzioni per questa pagina rotta:
	 * 1. Questa pagina funge da puro orchestratore sequenziale delle sezioni del profilo "L'infortunato".
	 * 2. Ciascun componente gestisce autonomamente la propria veste grafica e i propri sfondi.
	 * 3. Il testo narrativo e i tooltip sono definiti qui e iniettati come snippet children in NarrativeSection.
	 */

	import HeroSection from '$lib/components/sections/HeroSection.svelte';
	import ShatterGlass from '$lib/components/sections/infortunato/ShatterGlass.svelte';
	import NarrativeSection from '$lib/components/sections/NarrativeSection.svelte';
	import ZoomTransitionSection from '$lib/components/sections/ZoomTransitionSection.svelte';
	import { tooltip } from '$lib/stores/tooltipState.svelte.js';

	const textKinesiophobia = "Ansia della prestazione legata al timore di non riuscire a raggiungere un determinato obiettivo.";
	const textResetMentale = "Improvviso calo delle prestazioni in situazioni ad alta pressione. L'ansia interferisce con l'esecuzione automatica di competenze consolidate.";
</script>


<!-- SEO Best Practices: Titolo descrittivo e meta description unici per questa pagina -->
<svelte:head>
	<title>Infortunato — UnderSkin</title>
	<meta 
		name="description" 
		content="Analisi dell'archetipo dell'Infortunato: calo delle prestazioni in situazioni ad alta pressione, dinamiche di ansia e blocco dell'automatismo psicomotorio." 
	/>
</svelte:head>

<main id="infortunato-profile-page">
	<!-- 1. Sezione di benvenuto con sfondo arancione caldo -->
	<HeroSection 
		theme="infortunato" 
		title="L'INFORTUNATO" 
		sectionId="infortunato-hero"
		bg="var(--arancione-900)"
		blob1="var(--arancione-500)"
		blob2="var(--arancione-700)"
		textShadow="none"
	/>

	<!-- 2. Sezione interattiva di scorrimento Voronoi con sfondo azzurro-ghiaccio -->
	<ShatterGlass />

	<!-- 3. Sezione narrativa di superamento e reset psicofisico post-recupero -->
	<NarrativeSection theme="infortunato" sectionId="infortunato-narrative">
		Dopo il recupero, molti atleti convivono con<br />
		la 
		<span 
			class="highlighted-keyword gradient-text animate-gradient-text keyword-color"
			role="tooltip"
			tabindex="-1"
			onmouseenter={() => tooltip.show(textKinesiophobia, 'paragrafo')}
			onmouseleave={() => tooltip.hide()}
		>
			kinesiophobia
		</span> 
		e perdita di fiducia.
		<br /><br />
		Tornare davvero in campo significa affrontare<br />
		un processo di 
		<span 
			class="highlighted-keyword gradient-text animate-gradient-text keyword-color"
			role="tooltip"
			tabindex="-1"
			onmouseenter={() => tooltip.show(textResetMentale, 'paragrafo')}
			onmouseleave={() => tooltip.hide()}
		>
			reset mentale
		</span>: smettendo di <br />
		competere con il ricordo del dolore.
	</NarrativeSection>

	<!-- 4. Sezione di transizione zoom verso i casi reali di Milano Cortina 2026 -->
	<ZoomTransitionSection theme="infortunato" />
</main>

<style>
	/* Stili del contenitore principale che ospita gli elementi della pagina del profilo, isolando lo scorrimento orizzontale */
	#infortunato-profile-page {
		position: relative;
		width: 100%;
		min-height: 100vh;
		background-color: var(--background-primary);
		overflow-x: hidden;
	}
</style>
