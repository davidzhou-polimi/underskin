/**
 * Store globale del breakpoint mobile (Runes Svelte 5, .svelte.js necessario per $state globale).
 * matchMedia + evento 'change' invece di innerWidth + 'resize': scatta solo al cross del
 * breakpoint ed è la stessa query dei @media CSS, mantenendo JS e CSS su un'unica soglia.
 */
class MediaQueryState {
	isMobile = $state(false);

	constructor() {
		if (typeof window === 'undefined') return; // SSR/prerender-safe
		const mql = window.matchMedia('(max-width: 768px)');
		this.isMobile = mql.matches;
		// Singleton vivo per l'intera app: nessun teardown necessario.
		mql.addEventListener('change', (e) => {
			this.isMobile = e.matches;
		});
	}
}

export const media = new MediaQueryState();
