import { gsap, ScrollTrigger, Observer, Draggable } from '$lib/utils/gsapSetup.js';
import { scrollTo } from '$lib/stores/lenis.svelte.js';

/**
 * @typedef {Object} QuizDragMobileParams
 * @property {string} quizState - Stato reattivo del quiz ('choosing' | 'animating' | 'results')
 * @property {(state: string) => void} onStateChange - Notifica a Svelte il cambio di stato
 * @property {() => void} lockScroll - Blocca lo scroll della pagina (hard-lock bidirezionale)
 * @property {() => void} unlockScroll - Sblocca lo scroll della pagina
 */

// Gli step del gioco: coppie 10-90 … 90-10 (mentale = zona superiore).
const MIN = 10;
const MAX = 90;
const START = 50;
const REVEAL = 70; // la "risposta giusta": 70% mentale / 30% fisico

/**
 * Action Svelte del gioco mobile del Quiz.
 *
 * Flusso: la domanda è centrata nel viewport, sul solo gradiente della home (nessun fill sotto).
 * Quando il `top` della sezione raggiunge il `top` del viewport la sezione entra in SOSTA ("hold"):
 * pagina in HARD-LOCK bidirezionale (`lockScroll`) e domanda ferma — il gioco NON parte da solo,
 * la domanda è uno stato, non un frame di passaggio. Un gesto avanti avvia la timeline d'ingresso
 * (non scrub): la domanda sfuma mentre "fisico" (unica zona con sfondo) cresce dal bordo inferiore
 * fino a metà schermo, la maniglia appare sul confine e le etichette (percentuale, poi nome)
 * compaiono in stagger. Un gesto indietro durante il gioco riavvolge l'ingresso e RITORNA ALLA
 * SOSTA (non fuori dalla sezione); dalla sosta un altro gesto indietro esce verso la schermata
 * precedente. L'utente trascina la maniglia a step di 10 (snap morbido al rilascio) e, comparso
 * "Scopri", un tap conferma → la barra va al 70/30, "mentale" (gradiente) resta a tutto schermo e
 * appare il solo quote. Da lì lo scroll è di nuovo libero (su e giù) e il quiz non si ripresenta.
 *
 * Perché HARD-LOCK e non un muro direzionale: la vecchia combinazione `lockScrollDown` (risalita nativa
 * viva) + Draggable verticale faceva competere scroll e drag sullo stesso stream di touch — il browser
 * decide al primo `touchmove` se è scroll o drag, e ogni tocco che mancava la maniglia diventava scroll
 * (muro capture leaky su iOS). Con la pagina interamente bloccata NULLA compete per il touch: il
 * Draggable possiede il gesto verticale sulla maniglia ovunque, senza jitter. Il "muro in avanti" e
 * l'uscita animata all'indietro sono affidati a un `Observer` (stesso meccanismo del quiz desktop) che
 * legge i gesti mentre la pagina è bloccata, con `ignore: [handle]` così un drag non conta mai come
 * gesto di uscita.
 * @param {HTMLElement} node - Il wrapper della sezione quiz (variante mobile)
 * @param {QuizDragMobileParams} params
 */
