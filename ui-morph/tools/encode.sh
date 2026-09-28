#!/usr/bin/env bash
# 240 fps subframes → tmix (4-frame average = motion blur) → every 4th → 60 fps H.264 + mix.wav
set -euo pipefail
cd "$(dirname "$0")/.."
FF=${FFMPEG:-$(python3 -c "import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())")}
"$FF" -v error -stats -y \
  -framerate 240 -i out/sub/%05d.png \
  -i audio/mix.wav \
  -filter_complex "[0:v]format=rgb24,tmix=frames=4:weights='1 1 1 1',select='eq(mod(n\,4)\,3)',setpts=N/(60*TB),format=yuv420p[v]" \
  -map "[v]" -map 1:a -r 60 \
  -c:v libx264 -preset slow -crf 14 -tune animation -movflags +faststart \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 256k -shortest \
  out/morph-loop.mp4
echo "→ out/morph-loop.mp4"
