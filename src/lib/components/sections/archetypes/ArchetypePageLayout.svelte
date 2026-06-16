<script>
	import InteractiveGradient from '$lib/components/ui/InteractiveGradient.svelte';
	import HeroSection from './HeroSection.svelte';
	import NarrativeText from './NarrativeText.svelte';
	import ZoomTransition from './ZoomTransition.svelte';
	import AthleteSection from './AthleteSection.svelte';
	import ContinueNarrationSection from './ContinueNarrationSection.svelte';
	import { createArchetypeGradientConfig } from '$lib/stores/scrollGradient.svelte.js';
	import { trackScrollProgress } from '$lib/actions/trackScrollProgress.js';

	/**
	 * @typedef {{ type: 'text' | 'keyword', content: string, tooltip?: string }} Segment
	 *
	 * @typedef {Object} ArchetypeStaticConfig
	 * @property {string} title
	 * @property {string} heroSectionId
	 * @property {string} narrativeSectionId
	 * @property {string[]} colors
	 * @property {Segment[]} segments
	 *
	 * @typedef {Object} Props
	 * @property {'favorito' | 'infortunato' | 'insoddisfatto'} archetype
	 * @property {import('svelte').Snippet} uniqueSection
	 */

	/** @type {Record<'favorito' | 'infortunato' | 'insoddisfatto', ArchetypeStaticConfig>} */
	const ARCHETYPE_CONFIG = {
		favorito: {
			title: 'IL FAVORITO',
			heroSectionId: 'favorito-hero',
			narrativeSectionId: 'favorito-narrative',
			colors: ['var(--azzurro-200)', 'var(--archetipi-favorito)', 'var(--azzurro-600)'],
			segments: [
				{
					type: 'text',
					content:
						"Quando l'aspettativa esterna si fa insostenibile,<br />la pressione cresce fino a diventare "
				},
				{
					type: 'keyword',
					content: 'Fear of Failure',
					tooltip:
						'Ansia della prestazione legata al timore di non riuscire a raggiungere un determinato obiettivo.'
				},
				{
					type: 'text',
					content: '.<br /><br />Il bisogno ossessivo di essere perfetti porta spesso<br />al '
				},
				{
					type: 'keyword',
					content: 'Choking Under Pressure',
					tooltip:
						"Improvviso calo delle prestazioni in situazioni ad alta pressione. L'ansia interferisce con l'esecuzione automatica di competenze consolidate."
				},
				{
					type: 'text',
					content: ": un blocco in cui la mente<br />ostacola ciò che l'allenamento aveva reso naturale."
				}
			]
		},
		infortunato: {
			title: "L'INFORTUNATO",
			heroSectionId: 'infortunato-hero',
			narrativeSectionId: 'recovery',
			colors: ['var(--arancione-200)', 'var(--archetipi-infortunato)', 'var(--arancione-600)'],
			segments: [
				{ type: 'text', content: 'Dopo il recupero, molti atleti convivono con<br />la ' },
				{
					type: 'keyword',
					content: 'kinesiophobia',
					tooltip:
						'Ansia della prestazione legata al timore di non riuscire a raggiungere un determinato obiettivo.'
				},
				{
					type: 'text',
					content:
						' e perdita di fiducia.<br /><br />Tornare davvero in campo significa affrontare<br />un processo di '
				},
				{
					type: 'keyword',
					content: 'reset mentale',
					tooltip:
						"Improvviso calo delle prestazioni in situazioni ad alta pressione. L'ansia interferisce con l'esecuzione automatica di competenze consolidate."
				},
				{ type: 'text', content: ': smettendo di <br />competere con il ricordo del dolore.' }
			]
		},
		insoddisfatto: {
			title: "L'INSODDISFATTO",
			heroSectionId: 'insoddisfatto-hero',
			narrativeSectionId: 'insoddisfatto-narrative',
			colors: ['var(--viola-200)', 'var(--archetipi-insoddisfatto)', 'var(--viola-600)'],
			segments: [
				{
					type: 'text',
					content:
						"A volte il podio non basta. Chi arriva più vicino all'oro<br />è spesso quello che fa più fatica ad accettare<br />il risultato, intrappolato dal "
				},
				{
					type: 'keyword',
					content: 'pensiero controfattuale',
					tooltip:
						'Tendenza a ricostruire mentalmente eventi passati immaginando esiti alternativi, valutando come scelte o circostanze diverse avrebbero potuto cambiare il risultato.'
				},
				{ type: 'text', content: '.<br /><br />Viene definito il ' },
				{
					type: 'keyword',
					content: "paradosso dell'argento",
					tooltip:
						"Gli atleti con l'argento spesso sono meno soddisfatti di quelli con il bronzo, perché pensano alla vittoria mancata. \nLa soddisfazione dipende quindi più dal confronto mentale che dal risultato reale."
				},
				{
					type: 'text',
					content:
						': la mente<br />continua a guardare ciò che è mancato, cancellando<br />quello che è stato raggiunto.'
				}
			]
		}
	};

	/** @type {Props} */
	let { archetype, uniqueSection } = $props();

	const config = ARCHETYPE_CONFIG[archetype];
	const gradient = createArchetypeGradientConfig(config.colors);
</script>

<svelte:window bind:scrollY={gradient.scrollY} bind:innerHeight={gradient.innerHeight} />

<InteractiveGradient config={gradient.activeConfig} />

<main id="{archetype}-profile-page" use:trackScrollProgress>
	<HeroSection theme={archetype} title={config.title} sectionId={config.heroSectionId} textShadow="none" />

	{@render uniqueSection()}

	<NarrativeText sectionId={config.narrativeSectionId} theme={archetype} segments={config.segments} />

	<ZoomTransition theme={archetype}>
		{#snippet children()}
			<AthleteSection type={archetype} />
		{/snippet}
	</ZoomTransition>

	<ContinueNarrationSection {archetype} />
	<section class="scroll-spacer" aria-hidden="true"></section>
</main>

<style>
	main {
		position: relative;
		width: 100%;
		min-height: 100vh;
		background-color: transparent;
		overflow-x: hidden;
	}
</style>