export function quizDragMobile(node, params) {
	let { onStateChange, lockScroll, unlockScroll } = params;
	let quizState = params.quizState ?? 'choosing';

	const handle = /** @type {HTMLElement} */ (node.querySelector('.split-handle'));
	const zoneMentale = /** @type {HTMLElement} */ (node.querySelector('.zone-mentale'));
	const zoneFisico = /** @type {HTMLElement} */ (node.querySelector('.zone-fisico'));
	const mentalePct = node.querySelector('.zone-mentale .zone-pct');
	const fisicoPct = node.querySelector('.zone-fisico .zone-pct');
	const quizIntro = node.querySelector('.quiz-intro');
	const quotePanel = node.querySelector('.quote-panel');
	// Le etichette si dividono in due gruppi: la percentuale compare per prima, il nome zona subito
	// dopo (stagger richiesto in fase d'ingresso).
	const zonePcts = node.querySelectorAll('.zone-pct');
	const zoneNames = node.querySelectorAll('.zone-name');

	/** Altezza utile della barra (px): unica sorgente per posizionare handle e zone. */
	let H = 0;
	let value = START;
	/** Il gioco (drag) è attivo: l'ingresso è completo e la maniglia appartiene al Draggable. */
	let gameActive = false;
	/** La sezione è "presa": pagina hard-locked (vale sia per la sosta sia per il gioco). */
	let locked = false;
	/** Fase del ciclo di vita: 'idle' (scroll libero) | 'hold' (sosta sulla domanda) | 'game'. */
	let phase = 'idle';
	/** @type {gsap.core.Tween | null} - armamento ritardato dell'Observer (assorbe la coda del gesto). */
	let armCall = null;
	/** @type {gsap.core.Tween | null} - resync ritardato dello scroll all'ingresso in sosta. */
	let resyncCall = null;
	/** @type {gsap.core.Timeline | null} - timeline di uscita/conferma (70/30 → quote). */
	let timeline = null;
	/** @type {gsap.core.Tween | null} - assestamento morbido della maniglia sullo step al rilascio. */
	let snapTween = null;
	/** @type {Draggable | undefined} */
	let draggable;
	/** @type {Observer | undefined} - legge i gesti di scroll mentre la pagina è bloccata. */
	let gestureObserver;
	/** @type {ScrollTrigger | undefined} */
	let holdTrigger;
	/** @type {ScrollTrigger | undefined} */
	let resetTrigger;

	// H segue il viewport, non lo scroll: mentre "presa" la sezione è un layer position:fixed
	// (vedi is-engaged in lockGame), quindi allineato al viewport a prescindere dalla posizione
	// di scroll del documento sottostante — elimina la dipendenza che causava l'asimmetria.
	const measure = () => { H = window.innerHeight; };
	const valueFromY = (/** @type {number} */ y) => Math.min(MAX, Math.max(MIN, Math.round((y / H) * 10) * 10));

	/** @param {number} v */
	function setLabels(v) {
		if (mentalePct) mentalePct.textContent = `${v}%`;
		if (fisicoPct) fisicoPct.textContent = `${100 - v}%`;
	}

	/** Sincronizza le due zone al confine indicato dalla maniglia (in px). @param {number} y */
	function renderZones(y) {
		gsap.set(zoneMentale, { height: y });
		gsap.set(zoneFisico, { top: y });
	}

	/** Applica un valore discreto posizionando maniglia + zone + etichette. @param {number} v */
	function applyValue(v) {
		value = v;
		setLabels(v);
		// Senza una misura valida della barra il CSS regge il 50/50 iniziale; evitiamo px a 0.
		if (H <= 0) return;
		const y = (v / 100) * H;
		gsap.set(handle, { y });
		renderZones(y);
		// Il Draggable memorizza il transform corrente: dopo un set esterno va aggiornato, altrimenti
		// al primo press la maniglia salterebbe alla vecchia posizione.
		if (draggable) draggable.update();
	}

	measure();
	gsap.set(quotePanel, { opacity: 0 });

	// Proxy del confine mentale/fisico durante ingresso e uscita (non durante il drag, che usa
	// direttamente this.y del Draggable).
	const boundaryProxy = { y: 0 };

	/**
	 * Porta il gioco allo stato attivo (maniglia al 50/50, drag pronto). Idempotente: la chiamano
	 * sia la fine dell'ingresso (onComplete) sia un afferramento anticipato della maniglia (onPress),
	 * che finalizza l'ingresso in corso.
	 */
	function activateGame() {
		gameActive = true;
		value = START;
		applyValue(START);
		// L'Observer si accende SOLO ora (ingresso finito): così il gesto che ha avviato il gioco
		// dalla sosta — letto mentre l'ingresso suonava — non può più riavvolgerlo (bug "fisico più bassa").
		gestureObserver?.enable();
	}

	/**
	 * Timeline persistente, creata UNA sola volta e pilotata con `.play()`/`.reverse()`. `.progress(0)`
	 * renderizza correttamente lo stato di riposo perché ogni proprietà è definita con `.fromTo()`. Il
	 * breve segmento iniziale vuoto dà solo respiro prima che qualcosa cambi: la lettura della domanda
	 * ha già il suo tempo nella sosta (hold), e in reverse un segmento lungo sarebbe coda morta.
	 */
	const entranceTimeline = gsap.timeline({
		paused: true,
		onComplete: activateGame,
		onReverseComplete: () => {
			// Ingresso completamente riavvolto: torna la domanda e si RIENTRA IN SOSTA — il retract non
			// butta fuori dalla sezione. Da qui un gesto avanti fa ripartire il gioco (startGame), uno
			// indietro esce davvero (exitUpFromHold). locked e is-engaged restano: pagina ancora congelata.
			gameActive = false;
			value = START;
			draggable?.disable();
			handle.classList.remove('is-confirmable');
			setLabels(START);
			phase = 'hold';
			// Scroll quiescente (congelato dall'inizio del gioco, nessuna inerzia da battere): il resync
			// sul top è affidabile e riallinea i trigger sotto il layer fisso.
			scrollTo(node, { immediate: true, force: true });
			// Il gesto che ha chiesto il retract può avere ancora una coda di eventi: ri-arma con ritardo.
			armObserver();
		}
	});

	entranceTimeline
		.to({}, { duration: 0.2 })
		.fromTo(quizIntro, { opacity: 1, y: 0 }, { opacity: 0, y: -30, duration: 0.5, ease: 'power2.in' })
		.fromTo(handle, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' }, '<0.1')
		.fromTo(boundaryProxy,
			{ y: () => H },
			{
				y: () => 0.5 * H,
				duration: 0.7,
				ease: 'power2.out',
				onUpdate: () => { gsap.set(handle, { y: boundaryProxy.y }); renderZones(boundaryProxy.y); }
			}, '<')
		.fromTo(zonePcts, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' }, '-=0.15')
		.fromTo(zoneNames, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' }, '+=0.12');

	// Stato di riposo al mount: la timeline stessa (a progresso 0) è la fonte di verità della posa.
	// H è verosimilmente 0 finché il layout non è pronto: ri-misuriamo e ri-renderizziamo al primo frame.
	entranceTimeline.progress(0);
	requestAnimationFrame(() => {
		if (!gameActive && entranceTimeline.progress() === 0) {
			measure();
			entranceTimeline.invalidate().progress(0);
		}
	});

	draggable = Draggable.create(handle, {
		type: 'y',
		// La maniglia contiene il Button (clickable): dragClickables mantiene il drag partendo da esso,
		// mentre onClick resta il tap di conferma.
		dragClickables: true,
		cursor: 'grab',
		activeCursor: 'grabbing',
		onPress() {
			if (snapTween) { snapTween.kill(); snapTween = null; }
			// Afferramento anticipato: se l'ingresso sta ancora suonando lo finalizzo all'istante,
			// così la maniglia è già al 50/50 e il drag parte subito (niente attesa dei ~1.5s).
			if (entranceTimeline.isActive()) {
				entranceTimeline.progress(1);
				activateGame();
			}
			// I confini dipendono dall'altezza corrente della barra: ricalcolati a ogni pressione.
			measure();
			this.applyBounds({ minY: (MIN / 100) * H, maxY: (MAX / 100) * H });
		},
		onDrag() {
			// Movimento continuo: la maniglia segue il dito; le percentuali scattano a 10.
			renderZones(this.y);
			setLabels(valueFromY(this.y));
		},
		onDragEnd() {
			// Snap morbido allo step più vicino (InertiaPlugin non è registrato → tween manuale).
			const v = valueFromY(this.y);
			const targetY = (v / 100) * H;
			const proxy = { y: this.y };
			if (snapTween) snapTween.kill();
			snapTween = gsap.to(proxy, {
				y: targetY,
				duration: 0.25,
				ease: 'power2.out',
				onUpdate: () => { gsap.set(handle, { y: proxy.y }); renderZones(proxy.y); },
				onComplete: () => { value = v; snapTween = null; draggable?.update(); }
			});
			setLabels(v);
			// Dopo il primo rilascio la maniglia diventa un pulsante: pulsa e l'etichetta passa a "Scopri".
			handle.classList.add('is-confirmable');
		},
		onClick() {
			// Si conferma solo dopo aver trascinato almeno una volta (quando appare "Scopri").
			if (handle.classList.contains('is-confirmable')) confirm();
		}
	})[0];
	// Inerte finché non si entra nella sezione: il trigger lo abilita al lock (vedi lockGame).
	draggable.disable();

	/** Tap di conferma: 70/30, poi mentale si espande a tutto schermo e resta solo la citazione. */
	function confirm() {
		if (quizState !== 'choosing') return;
		quizState = 'animating';
		onStateChange('animating');
		if (snapTween) { snapTween.kill(); snapTween = null; }
		draggable?.disable();
		gestureObserver?.disable();
		// Ferma la pulsazione della maniglia mentre svanisce.
		handle.classList.remove('is-confirmable');
		// La pagina è già hard-locked durante choosing; lockScroll è idempotente e garantisce il freeze
		// per tutta la durata dell'uscita.
		lockScroll();
		measure();

		const revealY = (REVEAL / 100) * H;
		const proxy = { v: value };

		timeline = gsap.timeline({
			onComplete: () => {
				quizState = 'results';
				onStateChange('results');
				locked = false;
				phase = 'idle';
				// Handoff fixed→absolute: lo scroll sotto è rimasto congelato dove lockGame lo ha fermato
				// (anche a distanza dal top), ma ora è quiescente da secondi → la ri-sincronizzazione sul
				// top della sezione è affidabile. Fatta PRIMA di togliere la classe, il quote absolute
				// coincide col fixed e non c'è salto; da qui scroll libero e trigger di nuovo coerenti.
				scrollTo(node, { immediate: true, force: true });
				node.classList.remove('is-engaged');
				unlockScroll();
			}
		});

		// Fase 1 — la barra scorre al 70/30 mentre i numeri "contano".
		timeline.to(handle, { y: revealY, duration: 0.6, ease: 'power2.inOut' }, 0);
		timeline.to(zoneMentale, { height: revealY, duration: 0.6, ease: 'power2.inOut' }, 0);
		timeline.to(zoneFisico, { top: revealY, duration: 0.6, ease: 'power2.inOut' }, 0);
		timeline.to(proxy, {
			v: REVEAL,
			duration: 0.6,
			ease: 'power2.inOut',
			onUpdate: () => setLabels(Math.round(proxy.v))
		}, 0);

		// Fase 2 — il fill solido di fisico si ritira verso il basso: la maniglia SCENDE INSIEME al
		// pannello (stesso confine e stessa durata/posizione), "mentale" (gradiente) si espande a tutto
		// schermo, le etichette svaniscono. Resta il solo sfondo gradiente. (Tween separati: `y` è il
		// transform della maniglia, `top` è la posizione della zona — non vanno mischiati sullo stesso target.)
		// Commento solo il PERCHÉ: allungata la sosta sul risultato 70/30 a 0.8s (la fase 2 inizia a 1.4s anziché 0.9s).
		timeline.to(handle, { y: H, opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 1.4);
		timeline.to(zoneFisico, { top: H, opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 1.4);
		timeline.to(zoneMentale, { opacity: 0, duration: 0.5, ease: 'power2.in' }, 1.5);

		// Fase 3 — a uscita conclusa e dopo una pausa più lunga sul risultato pieno, la citazione
		// compare centrata sul gradiente (staccata dall'animazione d'uscita, non sovrapposta).
		// Commento solo il PERCHÉ: slittato l'avvio della citazione a 2.9s per mantenere la pausa respiratoria di 0.9s dopo la fine della fase 2.
		timeline.fromTo(quotePanel,
			{ opacity: 0, y: 20 },
			{ opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 2.9);
	}

	/** Gesto "indietro" durante il gioco: riavvolge l'ingresso; il ritorno alla sosta avviene in onReverseComplete. */
	function retract() {
		// Solo a ingresso completato (gameActive): durante l'ingresso non si riavvolge — evita che il
		// gesto d'entrata lo interrompa lasciando le zone asimmetriche.
		if (quizState !== 'choosing' || !locked || !gameActive) return;
		if (entranceTimeline.reversed()) return; // già in riavvolgimento
		entranceTimeline.reverse();
	}

	/**
	 * Arma l'Observer con un ritardo: il gesto che ha appena cambiato stato (ingresso in sosta,
	 * retract) continua a emettere eventi per qualche centinaio di ms e verrebbe riletto come un
	 * nuovo comando; il ritardo lo lascia morire prima di rimettersi in ascolto.
	 */
	function armObserver() {
		gestureObserver?.disable();
		if (armCall) armCall.kill();
		armCall = gsap.delayedCall(0.6, () => {
			armCall = null;
			if (locked) gestureObserver?.enable();
		});
	}

	/**
	 * Entra nella SOSTA sulla domanda: hard-lock e layer fisso, ma il gioco NON parte — serve un
	 * ulteriore gesto avanti (startGame). La domanda è uno stato in cui fermarsi, non un frame di
	 * passaggio.
	 */
	function engageHold() {
		if (quizState !== 'choosing' || locked) return;
		locked = true;
		phase = 'hold';
		// Il layer di gioco passa a position:fixed con z-index alto (vedi CSS .is-engaged): allineato
		// al viewport a prescindere dallo scroll congelato, e sopra i sibling in flow (Preface pinnata,
		// Performance) che a freeze fuori registro coprirebbero il viewport rubando l'hit-test alla maniglia.
		node.classList.add('is-engaged');
		// Assestamento best-effort: con inerzia Lenis in volo può mancare il top (i log lo hanno
		// dimostrato) ed è ammesso — il layer fixed non ne dipende; il resync autoritativo arriva sotto.
		scrollTo(node, { immediate: true, force: true });
		// Hard-lock BIDIREZIONALE: con la pagina non scrollabile il Draggable non ha competitori per il touch.
		lockScroll();
		// A lock assestato l'inerzia è morta: questo resync atterra ESATTAMENTE sul top, la Preface si
		// spinna ed esce dal viewport (niente testo in trasparenza dietro la domanda) e i trigger tornano
		// coerenti. Attraversando lo start dall'alto può riscattare onEnter: la guardia su locked lo assorbe.
		if (resyncCall) resyncCall.kill();
		resyncCall = gsap.delayedCall(0.3, () => {
			resyncCall = null;
			if (locked && phase === 'hold') scrollTo(node, { immediate: true, force: true });
		});
		armObserver();
	}

	/** Gesto avanti dalla sosta: parte l'ingresso del gioco e la maniglia passa al Draggable. */
	function startGame() {
		if (phase !== 'hold' || quizState !== 'choosing') return;
		phase = 'game';
		// L'Observer si spegne per tutta la durata dell'ingresso e si riaccende in activateGame:
		// il gesto che ha avviato il gioco non deve poterlo riavvolgere mentre l'ingresso suona.
		if (armCall) { armCall.kill(); armCall = null; }
		gestureObserver?.disable();
		// Tra i due swipe il gesto precedente è concluso: resync idempotente che copre il caso in cui
		// un gesto touch ancora attivo avesse scavalcato il resync ritardato della sosta.
		scrollTo(node, { immediate: true, force: true });
		draggable?.enable();
		measure();
		entranceTimeline.invalidate().play();
	}

	/** Gesto indietro dalla sosta: rilascia la sezione e accompagna fuori, alla schermata precedente. */
	function exitUpFromHold() {
		if (phase !== 'hold') return;
		phase = 'idle';
		if (armCall) { armCall.kill(); armCall = null; }
		if (resyncCall) { resyncCall.kill(); resyncCall = null; }
		gestureObserver?.disable();
		// Handoff fixed→absolute senza salto: resync sul top PRIMA di togliere la classe (scroll
		// quiescente: congelato dalla sosta, nessuna inerzia da battere), così fixed e absolute
		// coincidono nell'istante del cambio.
		scrollTo(node, { immediate: true, force: true });
		node.classList.remove('is-engaged');
		locked = false;
		unlockScroll();
		// Una viewport sopra = la schermata narrativa precedente ("120 secondi"); serve anche a far
		// uscire il trigger dallo stato attivo, così ri-scendendo l'onEnter rientra pulito in sosta.
		scrollTo(node, { offset: -window.innerHeight });
	}

	/** Ripristino "duro" (rete di sicurezza): usato dal resetTrigger, non dal normale risalire. */
	function reset() {
		if (timeline) { timeline.kill(); timeline = null; }
		quizState = 'choosing';
		onStateChange('choosing');
		if (snapTween) { snapTween.kill(); snapTween = null; }
		if (armCall) { armCall.kill(); armCall = null; }
		if (resyncCall) { resyncCall.kill(); resyncCall = null; }
		gameActive = false;
		locked = false;
		phase = 'idle';
		value = START;
		node.classList.remove('is-engaged');
		draggable?.disable();
		gestureObserver?.disable();
		unlockScroll();
		handle.classList.remove('is-confirmable');
		measure();
		entranceTimeline.invalidate().pause(0);
		setLabels(START);
		// Ripristina l'opacità delle zone eventualmente azzerata da una conferma interrotta.
		gsap.set([zoneMentale, zoneFisico], { clearProps: 'opacity' });
		gsap.set(quotePanel, { opacity: 0 });
	}

	// Observer sul gesto di scroll, attivo SOLO mentre la pagina è bloccata (come il quiz desktop):
	// preventDefault mura lo scroll in entrambe le direzioni e i gesti diventano comandi. In SOSTA:
	// avanti fa partire il gioco, indietro esce dalla sezione. Nel GIOCO: indietro riavvolge
	// l'ingresso (retract, con le sue guardie), avanti resta murato. `ignore: [handle]` esclude il
	// drag sulla maniglia (copre anche i discendenti), così trascinare non conta mai come gesto.
	gestureObserver = Observer.create({
		target: window,
		type: 'wheel,touch,pointer',
		wheelSpeed: -1, // stessa convenzione di direzione del quiz desktop (quizAnimation.js)
		tolerance: 20,
		preventDefault: true,
		ignore: [handle],
		onUp: () => { if (phase === 'hold') startGame(); }, // gesto avanti/giù
		onDown: () => { if (phase === 'hold') { exitUpFromHold(); } else { retract(); } } // gesto indietro/su
	});
	gestureObserver.disable();

	// "Presa" della sezione SENZA pin: quando il top raggiunge il top del viewport, la pagina va in
	// hard-lock e si entra in sosta sulla domanda. Niente pin-spacer/transform (che glitchavano ai
	// refresh della barra URL mobile), niente muro direzionale che competeva col drag. NESSUN callback
	// di uscita qui: mentre locked è true lo scroll è congelato a un valore privo di significato (lo
	// scrollTo di engageHold può lasciarlo SOPRA lo start con inerzia in volo), quindi ogni evento
	// leave in quella finestra è spurio per costruzione — era proprio un onLeaveBack spurio a strappare
	// is-engaged un istante dopo il lock, riproducendo l'asimmetria. La classe segue il ciclo di vita
	// del gioco (confirm/exitUpFromHold/reset), non lo scroll.
	holdTrigger = ScrollTrigger.create({
		trigger: node,
		start: 'top top',
		end: 'bottom top',
		onEnter: engageHold
	});

	resetTrigger = ScrollTrigger.create({
		trigger: node,
		start: 'top bottom',
		// Come il desktop: una volta ai risultati il ritorno verso l'alto NON ripristina il gioco —
		// resta solo la citazione. Il reset vale solo se non si è ancora confermato; la guardia su
		// locked scarta gli eventi spuri emessi mentre lo scroll è congelato (freeze fuori registro).
		onLeaveBack: () => { if (quizState !== 'results' && !locked) reset(); }
	});

	// La misura affidabile della barra arriva dopo il layout: riallinea al refresh e al resize.
	const onRefresh = () => {
		measure();
		if (quizState !== 'choosing') return;
		if (gameActive) { applyValue(value); return; }
		// Non tocca lo stato mentre l'ingresso/l'uscita sono in corso: eviterebbe di combatterli.
		if (!entranceTimeline.isActive()) {
			entranceTimeline.invalidate();
			entranceTimeline.progress(entranceTimeline.progress());
		}
	};
	ScrollTrigger.addEventListener('refresh', onRefresh);
	window.addEventListener('resize', onRefresh);

	return {
		/** @param {QuizDragMobileParams} newParams */
		update(newParams) {
			quizState = newParams.quizState;
			onStateChange = newParams.onStateChange;
			lockScroll = newParams.lockScroll;
			unlockScroll = newParams.unlockScroll;
		},
		destroy() {
			ScrollTrigger.removeEventListener('refresh', onRefresh);
			window.removeEventListener('resize', onRefresh);
			if (snapTween) snapTween.kill();
			if (armCall) armCall.kill();
			if (resyncCall) resyncCall.kill();
			entranceTimeline.kill();
			if (draggable) draggable.kill();
			if (gestureObserver) gestureObserver.kill();
			if (holdTrigger) holdTrigger.kill();
			if (resetTrigger) resetTrigger.kill();
			if (timeline) timeline.kill();
			// Evita che uno smontaggio a metà interazione lasci la pagina bloccata.
			unlockScroll();
		}
	};
}
