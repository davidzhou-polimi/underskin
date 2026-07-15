/**
 * ScrollLockManager: l'unica macchina a stati per il blocco dello scroll di pagina.
 * Sostituisce i tre meccanismi concorrenti storici (lockScrollDown sparso, lockScroll
 * diretto, gate Observer non tracciati): chiunque voglia bloccare lo scroll passa da
 * `acquire`/`release` con un ownerId, così `mode`/`owner` sono sempre veritieri e la UI
 * (overlay dev, hint) può reagirvi. Delega alle helper collaudate di lenis.svelte.js,
 * che restano il livello basso interno.
 *
 * Regole:
 * - Owner singolo: i lock appartengono a sezioni spazialmente disgiunte, quindi una
 *   contesa è il sintomo di un bug (acquire negato + warn in dev), non un caso da gestire.
 * - `anchor`: UN solo scrollTo immediato all'acquire, mai ri-sparato su eventi
 *   ScrollTrigger spuri — è la lezione anti-shake di gameDownLock.
 * - Upgrade di modo dello stesso owner (es. quiz: choosing 'down' → animating 'full')
 *   senza frame di scroll libero: si ingaggia il nuovo modo PRIMA di rilasciare il vecchio.
 * - I metodi NON devono essere tracciabili dalla reattività: la verità operativa vive in
 *   variabili plain e le $state sono solo lo specchio read-only per la UI (getter). Se i
 *   metodi leggessero $state, un $effect che chiama release() traccerebbe `owner` come
 *   dipendenza e ri-eseguirebbe a ogni acquire altrui, strappando lock appena acquisiti
 *   (bug reale del down-lock del Quiz, 2026-07-10).
 */

import {
	getLenis,
	lockScroll,
	unlockScroll,
	lockScrollDown,
	unlockScrollDown
} from '$lib/stores/lenis.svelte.js';

// Verità operativa, deliberatamente NON reattiva (vedi regola sopra).
/** @type {'none' | 'down' | 'full'} */
let mode = 'none';
/** @type {string | null} */
let owner = null;

// Specchio per la UI (overlay dev): aggiornato da sync(), mai letto dai metodi.
/** @type {'none' | 'down' | 'full'} */
let uiMode = $state('none');
/** @type {string | null} */
let uiOwner = $state(null);

function sync() {
	uiMode = mode;
	uiOwner = owner;
}

// Le action della pagina entrante girano al mount PRIMA di afterNavigate: un rilascio
// incondizionato lì striperebbe un lock appena acquisito legittimamente (es. il gate
// dell'intro). La generazione, bumpata in onNavigate, distingue i lock della pagina
// uscente (stantii) da quelli della entrante.
let generation = 0;
let lockGeneration = 0;

/** @param {'down' | 'full'} newMode @param {(() => void)} [onDownIntent] */
function engage(newMode, onDownIntent) {
	if (newMode === 'down') lockScrollDown(onDownIntent);
	else lockScroll();
}

/** @param {'none' | 'down' | 'full'} oldMode */
function disengage(oldMode) {
	if (oldMode === 'down') unlockScrollDown();
	else if (oldMode === 'full') unlockScroll();
}

export const scrollLock = {
	get mode() {
		return uiMode;
	},
	get owner() {
		return uiOwner;
	},

	/**
	 * @param {string} ownerId - es. 'quiz', 'intro', 'thoughts-game'
	 * @param {{ mode: 'down' | 'full', anchor?: HTMLElement | number, onDownIntent?: () => void }} opts
	 *   anchor: elemento o posizione scroll su cui incollarsi (un solo scrollTo, all'acquire)
	 * @returns {boolean} true se il lock è stato acquisito (o aggiornato)
	 */
	acquire(ownerId, opts) {
		const { mode: newMode, anchor, onDownIntent } = opts;
		if (owner !== null && owner !== ownerId) {
			if (import.meta.env.DEV) {
				console.warn(
					`[scrollLock] acquire('${ownerId}') negato: lock già detenuto da '${owner}' (${mode}). ` +
						'Due sezioni si sovrappongono o un release è mancato.'
				);
			}
			return false;
		}

		const prevMode = mode;
		engage(newMode, onDownIntent);
		if (prevMode !== 'none' && prevMode !== newMode) disengage(prevMode);

		owner = ownerId;
		mode = newMode;
		lockGeneration = generation;
		sync();

		if (anchor !== undefined) getLenis()?.scrollTo(anchor, { immediate: true, force: true });
		return true;
	},

	/**
	 * No-op se ownerId non detiene il lock: un release altrui non deve rubare lo stato.
	 * @param {string} ownerId
	 */
	release(ownerId) {
		if (owner !== ownerId) return;
		disengage(mode);
		owner = null;
		mode = 'none';
		sync();
	},

	/** Da chiamare in onNavigate: marca come stantio ogni lock acquisito finora. */
	bumpGeneration() {
		generation++;
	},

	/**
	 * Valvola di sicurezza chiamata dal layout: dopo una navigazione non sappiamo quale
	 * via fosse attiva, quindi rilascia entrambe. Garantisce che la pagina non resti mai
	 * bloccata da un owner ormai smontato.
	 * @param {{ staleOnly?: boolean }} [opts] - staleOnly (afterNavigate): risparmia i lock
	 *   acquisiti dalla pagina entrante durante il mount; senza (pageshow/bfcache) è totale.
	 */
	forceRelease(opts = {}) {
		if (mode === 'none' && owner === null) return;
		if (opts.staleOnly && lockGeneration === generation) return;
		unlockScrollDown();
		unlockScroll();
		owner = null;
		mode = 'none';
		sync();
	}
};
