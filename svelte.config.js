import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			// Genera .gz/.br accanto agli asset: Netlify li serve direttamente
			precompress: true,
			strict: true
		}),
		prerender: {
			handleMissingId: 'ignore'
		}
	}
};

export default config;