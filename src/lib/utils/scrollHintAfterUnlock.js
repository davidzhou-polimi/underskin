/**
 * Comportamento condiviso dei giochini archetipo: dopo lo sblocco dello scroll mostra
 * l'indicatore con un piccolo delay e lo nasconde definitivamente non appena l'utente
 * inizia davvero a scorrere. Da chiamare dentro un `$effect` quando l'attività è
 * completata; ritorna la funzione di cleanup da restituire all'effect.
 *
 * @param {(visible: boolean) => void} setVisible - Setter dello stato di visibilità dell'hint
 * @param {number} [delayMs] - Attesa prima di mostrare l'hint
 * @returns {() => void} cleanup
 */
export function scrollHintAfterUnlock(setVisible, delayMs = 1000) {
	const startY = window.scrollY;

	const timeout = window.setTimeout(() => setVisible(true), delayMs);

	const handleScroll = () => {
		if (Math.abs(window.scrollY - startY) > 40) {
			setVisible(false);
			window.removeEventListener('scroll', handleScroll);
		}
	};
	window.addEventListener('scroll', handleScroll, { passive: true });

	return () => {
		window.clearTimeout(timeout);
		window.removeEventListener('scroll', handleScroll);
	};
}
