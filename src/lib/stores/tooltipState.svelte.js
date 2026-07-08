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

export const tooltip = {
    // Getter per leggere i valori nel componente
    get current() { return state; },
    
    /**
     * @param {number} clientX
     * @param {number} clientY
     */
    updatePosition(clientX, clientY) {
        state.x = clientX;
        state.y = clientY;
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
        if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return;
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