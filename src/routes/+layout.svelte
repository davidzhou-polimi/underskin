<script>
	import 'modern-normalize/modern-normalize.css';
	import '$lib/styles/tokens.css';
	import favicon from '$lib/assets/favicon.svg';
	import { tooltip } from '$lib/stores/tooltipState.svelte.js';
	import CursorTooltip from '$lib/components/ui/CursorTooltip.svelte';

    let { children } = $props();

	// Creiamo una variabile reattiva locale che traccia lo stato del tooltip
	let tooltipState = $derived(tooltip.current);
</script>

<svelte:head>
	<title>UnderSkin</title>
	<meta name="description" content="Descrizione" />

	<link rel="icon" href={favicon} />
</svelte:head>

<div 
	role="application"
	onmousemove={(e) => tooltip.updatePosition(e.clientX, e.clientY)}
	style:cursor={tooltipState.cursor}
	style="min-height: 100vh; display: flex; flex-direction: column;"
>
	{@render children()}

	{#if tooltipState.visible && tooltipState.text}
		<CursorTooltip 
			visible={true}
			text={tooltipState.text} 
			type={tooltipState.type} 
			x={tooltipState.x} 
			y={tooltipState.y} 
		/>
	{/if}
</div>
