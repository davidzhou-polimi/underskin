## 2024-05-15 - MatchMedia parsing overhead in hot loops
**Learning:** `window.matchMedia(query)` is slow because it parses the CSS media query string every time it is called. Doing this inside high-frequency event listeners like `mousemove` causes unnecessary CPU load and can contribute to micro-stutters.
**Action:** Always cache the `MediaQueryList` object (`const mql = window.matchMedia(query)`) during initialization and only read its `.matches` property inside hot loops or add an event listener to it.
## 2024-05-17 - Window dimensions in hot loops
**Learning:** Accessing `window.innerWidth` and `window.innerHeight` inside high-frequency event listeners like `mousemove` forces the browser to read from the DOM repeatedly. While reading properties doesn't always trigger layout thrashing like `getBoundingClientRect`, it still introduces unnecessary overhead.
**Action:** Cache window dimensions outside the hot loop and update them inside a `resize` event listener.
## 2024-05-24 - Layout thrashing in GSAP onDrag
**Learning:** Calling `getBoundingClientRect()` and `querySelectorAll()` inside a GSAP `onDrag` high-frequency event loop causes severe layout thrashing and drops frames, as the browser has to recalculate styles and layout synchronously for every pixel moved.
**Action:** Cache DOM elements and their bounding boxes (or center coordinates) inside the `onPress` callback (which fires once at the start of the drag), and use these cached values during `onDrag` by combining them with `this.x` / `this.y` deltas.

## 2024-07-28 - Layout thrashing in mousemove with requestAnimationFrame throttle
**Learning:** Calling `getBoundingClientRect()` synchronously inside a high-frequency `mousemove` event handler causes severe layout thrashing, as it forces the browser to calculate layouts constantly. Statically caching `getBoundingClientRect()` outside of the `mousemove` event is incorrect because the element's bounding box might legitimately change due to scrolling or CSS transitions on hover (e.g., scaling up). Throttling DOM reads via `requestAnimationFrame` avoids layout thrashing while correctly ensuring the `isInside` check works properly when the layout does change during interaction.
**Action:** Throttle the high frequency execution in `mousemove` using `requestAnimationFrame` instead of caching `getBoundingClientRect` outside of it completely if elements inside are subjected to transform/scroll modifications.

## 2026-07-13 - Reactive state overhead in global event listeners
**Learning:** Updating Svelte reactive state (like `$state` properties) inside global high-frequency event listeners (like `mousemove` on the window/layout) triggers the reactivity graph and causes DOM style updates (e.g., CSS variable writes) on every frame, even when the UI element depending on that state (like a tooltip) is visually hidden. This wastes CPU cycles.
**Action:** Decouple non-reactive tracking from reactive state. Cache coordinates in standard JS variables during the hot loop, and only synchronize them to the reactive state when the component is actually visible (or right before making it visible).
