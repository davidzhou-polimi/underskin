<script>
	import imgSfumatura from '$lib/assets/cerchi-quiz/sfumatura.svg';

	let leftState = $state('default');
	let rightState = $state('default');

	let showBottone = $derived(leftState === 'click' || rightState === 'click');
</script>

<div class="cerchi-quiz" class:expanded={showBottone}>
	<!-- Left Circle -->
	<button
		class="circle left"
		class:hover={leftState === 'hover'}
		class:clicked={leftState === 'click'}
		onmouseenter={() => leftState = 'hover'}
		onmouseleave={() => leftState = 'default'}
		onclick={() => leftState = 'click'}
	>
		<svg class="border-svg" viewBox="0 0 407 407">
			<circle 
				cx="203.5" 
				cy="203.5" 
				r="201.5" 
				fill="none" 
				stroke="var(--Color-Content-Primary, #071E45)" 
				stroke-width="4" 
				stroke-dasharray="0 16" 
				stroke-linecap="round" 
			/>
		</svg>

		{#if leftState === 'click'}
			<div class="sfumatura-bg">
				<img src={imgSfumatura} alt="" />
			</div>
		{/if}
		<span class="text" class:gradient={leftState !== 'default'}>mentale</span>
	</button>

	<!-- Right Circle -->
	<button
		class="circle right"
		class:hover={rightState === 'hover'}
		class:clicked={rightState === 'click'}
		onmouseenter={() => rightState = 'hover'}
		onmouseleave={() => rightState = 'default'}
		onclick={() => rightState = 'click'}
	>
		<svg class="border-svg" viewBox="0 0 407 407">
			<circle 
				cx="203.5" 
				cy="203.5" 
				r="201.5" 
				fill="none" 
				stroke="var(--Color-Content-Primary, #071E45)" 
				stroke-width="4" 
				stroke-dasharray="0 16" 
				stroke-linecap="round" 
			/>
		</svg>

		{#if rightState === 'click'}
			<div class="sfumatura-bg">
				<img src={imgSfumatura} alt="" />
			</div>
		{/if}
		<span class="text" class:gradient={rightState !== 'default'}>fisico</span>
	</button>

	<!-- Bottone -->
	{#if showBottone}
		<div class="bottone">
			<div class="bottone-bg"></div>
			<div class="bottone-text">testo</div>
		</div>
	{/if}
</div>

<style>
	.cerchi-quiz {
		display: flex;
		align-items: center;
		position: relative;
		width: 974px;
	}

	.cerchi-quiz.expanded {
		height: 473px;
	}

	.circle {
		width: 407px;
		height: 407px;
		border-radius: 203.5px;
		border: none; 
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		background: transparent;
		cursor: pointer;
		appearance: none;
		padding: 0;
	}

	.border-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 1;
	}

	.circle.left {
		z-index: 1;
	}

	.circle.right {
		margin-left: 160px;
		z-index: 0;
	}

	.text {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 800;
		font-size: 56px;
		color: var(--Color-Content-Primary, #071E45);
		white-space: nowrap;
		position: relative;
		z-index: 2;
	}

	.text.gradient {
		background: linear-gradient(
			107deg,
			var(--color-archetipo-favorito) 18.14%,
			var(--color-archetipo-insoddisfatto) 50%,
			var(--color-archetipo-infortunato) 92.63%
		);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	.sfumatura-bg {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		border-radius: 203.5px;
		z-index: 1;
	}

	.sfumatura-bg img {
		width: 268.906px;
		height: 211.104px;
		transform: rotate(-13.02deg);
		filter: blur(40px);
		opacity: 0.6;
	}

	.bottone {
		position: absolute;
		bottom: 0;
		left: 390px;
		width: 194px;
		height: 66px;
	}

	.bottone-bg {
		position: absolute;
		inset: 0;
		background: rgba(241, 250, 253, 0.65);
		border-radius: var(--radius-m);
		box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.23);
	}

	.bottone-text {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 400;
		font-size: 16px;
		line-height: 20px;
		color: black;
	}
</style>