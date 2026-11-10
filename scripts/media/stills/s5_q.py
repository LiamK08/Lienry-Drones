"""Queue wrapper for s5-software: runs the hero office scene (s5_glass.py) as a still with the laptop, then grades."""
import os, subprocess, sys
here = os.path.dirname(os.path.abspath(__file__))
out = os.path.join(here, os.environ["OUT"])
subprocess.run([sys.executable, os.path.join(here, "s5_glass.py"), "preview", out], check=True)
sys.path.insert(0, here)
import h1lib as L
a = L.load_px(out)
L.save_px(L.grade(a, seed=6, levels=(0.02, 0.95), sat=0.98, vignette=0.08, grain=0.8), out.replace(".png", "_g.jpg"), quality=92)
print("graded")
