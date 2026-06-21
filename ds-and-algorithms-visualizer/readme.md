# DSA Visualizer

An interactive, single-file Data Structures & Algorithms visualizer built with vanilla HTML, CSS, and JavaScript. No dependencies. No build step. Open in browser and go.

---

## Live Features

### Data Structures
| Structure | Operations |
|-----------|-----------|
| **Array** | Insert, Search, Delete, Traverse |
| **Linked List** | Insert Head/Tail, Search, Delete, Traverse |
| **Doubly Linked List** | Insert Head/Tail, Search, Delete |
| **Binary Tree** | Insert, In-order, Pre-order, Post-order, BFS |
| **BST** | Insert, Search, Delete, In-order |
| **Graph** | Add Edge, BFS, DFS (weighted) |

### Sorting Algorithms
| Algorithm | Complexity | Notes |
|-----------|-----------|-------|
| Insertion Sort | O(n²) / O(n) best | Step-by-step mode |
| Bubble Sort | O(n²) | Early exit optimized |
| Selection Sort | O(n²) | Exactly n−1 swaps |
| Merge Sort | O(n log n) | Divide & conquer |
| Quick Sort | O(n log n) avg | Pivot visualization |
| Shell Sort | O(n log n) | Gap sequence shown |
| Radix Sort | O(nk) | Bucket distribution display |
| Bucket Sort | O(n+k) avg | Float input supported |

### Search Algorithms
| Algorithm | Complexity | Notes |
|-----------|-----------|-------|
| Binary Search | O(log n) | Low/Mid/High pointers |
| Fibonacci Search | O(log n) | Fibonacci offset display |

---

## Usage

```bash
# No install needed — just open
open DataStructure.html
```

Or drag the file into any browser.

---

## Controls

- **▶ Run Sort** — animated full run, speed controlled by slider
- **Step →** — manual step-by-step, one operation at a time
- **Reset** — restore default data
- Each section shows **Before / After** state and a live **iteration log**

---

## Customization

All design tokens live in `:root` inside `<style>`:

```css
:root {
  --bg: #0a0a0f;
  --accent: #7c3aed;   /* primary purple */
  --accent2: #06b6d4;  /* cyan */
  --accent3: #f59e0b;  /* amber */
  --accent4: #10b981;  /* green */
}
```

Font swap (recommended):

```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Outfit:wght@700;800&display=swap" rel="stylesheet">
```

```css
--font-mono: 'JetBrains Mono', monospace;
--font-display: 'Outfit', sans-serif;
```

---

## File Structure

```
DataStructure.html   ← entire app, single file
README.md
```

No frameworks. No bundler. No node_modules.

---

## Browser Support

| Browser | Status |
|---------|--------|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Mobile (iOS/Android) | ✅ Responsive |

---

## Complexity Reference

| Operation | Array | Linked List | BST (avg) |
|-----------|-------|-------------|-----------|
| Access | O(1) | O(n) | O(log n) |
| Search | O(n) | O(n) | O(log n) |
| Insert | O(n) | O(1) head | O(log n) |
| Delete | O(n) | O(n) | O(log n) |

---

## License

MIT — use freely, no attribution required.
