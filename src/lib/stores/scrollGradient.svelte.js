import { scroll } from '$lib/stores/scroll.svelte.js';
import { media } from '$lib/stores/mediaQuery.svelte.js';

/**
 * Colori combinati dei tre archetipi, bilanciati per evitare la predominanza cromatica dell'arancione.
 * Usato nelle pagine che mostrano tutti e tre gli archetipi (home, about).
 */
export const TOTAL_COLORS = [
	'var(--azzurro-200)',
	'var(--viola-600)',
	'var(--arancione-200)',
	'var(--archetipi-favorito)',
	'var(--viola-200)',
	'var(--arancione-600)',
	'var(--azzurro-600)',
	'var(--archetipi-insoddisfatto)',
	'var(--archetipi-infortunato)'
];

/**
 * Raggio del focus nell'intro (sfera concentrata al centro). Fonte unica condivisa tra la factory
 * qui sotto e l'action introReveal, così il raggio non dipende dal timing di applicazione della config.
 * Su mobile è ridotto per allinearsi ai cerchi concentrici più piccoli.
 * @returns {[number, number]}
 */
export const introFocusRadius = () => (media.isMobile ? [0.16, 0.16] : [0.24, 0.24]);

/**
 * Gradient a 2 stati per le pagine archetype: copertura piena nella hero, ridotta nel corpo.
 * @param {string[] | (() => string[])} baseColors Palette cromatica dell'archetipo o getter reattivo
 */
export function createArchetypeGradientConfig(baseColors) {
	let scrollY = $state(0);
	let innerHeight = $state(0);
	// Nella coda della pagina (dal reveal del carosello dentro ZoomTransition fino a
	// ContinueNarration) il gradiente va a intensity 0: invisibile ma presente, pronto per un
	// reveal animato al posto di una comparsa improvvisa quando si naviga verso home.
	// nearConclusion arriva dal trigger di visibilità di continueNarrationReveal; carouselRevealed
	// dall'attraversamento del label 'reveal' nella timeline di zoomTextTransition.
	let nearConclusion = $state(false);
	let carouselRevealed = $state(false);
	const hidden = $derived(nearConclusion || carouselRevealed);

	// Commento solo il PERCHÉ: supportiamo la risoluzione dinamica dei colori tramite funzione getter per mantenere intatta la reattività Svelte 5
	const resolvedColors = $derived(typeof baseColors === 'function' ? baseColors() : baseColors);
	const baseConfig = $derived({ colors: resolvedColors, coverage: 1.0 });

	// Booleano intermedio (come isPastFirstViewport in createFullPageGradientConfig): propaga solo
	// ai flip di soglia — leggere scrollY direttamente qui creerebbe un oggetto config nuovo a ogni
	// evento scroll, riavviando in continuazione la transizione da 0.8s dell'action.
	const isPastHero = $derived(scrollY > 100);

	let activeConfig = $derived(
		hidden
			? { ...baseConfig, coverage: 0.3, intensity: 0 }
			: isPastHero
				? { ...baseConfig, coverage: 0.3 }
				: baseConfig
	);

	return {
		get scrollY() {
			return scrollY;
		},
		set scrollY(v) {
			scrollY = v;
		},
		get innerHeight() {
			return innerHeight;
		},
		set innerHeight(v) {
			innerHeight = v;
		},
		get nearConclusion() {
			return nearConclusion;
		},
		set nearConclusion(v) {
			nearConclusion = v;
		},
		get carouselRevealed() {
			return carouselRevealed;
		},
		set carouselRevealed(v) {
			carouselRevealed = v;
		},
		get activeConfig() {
			return activeConfig;
		}
	};
}

/**
 * Gradient a 3 stati per home e about: copertura iniziale → ridotta → piena con effetto footer.
 * @param {string[]} [colors] Palette cromatica (default: TOTAL_COLORS)
 */
export function createFullPageGradientConfig(colors = TOTAL_COLORS, hasIntro = false) {
	let scrollY = $state(0);
	let innerHeight = $state(0);

	let isInIntroSection = $derived(hasIntro && scrollY < 100);
	let isPastFirstViewport = $derived(scrollY > 100);
	let isNearPageBottom = $derived(
		// Commento solo il PERCHÉ: Sfrutta il progresso normalizzato di ScrollTrigger (l'ultimo 1% dello scroll) per determinare con massima precisione l'arrivo al footer, evitando calcoli manuali approssimativi basati sull'altezza dinamica della viewport e del documento.
		scroll.progress > 0.99
	);

	let activeConfig = $derived(
		isNearPageBottom
			? {
					colors,
					speed: 2.2,
					coverage: 1.0,
					focusCenter: [0.5, -0.1],
					focusRadius: [1.4, 1.0]
				}
			: isInIntroSection
				? {
						/* Commento solo il PERCHÉ: imposta un gradiente focalizzato con raggio stretto
						   al centro per l'IntroSection. Su mobile, riduce la dimensione a [0.16, 0.16] 
						   per allinearsi visivamente con i cerchi concentrici ridotti su piccoli schermi. */
						colors,
						coverage: 1.0,
						speed: 1.1,
						focusCenter: [0.5, 0.5],
						focusRadius: introFocusRadius()
					}
				: isPastFirstViewport
					? { colors, coverage: 0.35, speed: 0.6 }
					: {
							/* Commento solo il PERCHÉ: imposta un gradiente iniziale ad altissima intensità e velocità 
							   per l'apertura della pagina (Hero), emulando il comportamento vibrante del footer, 
							   ma con il posizionamento centrato ed esteso (focusCenter [0.5, 0.5], focusRadius 2.0) 
							   ripreso da HeroSection per coprire l'intera sezione uniformemente. */
							colors,
							speed: 0.6,
							coverage: 1.0,
							focusCenter: [0.5, 0.5],
							focusRadius: 2.0
						}
	);

	return {
		get scrollY() {
			return scrollY;
		},
		set scrollY(v) {
			scrollY = v;
		},
		get innerHeight() {
			return innerHeight;
		},
		set innerHeight(v) {
			innerHeight = v;
		},
		get activeConfig() {
			return activeConfig;
		}
	};
}
