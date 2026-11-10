#!/bin/bash
# Download the CC0 photographs, HDRIs and textures the still scenes use (Poly Haven, polyhaven.com) into assets/.
# The solar cells are drawn in code (solar.py) and the laptop screen (assets/sw_screen.png) is a capture of the
# site's own software window, so neither is fetched here.
set -e
cd "$(dirname "$0")"
mkdir -p assets/bp assets/bp_roof assets/tex
PH=https://dl.polyhaven.org/file/ph-assets
get() { [ -s "$2" ] || curl -fsSL -o "$2" "$1"; }
for h in docklands_02 dry_field balcony rooftop_day potsdamer_platz; do get "$PH/HDRIs/hdr/8k/${h}_8k.hdr" "assets/${h}_8k.hdr"; done
for h in lythwood_terrace residential_garden bloem_olive_house; do get "$PH/HDRIs/hdr/4k/${h}_4k.hdr" "assets/${h}_4k.hdr"; done
for f in DSC08801 DSC08806 DSC08816 DSC08820; do get "$PH/HDRIs/extra/Backplates/lythwood_terrace/jpg_plain/$f.jpg" "assets/bp/$f.jpg"; done
for f in IMG_0600 IMG_0613; do get "$PH/HDRIs/extra/Backplates/residential_garden/jpg_plain/$f.jpg" "assets/bp/rg_$f.jpg"; done
for f in 6228 6240 6243 6246; do get "$PH/HDRIs/extra/Backplates/rooftop_day/jpg_plain/20160517-IMG_$f-HDR.jpg" "assets/bp_roof/IMG_$f.jpg"; done
for t in grass_ground brick_wall_09 grey_roof_tiles_02; do
  for m in diff nor_gl rough; do get "$PH/Textures/jpg/2k/$t/${t}_${m}_2k.jpg" "assets/tex/${t}_${m}_2k.jpg"; done
done
echo "assets ready"
