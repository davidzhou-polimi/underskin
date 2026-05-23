<script>
	/** @type {{ text?: string, onclick?: () => void, class?: string }} */
	let { text = 'Torna alla Narrazione Principale', onclick, class: className = '' } = $props();
</script>

<button
	class="bottone {className}"
	{onclick}
>
	<span class="bottone-text">{text}</span>
</button>

<style>
	.bottone {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 55px;
		padding: 0 24px;
		border: none;
		background: rgba(241, 250, 253, 0.4);
		border-radius: 32px;
		box-shadow: 1.495px 1.495px 2.989px 0px rgba(0, 0, 0, 0.23);
		cursor: pointer;
		appearance: none;
	}

	.bottone-text {
		font-family: 'Rethink Sans', sans-serif;
		font-weight: 500;
		font-size: 17.936px;
		line-height: 14.947px;
		color: #0f2d54;
		white-space: nowrap;
	}
</style>
