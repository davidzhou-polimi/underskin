## 2024-05-15 - MatchMedia parsing overhead in hot loops
**Learning:** `window.matchMedia(query)` is slow because it parses the CSS media query string every time it is called. Doing this inside high-frequency event listeners like `mousemove` causes unnecessary CPU load and can contribute to micro-stutters.
**Action:** Always cache the `MediaQueryList` object (`const mql = window.matchMedia(query)`) during initialization and only read its `.matches` property inside hot loops or add an event listener to it.
## 2024-05-17 - Window dimensions in hot loops
**Learning:** Accessing `window.innerWidth` and `window.innerHeight` inside high-frequency event listeners like `mousemove` forces the browser to read from the DOM repeatedly. While reading properties doesn't always trigger layout thrashing like `getBoundingClientRect`, it still introduces unnecessary overhead.
**Action:** Cache window dimensions outside the hot loop and update them inside a `resize` event listener.
