#!/bin/bash
# Grade the final frames and write the web masters and first-frame posters into the repo's masters folder.
set -eo pipefail
cd "$(dirname "$0")"
M="$PWD/../masters"
mkdir -p "$M"
for pass in ${@:-landscape portrait}; do
  N=final-$pass
  n=$(ls $N-frames/f_*.png | wc -l)
  [ "$n" = 192 ] || { echo "$N has $n frames"; exit 1; }
  ${PY:-venv/bin/python} post.py $N 2>&1 | grep -vE "^graded [0-9]+/"
  if [ $pass = landscape ]; then V=h1-hero-film-v2-1280x720; P=h2-hero-frame-v2-1280x720; else V=h3-hero-film-tall-v2-608x1080; P=h4-hero-frame-tall-v2-608x1080; fi
  ffmpeg -v error -y -framerate 24 -start_number 1 -i $N-graded/g_%04d.png -frames:v 192 \
    -vf "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p" -c:v libx264 -preset slow -crf 17 -tune grain \
    -profile:v high -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
    -g 24 -movflags +faststart -an "$M/$V.mp4"
  cp $N-graded/g_0001.png "$M/$P.png"
done
ls -la "$M"
