#!/bin/bash
# The final 15 s hero film, rendered here on the CPU: each shot with its own sampling, landscape then portrait
# (or one of them: render_final.sh portrait).
# Re-running carries on: frames already on disk are kept (use_overwrite False).
cd "$(dirname "$0")"
B=$PWD
run() {  # mode frames-dir res start end spp adaptive min [extra env]
  env FRAMES="$B/$2" RES=$3 FRAME_START=$4 FRAME_END=$5 SAMPLES=$6 ADAPTIVE=$7 ADAPTIVE_MIN=$8 DEVICE=${DEVICE:-CPU} $9 \
    ${PY:-venv/bin/python} glass.py "$1" >> "$B/$2.log" 2>&1
}
for pass in ${@:-landscape portrait}; do
  if [ $pass = landscape ]; then M=motion-full; R=1280x720; X="DESK=0.9,-1.3"; else M=motion-portrait; R=608x1080; X="DESK=4.6,-1.7"; fi
  D=final-$pass-frames
  run $M $D $R 1 72 48 0.08 8 "$X"      # the wide
  run $M $D $R 73 124 24 0.02 0 "$X"    # the close-up: spray, mist and water need even sampling
  run $M $D $R 125 192 48 0.08 8 "$X"   # the medium
  run $M $D $R 193 233 48 0.08 8 "$X"   # lane 2: the wide again, as it climbs to the top of the next lane
  run $M $D $R 234 277 24 0.02 0 "$X"   # the close-up as the valve opens beside the washed lane
  run $M $D $R 278 360 48 0.08 8 "$X"   # the medium, washing down
  echo "$pass done $(date +%H:%M)" >> "$B/final.progress"
done
echo done > "$B/final.done"
