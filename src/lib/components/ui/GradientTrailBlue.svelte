<script>
	/** @type {HTMLElement | undefined} */
	let stage;
	let x = $state(0);
	let y = $state(0);
	/** @type {{ id: number, x: number, y: number }[]} */
	let blobs = $state([]);
	let idCounter = 0;
	let isInside = $state(false);
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let spawnTimer;
	let lastSpawnX = 0;
	let lastSpawnY = 0;
	const SPAWN_RATE = 40; // ms
	const MAX_BLOBS = 16;
	const MIN_DIST = 5; // px — 只在移动超过此距离时生成 blob

	/**
	 * @param {MouseEvent} e
	 */
	function onEnter(e) {
		isInside = true;
		x = e.clientX; y = e.clientY;
		lastSpawnX = x; lastSpawnY = y;
		spawnBlobs();
	}

	/**
	 * @param {MouseEvent} e
	 */
	function onMove(e) {
		if (!isInside) return;
		x = e.clientX; y = e.clientY;
	}

	function onLeave() {
		isInside = false;
		clearTimeout(spawnTimer);
	}

	function spawnBlobs() {
		if (!isInside) return;

		const dx = x - lastSpawnX;
		const dy = y - lastSpawnY;
		const dist = Math.sqrt(dx * dx + dy * dy);

		if (dist >= MIN_DIST) {
			const id = idCounter++;
			blobs = [
				...blobs.slice(-MAX_BLOBS + 1),
				{ id, x, y }
			];
			lastSpawnX = x;
			lastSpawnY = y;
		}

		spawnTimer = setTimeout(spawnBlobs, SPAWN_RATE);
	}
</script>

<div
	class="stage"
	bind:this={stage}
	onmouseenter={onEnter}
	onmousemove={onMove}
	onmouseleave={onLeave}
>
	{#each blobs as blob (blob.id)}
		<div class="blob" style="--tx:{blob.x}px;--ty:{blob.y}px"></div>
	{/each}
</div>

<style>
	.stage {
		width: 100vw;
		height: 100vh;
			background: var(--stage-background, #ffffff);
		overflow: hidden;
		position: relative;
	}

	.blob {
		position: absolute;
		inset: 0;
		transform: translate(var(--tx), var(--ty));
		filter: blur(60px) saturate(1.2);
		animation: trail 0.85s ease-out forwards;
		pointer-events: none;
	}

	.blob::before { content: ''; position: absolute; width: 220px; height: 220px; border-radius: 50%; top: -110px; left: -110px; background: radial-gradient(circle, rgba(106,150,223,0.7) 0%, rgba(53,85,160,0.5) 40%, rgba(26,47,92,0) 100%); }
	.blob::after  { content: ''; position: absolute; width: 180px; height: 180px; border-radius: 50%; top: -90px; left: -90px; background: radial-gradient(circle, rgba(106,150,223,0.6) 0%, rgba(53,85,160,0.4) 50%, rgba(26,47,92,0) 100%); }

	@keyframes trail {
		0%   { opacity: 0.75; transform: translate(var(--tx), var(--ty)) scale(0.6); }
		60%  { opacity: 0.4; }
		100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(1.4); }
	}
</style>
