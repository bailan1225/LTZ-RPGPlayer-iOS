"""Generate a 1024x1024 app icon PNG for RPGTranslate (pure stdlib).

Design: blue-green gradient background, rounded white document sheet with
folded corner, three horizontal text lines and a "文" glyph hint (translation).
"""
import math
import os
import struct
import zlib

W = H = 1024

def rrect_sdf(px, py, cx, cy, hw, hh, r):
    qx = abs(px - cx) - (hw - r)
    qy = abs(py - cy) - (hh - r)
    ax, ay = max(qx, 0.0), max(qy, 0.0)
    outside = math.hypot(ax, ay)
    inside = min(max(qx, qy), 0.0)
    return outside + inside

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def lerp2(c1, c2, c3, t):
    # two-segment gradient for a bit more depth
    if t < 0.5:
        return lerp(c1, c2, t * 2)
    return lerp(c2, c3, (t - 0.5) * 2)

TOP = (18, 66, 78)
MID = (28, 118, 116)
BOT = (44, 172, 158)
SHEET = (250, 250, 246)
FOLD = (196, 214, 208)
LINE = (86, 110, 112)
ACCENT = (242, 176, 74)

rows = []
for y in range(H):
    row = bytearray([0])
    t = y / (H - 1)
    bg = lerp2(TOP, MID, BOT, t)
    for x in range(W):
        px, py = x + 0.5, y + 0.5
        r, g, b = bg

        # sheet shadow (offset down-right)
        if rrect_sdf(px, py, 522, 522, 372, 402, 36) <= 0:
            r, g, b = 6, 34, 38

        # document sheet
        if rrect_sdf(px, py, 512, 502, 372, 402, 36) <= 0:
            r, g, b = SHEET

        # folded corner (bottom-right)
        if px >= 512 and py >= 502:
            if (px - 512) + (py - 502) <= 150 and rrect_sdf(px, py, 512, 502, 372, 402, 36) <= 0:
                r, g, b = FOLD
        # fold crease line
        if rrect_sdf(px, py, 596, 588, 3, 74, 3) <= 0:
            r, g, b = (170, 196, 190)

        # text lines
        for cy, hw in ((340, 290), (436, 250), (532, 250)):
            if rrect_sdf(px, py, 512, cy, hw, 26, 13) <= 0:
                r, g, b = LINE

        # "文" glyph strokes (simplified: vertical + horizontal + cross)
        gx, gy = 640, 340
        # vertical stroke
        if rrect_sdf(px, py, gx, gy, 12, 44, 6) <= 0:
            r, g, b = ACCENT
        # horizontal stroke
        if rrect_sdf(px, py, gx, gy - 30, 44, 12, 6) <= 0:
            r, g, b = ACCENT
        # cross strokes
        if rrect_sdf(px, py, gx - 34, gy + 8, 8, 34, 4) <= 0:
            r, g, b = ACCENT
        if rrect_sdf(px, py, gx + 34, gy + 8, 8, 34, 4) <= 0:
            r, g, b = ACCENT
        if rrect_sdf(px, py, gx, gy + 26, 44, 10, 5) <= 0:
            r, g, b = ACCENT

        row += bytes((r, g, b, 255))
    rows.append(bytes(row))

raw = b"".join(rows)

def chunk(tag, data):
    c = struct.pack(">I", len(data)) + tag + data
    c += struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    return c

png = b"\x89PNG\r\n\x1a\n"
png += chunk(b"IHDR", struct.pack(">IIBBBBB", W, H, 8, 6, 0, 0, 0))
png += chunk(b"IDAT", zlib.compress(raw, 9))
png += chunk(b"IEND", b"")

out = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   "RPGTranslate", "Assets.xcassets", "AppIcon.appiconset", "icon-1024.png")
os.makedirs(os.path.dirname(out), exist_ok=True)
with open(out, "wb") as f:
    f.write(png)
print("written", out, len(png), "bytes")
