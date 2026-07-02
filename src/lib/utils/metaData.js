// Definiamo i metadati centralizzati per la SEO.
// Questo file viene condiviso sia dal layout SvelteKit sia dallo script Node.js che gira a tempo di build.

// Origin di produzione: serve per og:url/og:image, che i crawler richiedono assoluti
export const SITE_ORIGIN = 'https://under-skin.netlify.app';

export const PAGE_META = {
	'/': {
		title: 'UnderSkin',
		description:
			"Cosa c'è oltre il podio? UnderSkin svela come la pressione di Milano-Cortina 2026 modella la salute mentale degli atleti attraverso tre archetipi narrativi."
	},
	'/about': {
		title: 'About · UnderSkin',
		description:
			'Cosa si nasconde dietro il successo? Scopri la visione, il team e la ricerca di UnderSkin per dare voce al lato invisibile degli atleti.'
	},
	'/favorito': {
		title: 'Favorito · UnderSkin',
		description:
			"Quando l'oro è l'unico traguardo concesso. Esplora il Favorito: la complessa convivenza con il peso e le ombre delle aspettative assolute."
	},
	'/infortunato': {
		title: 'Infortunato · UnderSkin',
		description:
			"Quando il corpo si ferma, ma la mente continua a correre. Scopri l'Infortunato: l'esperienza silenziosa del recupero e la ricerca di un nuovo equilibrio mentale."
	},
	'/insoddisfatto': {
		title: 'Insoddisfatto · UnderSkin',
		description:
			"Il secondo posto può diventare una condanna? Esplora l'Insoddisfatto: l’eterna rincorsa a una perfezione che sembra sempre sfuggire di mano."
	}
};

// Configurazione di fallback per rotte sconosciute o pagine di errore
export const DEFAULT_META = {
	title: 'Errore · UnderSkin',
	description: 'Si è verificato un errore.'
};
