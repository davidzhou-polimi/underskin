<script>
	import { onMount } from 'svelte';
	import LogoNav from '$lib/components/navbar/LogoNav.svelte';
	import LinkNav from '$lib/components/navbar/LinkNav.svelte';

	let { hideThreshold = 15, showThreshold = 15 } = $props();

	let hidden = $state(false);
	let lastScrollY = 0;

	onMount(() => {
		lastScrollY = window.scrollY;

		const handleScroll = () => {
			const currentScrollY = window.scrollY;

			// Blocca visibile in prossimità del top della pagina
			if (currentScrollY <= 10) {
				hidden = false;
				lastScrollY = currentScrollY;
				return;
			}

			const delta = currentScrollY - lastScrollY;

			if (delta > hideThreshold) {
				hidden = true;
				lastScrollY = currentScrollY;
			} else if (delta < -showThreshold) {
				hidden = false;
				lastScrollY = currentScrollY;
			}
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', handleScroll);
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
		transition: transform var(--transition-duration-normal) var(--transition-easing-default);
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