<script>
	import ArchetypePageLayout from '$lib/components/sections/archetypes/ArchetypePageLayout.svelte';
	import IntrusiveThoughts from '$lib/components/sections/archetypes/IntrusiveThoughts.svelte';
</script>

<ArchetypePageLayout archetype="favorito">
	{#snippet uniqueSection()}
		<IntrusiveThoughts />
	{/snippet}
</ArchetypePageLayout>
