import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			// GitHub Pages gestisce già gzip/br lato server
			precompress: false,
			strict: true
		}),
		prerender: {
			handleMissingId: 'ignore'
		},
		paths: {
			// In produzione BASE_PATH='/underskin' viene iniettato dal workflow CI.
			// In locale la variabile non è definita → base path vuoto → nessun impatto su npm run dev.
			base: process.env.BASE_PATH ?? ''
		}
	}
};

export default config;