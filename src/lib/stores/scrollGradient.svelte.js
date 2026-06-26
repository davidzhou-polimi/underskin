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
 * Gradient a 2 stati per le pagine archetype: copertura piena nella hero, ridotta nel corpo.
 * @param {string[] | (() => string[])} baseColors Palette cromatica dell'archetipo o getter reattivo
 */
export function createArchetypeGradientConfig(baseColors) {
	let scrollY = $state(0);
	let innerHeight = $state(0);

	// Commento solo il PERCHÉ: supportiamo la risoluzione dinamica dei colori tramite funzione getter per mantenere intatta la reattività Svelte 5
	const resolvedColors = $derived(typeof baseColors === 'function' ? baseColors() : baseColors);
	const baseConfig = $derived({ colors: resolvedColors, coverage: 1.0 });

	let activeConfig = $derived(
		scrollY > 100 ? { ...baseConfig, coverage: 0.3 } : baseConfig
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
		typeof document !== 'undefined' &&
			scrollY > document.documentElement.scrollHeight - innerHeight * 1.8
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
						   al centro per l'IntroSection, per allinearsi visivamente con i cerchi concentrici animati. */
						colors,
						coverage: 1.0,
						speed: 1.1,
						focusCenter: [0.5, 0.5],
						focusRadius: [0.25, 0.25]
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
