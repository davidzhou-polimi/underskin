/**
 * Ricette di rivelazione: popolano una timeline scrubbata già creata (nessun trigger qui).
 * Ogni ricetta ritorna { snapPoints } — gli istanti (in tempo di timeline) in cui la
 * sequenza è "a riposo leggibile" — così lo snap si aggancia ai beat reali invece di
 * una griglia uniforme ricalcolata a mano per ogni sezione, e resta corretto anche
 * quando si aggiunge una coda di dwell.
 * Porting canonico da: performanceReveal (fadeIn), finalScroll (fadeInOut),
 * scrollReveal desktop (lineSwap) e mobile (lineStack).
 */

import { gsap } from '$lib/utils/gsapSetup.js';
import { DWELL } from '$lib/actions/scrollytelling/presets.js';

/**
 * Rivelazione unica del blocco + sosta di lettura (forma performanceReveal).
 * @param {gsap.core.Timeline} tl
 * @param {Element} target
 * @param {{ dwell?: keyof typeof DWELL }} [opts]
 */
export function buildFadeIn(tl, target, opts = {}) {
	const dwell = DWELL[opts.dwell ?? 'medium'];

	// Stato iniziale imposto via GSAP e non via CSS: la ricetta deve produrre lo stesso
	// ingresso ovunque, senza dipendere da cosa dichiara il foglio di stile della sezione.
	gsap.set(target, { opacity: 0, filter: 'blur(10px)', y: 20 });

	tl.to(target, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1, ease: 'power2.out' });
	// Sosta a contenuto fermo: induce il tempo di lettura prima del rilascio del pin.
	tl.to({}, { duration: dwell });

	return { snapPoints: [] };
}

/**
 * Rivelazione + sosta + dissolvenza in uscita prima dell'unpin (forma finalScroll).
 * @param {gsap.core.Timeline} tl
 * @param {Element} target
 * @param {{ dwell?: keyof typeof DWELL }} [opts]
 */
export function buildFadeInOut(tl, target, opts = {}) {
	const dwell = DWELL[opts.dwell ?? 'short'];

	gsap.set(target, { opacity: 0, filter: 'blur(10px)', y: 20 });

	tl.to(target, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1, ease: 'power2.out' });
	tl.to({}, { duration: dwell });
	// Dissolve prima del rilascio del pin, assecondando l'arrivo della sezione successiva
	// senza scatti di proprietà CSS al momento dell'unpin.
	tl.to(target, { opacity: 0, filter: 'blur(10px)', y: -20, duration: 1, ease: 'power2.in' });

	return { snapPoints: [] };
}

/**
 * Sequenza desktop "una frase alla volta": ogni riga sostituisce la precedente
 * (forma scrollReveal desktop). Le classi reveal-* restano il contratto CSS esistente.
 * @param {gsap.core.Timeline} tl
 * @param {{ lines: NodeListOf<Element> | Element[] }} refs
 * @param {{ dwell?: keyof typeof DWELL }} [opts] - coda di sosta sull'ultima frase
 */
export function buildLineSwap(tl, { lines }, opts = {}) {
	const items = Array.from(lines);
	if (!items.length) return { snapPoints: [] };

	// Ripristino degli stati CSS iniziali per evitare conflitti derivati da resize al volo.
	for (let i = 1; i < items.length; i++) {
		items[i].classList.remove('reveal-visible');
		items[i].classList.add('reveal-hidden');
	}
	items[0].classList.remove('reveal-hidden');
	items[0].classList.add('reveal-visible');

	const snapPoints = [0];
	for (let i = 0; i < items.length - 1; i++) {
		tl.to(items[i], { opacity: 0, filter: 'blur(15px)', y: -20, duration: 1 }).to(
			items[i + 1],
			{ opacity: 1, filter: 'blur(0px)', y: 0, duration: 1 },
			'-=0.5'
		);
		// Beat leggibile: la riga i+1 è completamente assestata.
		snapPoints.push(tl.duration());
	}

	if (opts.dwell) tl.to({}, { duration: DWELL[opts.dwell] });

	return { snapPoints };
}

/**
 * Sequenza mobile "ad accumulo" (forma scrollReveal mobile): l'ultima riga è la frase
 * finale (hero), le precedenti si accumulano una sopra l'altra e poi sfumano insieme.
 * @param {gsap.core.Timeline} tl
 * @param {{ lines: NodeListOf<Element> | Element[] }} refs
 * @param {{ dwell?: keyof typeof DWELL }} [opts] - coda di sosta sulla frase finale
 */
export function buildLineStack(tl, { lines }, opts = {}) {
	const items = Array.from(lines);
	if (!items.length) return { snapPoints: [] };

	const heroIndex = items.length - 1;
	const numStats = heroIndex;

	// Reset delle classi: su mobile è il layout a controllare la visibilità iniziale.
	for (const line of items) line.classList.remove('reveal-hidden', 'reveal-visible');

	// Ogni elemento parte leggermente traslato in basso e ingrandito, così l'entrata
	// avviene sempre al di sotto del testo precedente.
	gsap.set(items[0], { y: 25, scale: 1.3, opacity: 1, filter: 'blur(0px)' });
	for (let i = 1; i < items.length; i++) {
		gsap.set(items[i], { y: 25, scale: 1.3, opacity: 0, filter: 'blur(15px)' });
	}

	tl.to(items[0], { y: 0, scale: 1.0, duration: 1 }, 0);

	if (numStats > 0) {
		// Due tween separati per riga (ingresso, poi assestamento) per far coincidere
		// l'entrata con lo snap-point precedente e l'assestamento con quello successivo,
		// così lo scrub resta leggibile passo per passo.
		for (let i = 1; i < numStats; i++) {
			tl.to(items[i], { opacity: 1, filter: 'blur(0px)', duration: 1 }, 2 * i - 1);
			tl.to(items[i], { y: 0, scale: 1.0, duration: 1 }, 2 * i);
		}

		const fadeTime = 2 * numStats;
		tl.to(
			items.slice(0, numStats),
			{ opacity: 0, filter: 'blur(15px)', y: -20, duration: 1 },
			fadeTime
		).to(items[heroIndex], { opacity: 1, filter: 'blur(0px)', duration: 1 }, fadeTime);

		tl.to(items[heroIndex], { scale: 1.0, y: 0, duration: 1 }, fadeTime + 1);
	}

	// La griglia dei beat è uniforme (posizioni assolute intere): ogni unità di tempo
	// è uno snap-point, come nella formula storica 1/(2*numStats+2).
	const beats = tl.duration();
	const snapPoints = [];
	for (let t = 0; t <= beats; t++) snapPoints.push(t);

	if (opts.dwell) tl.to({}, { duration: DWELL[opts.dwell] });

	return { snapPoints };
}
