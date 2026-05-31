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

    get progress() {
        return this._progress;
    }

    set progress(value) {
        // Determina la direzione dello scroll globale
        if (value > this._progress) {
            this.scrollDirection = 'down';
        } else if (value < this._progress) {
            this.scrollDirection = 'up';
        }
        this.lastProgress = this._progress;
        this._progress = value;
    }

    setActiveLayer(index) {
        if (index >= 0 && index < this.totalLayers) {
            this.activeLayer = index;
        }
    }

    getLayerOpacity(layerIndex) {
		const p = this._progress;
	
		// --- Layer 0 (IntroTextSection) ---
		if (layerIndex === 0) {
			// Si nasconde quando il quiz appare (p >= 0.35)
			if (p >= 0.85) return 0;
			return 1;
		}
	
		// --- Layer 1 (CerchiQuiz) ---
		if (layerIndex === 1) {
			if (p < 0.35) return 0;
			if (p >= 0.85) return 0;
			return 1;
		}
	
		// --- Layer 2 (PerformanceSection) ---
		if (layerIndex === 2) {
			if (p >= 0.85) return 1;
			return 0;
		}
	
		return 0;
	}
	
	getLayerZIndex(layerIndex) {
		const p = this._progress;
		
		if (layerIndex === 0) {
			if (p >= 0.35) return -9999;
			return 0;
		}
		
		if (layerIndex === 1) {
			if (p >= 0.85) return -9999;
			return p >= 0.35 ? 30 : -10;
		}
		
		if (layerIndex === 2) {
			if (p >= 0.85) return 50;
			return 10;
		}
		
		return 0;
	}
	
    isLayerActive(layerIndex) {
        return this.activeLayer === layerIndex;
    }

	getLayerStyle(layerIndex) {
		const opacity = this.getLayerOpacity(layerIndex);
		if (opacity === 0) {
			return 'display: none;';
		}
		return '';
	}
}

export const layers = new LayerState();
