// Usiamo le Runes di Svelte 5 per creare uno stato globale leggerissimo
let state = $state({
    visible: false,
    text: '',
    type: 'semplice', // 'semplice' o 'paragrafo'
    x: 0,
    y: 0,
    cursor: 'default',
    centered: false
});

// ⚡ Bolt Optimization: Cache MediaQueryList to prevent parsing CSS query on every tooltip.show call
/** @type {MediaQueryList | null} */
let pointerCoarseQuery = null;

// ⚡ Bolt Optimization: Throttle state updates via requestAnimationFrame to avoid microtask/reactivity churn on high-frequency mousemove events
let rafId = 0;
let latestX = 0;
let latestY = 0;

export const tooltip = {
    // Getter per leggere i valori nel componente
    get current() { return state; },
    
    /**
     * @param {number} clientX
     * @param {number} clientY
     */
    updatePosition(clientX, clientY) {
        latestX = clientX;
        latestY = clientY;
        if (!rafId) {
            rafId = requestAnimationFrame(() => {
                state.x = latestX;
                state.y = latestY;
                rafId = 0;
            });
        }
    },
    
    /**
     * @param {string} text
     * @param {'semplice' | 'paragrafo'} type
     * @param {string} cursor
     * @param {boolean} [centered] - Se true, il centro del tooltip coincide con il cursore
     */
    show(text, type = 'semplice', cursor = 'pointer', centered = false) {
        // Il tooltip segue il cursore: senza puntatore fine (touch) non ha una posizione affidabile
        // e finirebbe fuori viewport, quindi su mobile resta disattivato del tutto.
        if (typeof window !== 'undefined') {
            if (!pointerCoarseQuery) {
                pointerCoarseQuery = window.matchMedia('(pointer: coarse)');
            }
            if (pointerCoarseQuery.matches) return;
        }

        state.text = text;
        state.type = type;
        state.visible = true;
        state.cursor = cursor;
        state.centered = centered;
    },
    
    // Funzione per nasconderlo
    hide() {
        state.visible = false;
        state.cursor = 'default';
        // Commento solo il perché: non resettiamo centered qui per evitare che il tooltip salti di posizione durante il fade-out
    }
};