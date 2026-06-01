<script>
	import 'modern-normalize/modern-normalize.css';
	import '$lib/styles/tokens.css';
	import favicon from '$lib/assets/favicon.svg';
	import { tooltip } from '$lib/stores/tooltipState.svelte.js';
	import CursorTooltip from '$lib/components/ui/CursorTooltip.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>UnderSkin</title>
	<meta name="description" content="Descrizione" />

	<link rel="icon" href={favicon} />
</svelte:head>

<div 
	role="application"
	onmousemove={(e) => tooltip.updatePosition(e.clientX, e.clientY)}
	style:cursor={tooltip.current.cursor}
	style="min-height: 100vh; display: flex; flex-direction: column;"
>
	{@render children()}

	{#if tooltip.current.visible && tooltip.current.text}
		<CursorTooltip 
			text={tooltip.current.text} 
			type={tooltip.current.type} 
			x={tooltip.current.x} 
			y={tooltip.current.y} 
		/>
	{/if}
</div>
