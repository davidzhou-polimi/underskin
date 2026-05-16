# Istruzioni per Copilot / Antigravity

## Regole operative
- Prima di generare codice, elenca in 2–3 righe le assunzioni che stai facendo.
- Se la soluzione richiede un refactoring, segnalalo prima di scrivere codice.
- Commenta solo il *perché*, non il *cosa*.
- Non proporre soluzioni tampone: se il problema è architetturale, dillo esplicitamente.
- Quando il lavoro su una funzionalità o un fix è concluso – sia perché l'utente conferma esplicitamente, sia perché si passa a un task diverso – suggerisci un messaggio di commit in formato Conventional Commits basandoti sul lavoro svolto. Segui questo stile:
```
  chore: setup project architecture and AI guardrails

  - AI Guardrails: aggiunto `AGENTS.md` con le regole del progetto
  - Dependencies: aggiunto `gsap` come dipendenza principale
  - Cleanup: rimosso `src/lib/index.js` di default di SvelteKit
```

---

## Stack
- SvelteKit 2 + Svelte 5 (runes) + GSAP 3
- Build: Vite 8 + `@sveltejs/adapter-static`
- Reset CSS: `modern-normalize`
- **ES6+ vanilla JS** – niente TypeScript, nessun file `.ts`
  (`jsconfig.json` e `svelte-check` sono presenti solo per il type-checking dell'editor via JSDoc)
- CSS moderno

---

## Struttura `src/lib/` — non deviare mai
- `components/sections/` → macro sezioni della pagina (es. `HeroSection.svelte`, `ProblemSection.svelte`). Lavoriamo sempre "sezione per sezione".
- `components/ui/` → micro componenti visivi riutilizzabili (es. `Button.svelte`, `Card.svelte`)
- `actions/` → Svelte Actions con GSAP (camelCase: `fadeUp.js`)
- `utils/` → funzioni pure, nessun side effect
- `stores/` → stato condiviso tra componenti non correlati, come file `.svelte.js`
  (es. `scrollProgress.svelte.js`, `activeSection.svelte.js`).
  Usa `$state` e `$derived` a livello di modulo; importa direttamente dove serve.
  Le Actions in `src/lib/actions/` possono scrivere su questi store per propagare eventi scroll/GSAP al resto dell'interfaccia.
- `styles/tokens/` → design tokens come variabili CSS (`--color-*`, `--space-*`, `--radius-*`)
- `styles/tokens.css` → entry point che importa tutti i file in `tokens/`; è l'unico file da importare nei componenti o nel layout globale

---

## CSS
- Usa solo variabili token: `var(--space-4)`, non `margin: 16px`.
- Niente stili inline. Niente valori magici hardcoded.
- Non ridefinire variabili CSS all'interno dei blocchi `<style>` dei componenti: consuma sempre quelle definite in `tokens/`.
- I token sono disponibili globalmente via `tokens.css` – non reimportare singoli file di `tokens/` nei componenti.

---

## GSAP e animazioni
- **Tutto GSAP va in `src/lib/actions/`**, non nei blocchi `<script>` dei componenti né nei file di route.
- Struttura obbligatoria – animazione semplice:
```js
export function fadeUp(node, params = {}) {
  const tween = gsap.from(node, { y: 40, opacity: 0, ...params });
  return {
    destroy() { tween.kill(); }  // cleanup obbligatorio
  };
}
```
- Struttura obbligatoria – ScrollTrigger:
```js
export function scrollReveal(node, params = {}) {
  const ctx = gsap.context(() => {
    gsap.from(node, {
      scrollTrigger: { trigger: node, ...params.trigger },
      ...params.tween
    });
  }, node);
  return {
    destroy() { ctx.revert(); }  // revert() fa il kill di tween + ScrollTrigger
  };
}
```
- Uso nel componente: `<div use:fadeUp={{ duration: 0.8 }}>`, `<div use:scrollReveal={{ trigger: { start: 'top 80%' }, tween: { y: 40, opacity: 0 } }}>`.
- Prima di suggerire una nuova libreria di animazione, verifica se GSAP copre già il caso d'uso. Se necessaria, aggiorna la sezione **Stack** prima di procedere.

---

## Svelte 5
Non usare i vecchi store Svelte 4 (`writable`, `readable`) né le label reattive legacy.

Criterio di scelta per la gestione degli effetti:

| Caso | Strumento |
|---|---|
| Animazione / GSAP | Action in `src/lib/actions/` via `use:` |
| Side effect reattivo (reagisce a stato) | `$effect` |
| Operazione DOM one-shot non reattiva (es. `getBoundingClientRect`, init libreria terza) | `onMount` |
| Stato locale al componente | `$state` / `$derived` nel `<script>` |
| Stato condiviso parent/child | Context API |
| Stato condiviso tra componenti non correlati | Store in `stores/*.svelte.js` |

---

## SvelteKit – architettura "sezione per sezione"
- I file di route (`+page.svelte`, `+layout.svelte`) non contengono logica di animazione né layout complesso.
- `+page.svelte` funge da puro orchestratore: impila in sequenza le sezioni importate da `components/sections/`.
- Nello scrollytelling, si usa uno store globale (es. `src/lib/stores/scroll.svelte.js`) e un'azione GSAP (es. `use:trackSection`) per tracciare quale sezione è visibile.

---

## Import
- Usa sempre l'alias `$lib`: mai path relativi.
  - ✅ `import { fadeUp } from '$lib/actions/fadeUp.js'`
  - ❌ `import { fadeUp } from '../../lib/actions/fadeUp.js'`
- Niente barrel files (`index.js`) salvo decisione esplicita – importa sempre dal file diretto.
- I file in `stores/` si importano direttamente dove servono, senza re-export intermedi.