<script>
	import ArchetypePageLayout from '$lib/components/sections/archetypes/ArchetypePageLayout.svelte';
	import ShatterGlass from '$lib/components/sections/archetypes/ShatterGlass.svelte';
</script>

<ArchetypePageLayout archetype="infortunato">
	{#snippet uniqueSection()}
		<ShatterGlass />
	{/snippet}
</ArchetypePageLayout>
