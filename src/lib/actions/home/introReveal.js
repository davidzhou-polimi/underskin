import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

/**
 * @param {HTMLElement} node
 */
export function introReveal(node) {
	const ctx = gsap.context(() => {
		const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

		tl.from(node.querySelectorAll('.intro-circle'), {
			opacity: 0,
			scale: 0.7,
			transformOrigin: 'center center',
			stagger: 0.18,
			duration: 1.2
		});

		tl.from(
			node.querySelector('.intro-title'),
			{ opacity: 0, y: 30, duration: 1.0 },
			'-=0.6'
		);

		tl.from(
			node.querySelector('.scroll-hint-content'),
			{ opacity: 0, y: 12, duration: 0.8 },
			'+=0'
		);

		// Commento solo il PERCHÉ: Crea un rimbalzo continuo per la freccia dell'invito allo scroll
		gsap.to(node.querySelector('.scroll-arrow'), {
			y: 7,
			repeat: -1,
			yoyo: true,
			duration: 0.9,
			ease: 'sine.inOut',
			// delay: 4.5
		});

		// Commento solo il PERCHÉ: Dissolve gli elementi dell'intro quando si scende e li fa ricomparire quando si torna in cima
		ScrollTrigger.create({
			trigger: node,
			start: 'top top',
			end: 'top -100',
			onLeave: () => {
				gsap.to(node.querySelectorAll('.intro-circle'), {
					opacity: 0,
					scale: 0.7,
					transformOrigin: 'center center',
					stagger: 0.1,
					duration: 0.8,
					overwrite: 'auto'
				});
				gsap.to(node.querySelector('.intro-title'), {
					opacity: 0,
					y: -30,
					duration: 0.8,
					overwrite: 'auto'
				});
				gsap.to(node.querySelector('.scroll-hint'), {
					opacity: 0,
					y: 20,
					duration: 0.4,
					overwrite: 'auto'
				});
			},
			onEnterBack: () => {
				gsap.to(node.querySelectorAll('.intro-circle'), {
					opacity: 1,
					scale: 1,
					transformOrigin: 'center center',
					stagger: 0.1,
					duration: 0.8,
					overwrite: 'auto'
				});
				gsap.to(node.querySelector('.intro-title'), {
					opacity: 1,
					y: 0,
					duration: 0.8,
					overwrite: 'auto'
				});
				gsap.to(node.querySelector('.scroll-hint'), {
					opacity: 1,
					y: 0,
					duration: 0.8,
					delay: 0.5,
					overwrite: 'auto'
				});
			}
		});
	}, node);

	return { destroy() { ctx.revert(); } };
}


