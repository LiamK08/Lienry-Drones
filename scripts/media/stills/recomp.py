"""Re-composite a finished plate render with a new finish, without rendering again:
PLATE, FOCAL, SENSOR, PW, PH, CROP as the render; EXR= the render; OUT= the jpg; HI, WETK, PATCH as house_bay.py."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import h1lib as L, plate as P
E = os.environ.get
f = lambda k, d: float(E(k, d))
crop = tuple(int(v) for v in E("CROP").split(","))
pl = P.Plate(os.path.join(L.ASSETS, "bp", E("PLATE")), f("FOCAL", "38"), sensor=f("SENSOR", "35.9"), size=(int(f("PW", "7360")), int(f("PH", "4912"))), crop=crop)
exr = E("EXR")
mask = exr.replace(".exr", "_wet.exr")
grade = lambda s: L.grade(s, seed=2, levels=(0.0, f("HI", "1.0")), sat=f("SAT", "1.0"), vignette=0.06, grain=0.6)
patch = tuple(int(v) for v in E("PATCH", "").split(",")) if E("PATCH") else None
pl.composite(exr, E("OUT"), grade=grade, wet_mask=mask if os.path.exists(mask) else None, wet_k=f("WETK", "0.5"), patch=patch)
print("recomposited", E("OUT"))
