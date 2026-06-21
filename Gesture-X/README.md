GestureX ✋⚡

Browser-based hand-tracking playground

Turn your webcam into an input device. Draw in air. Stretch neon between your hands. No installs. No builds. Just open and play.

✨ Modes
Air Draw → Paint glowing trails + trigger anime-style effects
Neon Elastic → Build a reactive neon web between both hands
Mode Console → Switch between experiences instantly
🚀 Quick Start
# Recommended (avoids camera issues)
python -m http.server 5500
# or
npx serve .

Open:
http://localhost:5500/GestureX%20Modes.html

Or just double-click any .html file (may require camera permissions fix).

🧠 Tech Stack
MediaPipe Hands (CDN)
Vanilla JS + Canvas
requestAnimationFrame loops
Fully client-side (no backend)
🎮 Controls

Air Draw

☝️ Draw → index up
✊ Erase → fist
✋ Effects → palm (Anime mode only)

Mode Console

1 → Air Draw
2 → Neon Elastic
R → Reload
⚙️ Requirements
Modern browser (Chrome / Firefox / Safari)
Webcam access
Decent lighting
~30 FPS capable device
🔥 Highlights
Neon multi-layer rendering (glow + core)
Gesture recognition with debounce + priority
Two-hand interaction support
Smooth trails, ghosting, and motion decay
Zero dependencies beyond CDN scripts
⚠️ Notes
Use localhost if camera fails on file://
Fast motion / low light can reduce tracking quality
Everything runs locally — no data leaves your device
🧩 Files
Air draw.html
Neon elastic hand toy.html
GestureX Modes.html
gesturex.png
💡 Philosophy

Minimal setup. Maximum interaction.
GestureX is built as a pure front-end playground — hackable, readable, and fun.