// Commento solo il PERCHÉ: store singleton che fa da bridge tra l'action heroParallax (che conosce
// il proprio nodo e sa come animarlo in uscita) e l'hook onNavigate del layout (che sa quando si
// naviga). Evita che il layout faccia query DOM sui componenti figli o contenga logica di animazione.

/** @type {(() => Promise<void>) | null} */
let exitFn = $state(null);

export const heroExit = {
	/**
	 * Registra la funzione di uscita. Chiamata dall'action heroParallax al mount.
	 * @param {() => Promise<void>} fn
	 */
	register(fn) {
		exitFn = fn;
	},

	/**
	 * Esegue la funzione di uscita se presente e poi la annulla.
	 * Chiamata da onNavigate nel layout — ritorna una Promise che SvelteKit
	 * attende prima di completare la navigazione.
	 * @returns {Promise<void>}
	 */
	run() {
		if (!exitFn) return Promise.resolve();
		const fn = exitFn;
		exitFn = null;
		return fn();
	},

	/**
	 * Rimuove la funzione senza eseguirla. Chiamata dal destroy() dell'action
	 * per evitare riferimenti a nodi già smontati in caso di destroy anticipato.
	 */
	clear() {
		exitFn = null;
	}
};
