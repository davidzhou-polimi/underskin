<script>
	import { onMount } from 'svelte';
	import LogoNav from '$lib/components/navbar/LogoNav.svelte';
	import LinkNav from '$lib/components/navbar/LinkNav.svelte';

	let { revealDelay = 5000, hideThreshold = 8 } = $props();

	let hidden = $state(false);
	let lastScrollY = 0;
	/** @type {number | undefined} */
	let idleRevealTimeout;

	onMount(() => {
		lastScrollY = window.scrollY;

		const scheduleReveal = () => {
			clearTimeout(idleRevealTimeout);
			idleRevealTimeout = window.setTimeout(() => {
				hidden = false;
			}, revealDelay);
		};

		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			const delta = currentScrollY - lastScrollY;

			scheduleReveal();

			if (currentScrollY <= 0) {
				hidden = false;
				lastScrollY = 0;
				return;
			}

			if (delta < 0) {
				hidden = false;
				lastScrollY = currentScrollY;
				return;
			}

			if (delta > hideThreshold) {
				hidden = true;
				lastScrollY = currentScrollY;
			}
		};

		scheduleReveal();
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', handleScroll);
			clearTimeout(idleRevealTimeout);
		};
	});
</script>

<header class:hidden class="navbar">
	<nav class="navbar__inner" aria-label="Primary">
		<LogoNav />
		<LinkNav />
	</nav>
</header>

<style>
	.navbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 10;
		pointer-events: none;
		background: transparent;
		transform: translateY(0);
		transition: transform 220ms ease;
		will-change: transform;
	}

	.navbar.hidden {
		transform: translateY(-100%);
	}

	.navbar__inner {
		display: flex;
		align-items: flex-end;
		width: 100%;
		min-height: var(--spacing-7);
		padding-block-start: var(--spacing-3);
		padding-inline-start: var(--spacing-10);
		padding-inline-end: var(--spacing-10);
		pointer-events: auto;
	}
</style>