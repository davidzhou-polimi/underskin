// Usiamo le Runes di Svelte 5 per creare uno stato globale leggerissimo
let state = $state({
    visible: false,
    text: '',
    type: 'semplice', // 'semplice' o 'paragrafo'
    x: 0,
    y: 0,
    cursor: 'default'
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
     */
    show(text, type = 'semplice', cursor = 'pointer') {
        state.text = text;
        state.type = type;
        state.visible = true;
        state.cursor = cursor;
    },
    
    // Funzione per nasconderlo
    hide() {
        state.visible = false;
        state.cursor = 'default';
    }
};