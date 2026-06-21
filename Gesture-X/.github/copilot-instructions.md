# Project Guidelines

## Scope
This workspace contains two standalone browser demos:
- Air Draw (`Air draw.html`): hand-tracking drawing and gesture-triggered visual effects.
- Neon Elastic Hand Toy (`Neon elastic hand toy.html`): two-hand elastic-band physics with optional twang audio.

Treat each HTML file as a self-contained app. Avoid cross-file shared state assumptions.

## Code Style
- Keep JavaScript inline in each HTML file unless a task explicitly requests refactoring.
- Follow existing naming patterns:
  - Constants in UPPER_SNAKE_CASE.
  - Functions and variables in camelCase.
- Preserve the existing section-divider style (`// --- Section ---`) when adding non-trivial logic.
- Prefer small helper functions over deeply nested logic blocks in animation/render loops.

## Architecture
- Both apps use MediaPipe Hands from CDN (`@mediapipe/hands`, `@mediapipe/camera_utils`, `@mediapipe/drawing_utils`).
- Rendering is canvas-based and frame-driven (`requestAnimationFrame`).
- Hand landmark usage relies on MediaPipe index conventions (for example: fingertips 4, 8, 12, 16, 20).
- Coordinates are mirrored to match webcam UX. Keep mirror transforms consistent when changing drawing or gesture logic.

## Build and Test
- No build step.
- No automated tests currently configured.
- Run by opening either HTML file in a modern browser and allowing camera access.
- If camera permissions fail with `file://`, serve the folder locally (for example, with any static server) and use `http://localhost`.

## Conventions and Pitfalls
- Do not remove fallback/error messaging around camera initialization.
- Keep effect/physics constants centralized near existing config blocks; avoid scattering magic numbers.
- Maintain cleanup logic for transient arrays (for example, particles/trails) to prevent frame-rate degradation.
- Audio behavior must remain user-gesture safe (AudioContext resume on interaction where needed).
- Prefer incremental tuning of thresholds (gesture openness, spring/tension values) instead of large jumps.
