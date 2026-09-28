# One-shape UI morph loop

A 14-second, 1440×1440, 60 fps loop at 120 BPM (7 bars, 28 beats). A single element morphs through twelve UI states, with a cursor driving every change.

The states run: button → loader → check → dynamic island → player (play/pause morph) → scrub → volume slider (stretches past max) → toggle → liquid tab indicator → self-drawing chart with a tooltip → ⌘K (type to filter) → toast → button.

## Pipeline

```bash
pip install numpy scipy imageio-ffmpeg     # ffmpeg with tmix + libx264 comes from imageio-ffmpeg
python3 tools/analyze.py                   # audio/song.* → audio/beats.json (BPM, beat, first downbeat)
node tools/render.mjs cues                 # SFX cue list out of index.html → audio/cues.json
python3 tools/mix.py                       # 7 bars from the downbeat + UI sounds peak-aligned → audio/mix.wav
node tools/render.mjs purity               # seek(t) is pure: same DOM under random seek history
node tools/render.mjs loop                 # t=0 and t=end are identical
node tools/render.mjs bounds               # tightest margin between the shape and the frame edge
node tools/render.mjs beats [0.42]         # one frame per beat (optional offset in beats) → out/beats/
node tools/render.mjs full                 # 840 frames × 4 subframes → out/sub/
tools/encode.sh                            # tmix motion blur → out/morph-loop.mp4
```

Open `index.html?play` in a browser for a live preview. `index.html?t=6.8` shows a single frame.

## Swapping in the real song

`audio/song.wav` is a synthesized 120 BPM placeholder made by `tools/placeholder_song.py`. To use the real song, put the Mixkit file at `audio/song.mp3` (or `.wav`), delete the placeholder, and re-run the pipeline. The measured beat length flows into the page as `?beat=`, so a track at 119.4 BPM retimes the whole animation to match.

## How it works

- **Time:** everything is authored in beats. `seek(t)` computes every style from `t`: there are no CSS transitions, no timers, and no state carried between frames.
- **Springs:** each spring is a closed-form step response, with ζ ≥ 0.82 so overshoot stays under 1%. A value that changes target many times is the sum of one step per change. Each change is also summed from the previous loop, so the value and its velocity are identical at t=0 and t=end.
- **Pill edges:** the toggle knob and tab indicator are two edges on two springs. The edge that leads the motion rides a stiffer spring, so it stretches ahead of the trailing edge.
- **Drags:** while the cursor is held, the value is computed from the cursor's position. On release, a free spring response starts from the released value and velocity.
- **Camera:** the camera zooms in log space. Zoom-outs start slightly before the shape grows, so a growing shape never outruns the frame.
- **Content swaps:** each piece of content has its own enter and exit window. It exits before the next piece enters, and fades in with a short blur.
- **Audio:** UI sounds are synthesized, and each sound's peak is measured and placed exactly on its beat.
