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
	 * @property {Segment[][]} paragraphs
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
			paragraphs: [
				[
					{
						type: 'text',
						content: "Quando l'aspettativa esterna si fa insostenibile,\nla pressione cresce fino a diventare "
					},
					{
						type: 'keyword',
						content: 'Fear of Failure',
						tooltip:
							'Ansia della prestazione legata al timore di non riuscire a raggiungere un determinato obiettivo.'
					},
					{
						type: 'text',
						content: '.'
					}
				],
				[
					{
						type: 'text',
						content: 'Il bisogno ossessivo di essere perfetti porta spesso\nal '
					},
					{
						type: 'keyword',
						content: 'Choking Under Pressure',
						tooltip:
							"Improvviso calo delle prestazioni in situazioni ad alta pressione. L'ansia interferisce con l'esecuzione automatica di competenze consolidate."
					},
					{
						type: 'text',
						content: ": un blocco in cui la mente\nostacola ciò che l'allenamento aveva reso naturale."
					}
				]
			]
		},
		infortunato: {
			title: "L'INFORTUNATO",
			heroSectionId: 'infortunato-hero',
			narrativeSectionId: 'recovery',
			colors: ['var(--arancione-200)', 'var(--archetipi-infortunato)', 'var(--arancione-600)'],
			paragraphs: [
				[
					{
						type: 'text',
						content: 'Dopo il recupero, molti atleti convivono con\nla '
					},
					{
						type: 'keyword',
						content: 'kinesiophobia',
						tooltip:
							'Paura persistente del movimento o del ritorno all’attività sportiva dopo un infortunio, alimentata dal timore di provare dolore o di subire una nuova lesione.'
					},
					{
						type: 'text',
						content: ' e la perdita di fiducia.'
					}
				],
				[
					{
						type: 'text',
						content: 'Tornare davvero in campo significa affrontare\nun processo di '
					},
					{
						type: 'keyword',
						content: 'reset mentale',
						tooltip:
							'Processo di rielaborazione che permette all’atleta di interrompere i meccanismi mentali legati all’infortunio e recuperare fiducia nelle proprie capacità.'
					},
					{
						type: 'text',
						content: ': smettendo di \ncompetere con il ricordo del dolore.'
					}
				]
			]
		},
		insoddisfatto: {
			title: "L'INSODDISFATTO",
			heroSectionId: 'insoddisfatto-hero',
			narrativeSectionId: 'insoddisfatto-narrative',
			colors: ['var(--viola-200)', 'var(--archetipi-insoddisfatto)', 'var(--viola-600)'],
			paragraphs: [
				[
					{
						type: 'text',
						content:
							"A volte il podio non basta. Chi arriva più vicino all'oro\nè spesso quello che fa più fatica ad accettare\nil risultato, intrappolato dal "
					},
					{
						type: 'keyword',
						content: 'pensiero controfattuale',
						tooltip:
							'Tendenza a ricostruire mentalmente eventi passati immaginando esiti alternativi, valutando come scelte o circostanze diverse avrebbero potuto cambiare il risultato.'
					},
					{
						type: 'text',
						content: '.'
					}
				],
				[
					{
						type: 'text',
						content: 'Viene definito il '
					},
					{
						type: 'keyword',
						content: "paradosso dell'argento",
						tooltip:
							"Fenomeno psicologico per cui i medagliati d'argento risultano spesso meno soddisfatti di quelli di bronzo, essendo concentrati sulla vittoria mancata anziché sul traguardo raggiunto."
					},
					{
						type: 'text',
						content: ': la mente\ncontinua a guardare ciò che è mancato, cancellando\nquello che è stato raggiunto.'
					}
				]
			]
		}
	};

	/** @type {Props} */
	let { archetype, uniqueSection } = $props();

	// Commento solo il PERCHÉ: deriviamo reattivamente la configurazione in base all'archetipo corrente e passiamo un getter allo store del gradiente per mantenere intatta la reattività
	const config = $derived(ARCHETYPE_CONFIG[archetype]);
	const gradient = createArchetypeGradientConfig(() => config.colors);
</script>

<svelte:window bind:scrollY={gradient.scrollY} bind:innerHeight={gradient.innerHeight} />

<InteractiveGradient config={gradient.activeConfig} />

<main id="{archetype}-profile-page" use:trackScrollProgress>
	<HeroSection theme={archetype} title={config.title} sectionId={config.heroSectionId} textShadow="none" />

	{@render uniqueSection()}

	<NarrativeText sectionId={config.narrativeSectionId} theme={archetype} paragraphs={config.paragraphs} />

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
