"""Generate a 1024x1024 pixel-art style app icon PNG (pure stdlib)."""
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

def in_triangle(px, py, a, b, c):
    def sign(p1, p2, p3):
        return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1])
    d1 = sign((px, py), a, b)
    d2 = sign((px, py), b, c)
    d3 = sign((px, py), c, a)
    has_neg = d1 < 0 or d2 < 0 or d3 < 0
    has_pos = d1 > 0 or d2 > 0 or d3 > 0
    return not (has_neg and has_pos)

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

TOP = (36, 31, 77)
BOT = (14, 12, 32)
BOX = (247, 242, 227)
BAR = (85, 83, 95)
SHADOW = (0, 0, 0)

rows = []
for y in range(H):
    row = bytearray([0])
    t = y / (H - 1)
    bg = lerp(TOP, BOT, t)
    for x in range(W):
        px, py = x + 0.5, y + 0.5
        r, g, b = bg

        # box shadow (offset down)
        if rrect_sdf(px, py, 512, 522, 400, 210, 40) <= 0:
            r, g, b = 10, 8, 22

        # message box
        if rrect_sdf(px, py, 512, 500, 400, 210, 40) <= 0:
            r, g, b = BOX

        # text bars
        for cy, hw in ((422, 320), (500, 280), (578, 320)):
            if rrect_sdf(px, py, 512, cy, hw, 26, 14) <= 0:
                r, g, b = BAR

        # speech tail
        if in_triangle(px, py, (468, 696), (556, 696), (512, 748)):
            r, g, b = BOX

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
                   "RPGPlayer", "Assets.xcassets", "AppIcon.appiconset", "icon-1024.png")
os.makedirs(os.path.dirname(out), exist_ok=True)
with open(out, "wb") as f:
    f.write(png)
print("written", out, len(png), "bytes")
