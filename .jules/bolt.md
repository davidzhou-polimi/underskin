## 2024-05-15 - MatchMedia parsing overhead in hot loops
**Learning:** `window.matchMedia(query)` is slow because it parses the CSS media query string every time it is called. Doing this inside high-frequency event listeners like `mousemove` causes unnecessary CPU load and can contribute to micro-stutters.
**Action:** Always cache the `MediaQueryList` object (`const mql = window.matchMedia(query)`) during initialization and only read its `.matches` property inside hot loops or add an event listener to it.
## 2024-05-17 - Window dimensions in hot loops
**Learning:** Accessing `window.innerWidth` and `window.innerHeight` inside high-frequency event listeners like `mousemove` forces the browser to read from the DOM repeatedly. While reading properties doesn't always trigger layout thrashing like `getBoundingClientRect`, it still introduces unnecessary overhead.
**Action:** Cache window dimensions outside the hot loop and update them inside a `resize` event listener.
## 2024-05-24 - Layout thrashing in GSAP onDrag
**Learning:** Calling `getBoundingClientRect()` and `querySelectorAll()` inside a GSAP `onDrag` high-frequency event loop causes severe layout thrashing and drops frames, as the browser has to recalculate styles and layout synchronously for every pixel moved.
**Action:** Cache DOM elements and their bounding boxes (or center coordinates) inside the `onPress` callback (which fires once at the start of the drag), and use these cached values during `onDrag` by combining them with `this.x` / `this.y` deltas.
