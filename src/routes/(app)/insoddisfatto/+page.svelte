<script>
	import ArchetypePageLayout from '$lib/components/sections/archetypes/ArchetypePageLayout.svelte';
	import PerfectionGame from '$lib/components/sections/archetypes/PerfectionGame.svelte';
</script>

<ArchetypePageLayout archetype="insoddisfatto">
	{#snippet uniqueSection()}
		<PerfectionGame />
	{/snippet}
</ArchetypePageLayout>
