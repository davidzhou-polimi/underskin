import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		// Il sito richiede comunque WebGL e CSS moderni: es2022 evita transpilazione
		// e helper inutili per browser che non potrebbero comunque usare il sito.
		target: 'es2022'
	}
});
