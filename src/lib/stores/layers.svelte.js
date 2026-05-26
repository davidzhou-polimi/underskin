/**
 * Store per gestire lo stato dei layer sovrapposti (stile Apple)
 */
class LayerState {
	activeLayer = $state(0);
	totalLayers = 3;
	_progress = $state(0);

	get progress() {
		return this._progress;
	}

	set progress(value) {
		this._progress = value;
	}

	setActiveLayer(index) {
		if (index >= 0 && index < this.totalLayers) {
			this.activeLayer = index;
		}
	}

	getLayerOpacity(layerIndex) {
		const p = this._progress;

		// Layer 0 (IntroTextSection): visibile, poi scompare
		if (layerIndex === 0) {
			if (p < 0.3) return 1; // Visibile
			if (p < 0.4) return 1 - (p - 0.3) / 0.1; // Fade out
			return 0;
		}

		// Layer 1 (CerchiQuiz): entra dopo Layer 0, visibile, scompare
		if (layerIndex === 1) {
			if (p < 0.35) return 0; // Nascosto
			if (p < 0.45) return (p - 0.35) / 0.1; // Fade in
			if (p < 0.7) return 1; // Visibile
			if (p < 0.8) return 1 - (p - 0.7) / 0.1; // Fade out
			return 0;
		}

		// Layer 2 (PerformanceSection): entra dopo Layer 1, resta
		if (layerIndex === 2) {
			if (p < 0.75) return 0; // Nascosto
			if (p < 0.85) return (p - 0.75) / 0.1; // Fade in
			return 1; // Visibile
		}

		return 0;
	}

	isLayerActive(layerIndex) {
		return this.activeLayer === layerIndex;
	}
}

export const layers = new LayerState();
