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

		// Layer 0 (IntroTextSection): 完全可见，被 CerchiQuiz 从底部覆盖
		if (layerIndex === 0) {
			if (p < 0.45) return 1; // 完全可见，直到 CerchiQuiz 完全覆盖
			return 1; // 保持 1，直到被完全覆盖
		}

		// Layer 1 (CerchiQuiz): 滑入覆盖
		if (layerIndex === 1) {
			if (p < 0.35) return 0; // 隐藏
			if (p < 0.45) return (p - 0.35) / 0.1; // 滑入
			return 1;
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
