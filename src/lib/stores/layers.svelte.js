/**
 * Store per gestire lo stato dei layer sovrapposti (stile Apple)
 */
class LayerState {
    activeLayer = $state(0);
    totalLayers = 3;
    _progress = $state(0);
    lastProgress = 0;
    scrollDirection = $state('down'); // 'up' | 'down'
    quizCompleted = $state(false); // True quando il quiz ha completato e l'utente ha scrollato

    // Riferimento allo ScrollTrigger globale del layout, per sincronizzare il progresso fisico all'uscita dal quiz
    /** @type {any} */
    scrollTrigger = null;

    // Blocca gli aggiornamenti di onUpdate dallo ScrollTrigger del genitore durante l'animazione di uscita
    suppressOnUpdate = false;

    get progress() {
        return this._progress;
    }

    set progress(value) {
        // Determiniamo la direzione dello scroll globale confrontando il nuovo progresso con il precedente
        if (value > this._progress) {
            this.scrollDirection = 'down';
        } else if (value < this._progress) {
            this.scrollDirection = 'up';
        }
        this.lastProgress = this._progress;
        this._progress = value;
    }

    /**
     * @param {number} index
     */
    setActiveLayer(index) {
        if (index >= 0 && index < this.totalLayers) {
            this.activeLayer = index;
        }
    }

    /**
     * @param {number} layerIndex
     */
    getLayerOpacity(layerIndex) {
		const p = this._progress;
	
		// --- Layer 0 (IntroTextSection) ---
		if (layerIndex === 0) {
			// Forza la sparizione se il quiz ha completato l'uscita
			if (this.quizCompleted) return 0;
			if (p >= 0.9) return 0;
			return 1;
		}
	
		// --- Layer 1 (FisicoMentaleQuiz) ---
		if (layerIndex === 1) {
			if (p < 0.35) return 0;
			if (p >= 0.9) return 0;
			return 1;
		}
	
		// --- Layer 2 (PerformanceSection) ---
		if (layerIndex === 2) {
			if (p >= 0.85) return 1;
			return 0;
		}
	
		return 0;
    }
	
    /**
     * @param {number} layerIndex
     */
	getLayerZIndex(layerIndex) {
		const p = this._progress;
		
		if (layerIndex === 0) {
			if (p >= 0.9) return -9999;
			return 0;
		}
		
		if (layerIndex === 1) {
			if (p >= 0.9) return -9999;
			return p >= 0.35 ? 30 : -10;
		}
		
		if (layerIndex === 2) {
			if (p >= 0.85) return 50;
			return 10;
		}
		
		return 0;
    }
	
    /**
     * @param {number} layerIndex
     */
    isLayerActive(layerIndex) {
        return this.activeLayer === layerIndex;
    }

    /**
     * @param {number} layerIndex
     */
	getLayerStyle(layerIndex) {
		return '';
    }
}

export const layers = new LayerState();
