<script>
	/**
	 * @typedef {Object} Props
	 * @property {boolean} [showText=false] - Se mostrare la scritta descrittiva sotto il simbolino
	 * @property {string} [text='Scorri per iniziare'] - Il testo da visualizzare sotto il simbolino
	 */

	/** @type {Props} */
	let {
		showText = false,
		text = 'Scorri per iniziare'
	} = $props();
</script>

<div class="scroll-hint-wrapper" class:has-text={showText} aria-label={text}>
	<svg class="scroll-mouse-svg" viewBox="0 0 24 36" width="24" height="36" aria-hidden="true">
		<!-- Contenitore basso e arrotondato ispirato alla forma originale del mouse -->
		<rect x="4" y="3" width="16" height="26" rx="8" fill="none" stroke="var(--content-light-secondary)" stroke-width="1.2" stroke-opacity="0.75" />
		<!-- Pallina scorrevole interna -->
		<circle class="sliding-ball" cx="12" cy="10" r="2.5" fill="var(--content-light-secondary)" />
	</svg>
	
	{#if showText}
		<span class="scroll-label">{text}</span>
	{/if}
</div>

<style>
	.scroll-hint-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-1);
		pointer-events: none;
	}

	.scroll-mouse-svg {
		display: block;
		opacity: 0.6;
		overflow: visible;
	}

	.scroll-label {
		font-family: var(--font-family-base);
		font-size: var(--text-service-size);
		font-weight: var(--text-service-weight);
		color: var(--content-light-secondary);
		opacity: 0.6;
	}

	/* Commento solo il PERCHÉ: l'animazione ciclica della pallina trasmette visivamente il senso di direzione dello scroll */
	.scroll-mouse-svg .sliding-ball {
		animation: ballSlideCyclic 2.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
	}

	@keyframes ballSlideCyclic {
		0% {
			transform: translateY(0);
			opacity: 0;
		}
		20% {
			opacity: 1;
		}
		80% {
			opacity: 1;
		}
		100% {
			transform: translateY(12px);
			opacity: 0;
		}
	}
</style>
