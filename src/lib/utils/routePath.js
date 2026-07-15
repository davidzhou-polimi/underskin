import { base } from '$app/paths';

/**
 * Rimuove il base path dal pathname per confronti di rotta stabili in dev (base '') e in
 * produzione (base '/underskin'). page.url.pathname include SEMPRE il base: confrontarlo
 * direttamente con '/' o '/about' funziona solo in locale e fallisce silenziosamente sul deploy.
 * Robusto in entrambi i casi: se il base è già assente, ritorna il pathname invariato.
 * @param {string} pathname - tipicamente page.url.pathname
 * @returns {string} pathname senza base, sempre con leading slash
 */
export function relativePathname(pathname) {
	return pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname;
}
