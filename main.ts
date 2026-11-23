// News front page for Monday 23 November 2026.
// Draws one 1024x1024 PNG with a small built-in bitmap font.
// Standard library only. No network, no randomness, no dates at runtime:
// the picture is fixed, so two runs write identical bytes.

import * as fs from "node:fs";
import * as path from "node:path";
import * as zlib from "node:zlib";

const W = 1024;
const H = 1024;

// Palette: newsprint paper, ink, and flat section colours.
const PAPER: RGB = [247, 243, 231];
const INK: RGB = [26, 26, 26];
const RED: RGB = [179, 38, 30];
const BLUE: RGB = [29, 78, 137];
const TEAL: RGB = [18, 110, 110];
const GOLD: RGB = [196, 141, 28];
const SKY: RGB = [178, 213, 232];
const LEAF: RGB = [74, 124, 62];
const WHITE: RGB = [255, 255, 255];
const GREY: RGB = [110, 110, 104];
const SAND: RGB = [232, 222, 196];

type RGB = [number, number, number];

// ---------------------------------------------------------------- font ----
// A 5x7 bitmap font, uppercase only. Each glyph is 7 rows of 5 pixels.
// "1" means ink, "." means paper. Written fresh for this entry.
const FONT: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "01010", "00100", "00100", "00100", "01010", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
  ".": [".....", ".....", ".....", ".....", ".....", "01100", "01100"],
  ",": [".....", ".....", ".....", ".....", ".....", "01100", "01000"],
  "'": ["00100", "00100", "01000", ".....", ".....", ".....", "....."],
  ":": [".....", "01100", "01100", ".....", "01100", "01100", "....."],
  "-": [".....", ".....", ".....", "11111", ".....", ".....", "....."],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "!": ["00100", "00100", "00100", "00100", "00100", ".....", "00100"],
  "?": ["01110", "10001", "00001", "00110", "00100", ".....", "00100"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "+": [".....", "00100", "00100", "11111", "00100", "00100", "....."],
  "=": [".....", ".....", "11111", ".....", "11111", ".....", "....."],
  "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  "*": [".....", "00100", "10101", "01110", "10101", "00100", "....."],
};

function textWidth(text: string, scale: number): number {
  return text.length * 6 * scale - scale;
}

function drawText(
  px: Uint8Array,
  text: string,
  x: number,
  y: number,
  scale: number,
  color: RGB,
): void {
  let cx = x;
  for (const ch of text) {
    const glyph = FONT[ch] ?? FONT["?"];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (glyph[row][col] === "1") {
          fillRect(px, cx + col * scale, y + row * scale, scale, scale, color);
        }
      }
    }
    cx += 6 * scale;
  }
}

function drawTextCentred(
  px: Uint8Array,
  text: string,
  cx: number,
  y: number,
  scale: number,
  color: RGB,
): void {
  drawText(px, text, cx - Math.floor(textWidth(text, scale) / 2), y, scale, color);
}

// Wrap an uppercase string into lines that fit maxWidth pixels.
function wrapText(text: string, scale: number, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line === "" ? word : line + " " + word;
    if (textWidth(next, scale) <= maxWidth || line === "") {
      line = next;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line !== "") lines.push(line);
  return lines;
}

function drawTextBlock(
  px: Uint8Array,
  text: string,
  x: number,
  y: number,
  scale: number,
  maxWidth: number,
  lineGap: number,
  color: RGB,
): number {
  const lines = wrapText(text, scale, maxWidth);
  lines.forEach((lineText, i) => {
    drawText(px, lineText, x, y + i * (7 * scale + lineGap), scale, color);
  });
  return y + lines.length * (7 * scale + lineGap);
}

// ------------------------------------------------------------- pixels ----
function setPixel(px: Uint8Array, x: number, y: number, c: RGB): void {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = c[0];
  px[i + 1] = c[1];
  px[i + 2] = c[2];
}

function fillRect(
  px: Uint8Array,
  x: number,
  y: number,
  w: number,
  h: number,
  c: RGB,
): void {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) setPixel(px, xx, yy, c);
  }
}

function fillCircle(px: Uint8Array, cx: number, cy: number, r: number, c: RGB): void {
  for (let yy = cy - r; yy <= cy + r; yy++) {
    for (let xx = cx - r; xx <= cx + r; xx++) {
      const dx = xx - cx;
      const dy = yy - cy;
      if (dx * dx + dy * dy <= r * r) setPixel(px, xx, yy, c);
    }
  }
}

function ring(px: Uint8Array, cx: number, cy: number, r: number, t: number, c: RGB): void {
  for (let yy = cy - r - t; yy <= cy + r + t; yy++) {
    for (let xx = cx - r - t; xx <= cx + r + t; xx++) {
      const d = Math.sqrt((xx - cx) * (xx - cx) + (yy - cy) * (yy - cy));
      if (Math.abs(d - r) <= t / 2) setPixel(px, xx, yy, c);
    }
  }
}

function drawLine(px: Uint8Array, x0: number, y0: number, x1: number, y1: number, c: RGB): void {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let x = x0;
  let y = y0;
  for (;;) {
    setPixel(px, x, y, c);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}

function drawThickLine(
  px: Uint8Array,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  t: number,
  c: RGB,
): void {
  for (let ox = 0; ox < t; ox++) {
    for (let oy = 0; oy < t; oy++) {
      drawLine(px, x0 + ox, y0 + oy, x1 + ox, y1 + oy, c);
    }
  }
}

// Fill a convex polygon given as [x, y] points, scanline by scanline.
function fillPolygon(px: Uint8Array, pts: number[][], c: RGB): void {
  let minY = H;
  let maxY = 0;
  for (const p of pts) {
    minY = Math.min(minY, p[1]);
    maxY = Math.max(maxY, p[1]);
  }
  for (let y = minY; y <= maxY; y++) {
    const xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
        xs.push(a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
      }
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      for (let x = Math.ceil(xs[k]); x <= Math.floor(xs[k + 1]); x++) {
        setPixel(px, x, y, c);
      }
    }
  }
}

// ----------------------------------------------------------------- PNG ----
const CRC_TABLE: number[] = (() => {
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  const crcInput = new Uint8Array(4 + data.length);
  crcInput.set(out.subarray(4, 8 + data.length));
  view.setUint32(8 + data.length, crc32(crcInput));
  return out;
}

function encodePng(px: Uint8Array): Uint8Array {
  const raw = new Uint8Array(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0;
    raw.set(px.subarray(y * W * 3, (y + 1) * W * 3), y * (1 + W * 3) + 1);
  }
  const ihdr = new Uint8Array(13);
  const ihdrView = new DataView(ihdr.buffer);
  ihdrView.setUint32(0, W);
  ihdrView.setUint32(4, H);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type RGB
  const compressed = zlib.deflateSync(raw, { level: 9 });
  const parts: Uint8Array[] = [
    new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", new Uint8Array(compressed)),
    chunk("IEND", new Uint8Array(0)),
  ];
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

// ------------------------------------------------------------ pictures ----
// Lead picture: a globe above an empty conference table.
function drawGlobe(px: Uint8Array, cx: number, cy: number, r: number): void {
  fillCircle(px, cx, cy, r, SKY);
  ring(px, cx, cy, r, 5, BLUE);
  // Abstract land blobs: flat shapes, not a claimed-accurate map.
  fillCircle(px, cx - 38, cy - 30, 26, LEAF);
  fillCircle(px, cx + 42, cy + 8, 30, LEAF);
  fillCircle(px, cx - 8, cy + 52, 20, LEAF);
  fillCircle(px, cx + 58, cy - 48, 14, LEAF);
  // Meridians and parallels.
  for (let k = -2; k <= 2; k++) {
    const ox = (k * r) / 2.4;
    for (let a = 0; a <= 180; a += 6) {
      const t = (a * Math.PI) / 180;
      const ex = Math.round(cx + ox * Math.sin(t) + (r * 0.28 * k) / 2.4 * 0);
      const ey = Math.round(cy - r * Math.cos(t));
      setPixel(px, ex, ey, BLUE);
      setPixel(px, ex + 1, ey, BLUE);
    }
    void ox;
  }
  drawThickLine(px, cx - r + 8, cy, cx + r - 8, cy, 3, BLUE);
  // Empty chairs and table under the globe.
  fillRect(px, cx - 118, cy + r + 22, 236, 12, INK);
  for (const chairX of [cx - 108, cx - 52, cx + 8, cx + 64]) {
    fillRect(px, chairX, cy + r + 38, 40, 34, RED);
    fillRect(px, chairX + 4, cy + r + 72, 6, 22, INK);
    fillRect(px, chairX + 30, cy + r + 72, 6, 22, INK);
  }
  // One empty name plate on the table.
  fillRect(px, cx - 22, cy + r + 8, 44, 14, WHITE);
}

// Panel picture: a ship at sea with smoke, for the Benghazi story.
function drawShip(px: Uint8Array, x: number, y: number, w: number): void {
  const seaY = y + 108;
  fillRect(px, x, seaY, w, 34, SKY);
  for (let i = 0; i < 4; i++) {
    drawThickLine(px, x + 10 + i * 52, seaY + 10 + (i % 2) * 10, x + 42 + i * 52, seaY + 10 + (i % 2) * 10, 2, BLUE);
  }
  fillPolygon(
    px,
    [
      [x + 30, seaY - 6],
      [x + w - 26, seaY - 6],
      [x + w - 46, seaY + 26],
      [x + 50, seaY + 26],
    ],
    INK,
  );
  fillRect(px, x + 96, seaY - 44, 62, 38, WHITE);
  fillRect(px, x + 104, seaY - 36, 46, 10, BLUE);
  // Ink outline so the white cabin reads against the white panel.
  drawThickLine(px, x + 96, seaY - 44, x + 158, seaY - 44, 2, INK);
  drawThickLine(px, x + 96, seaY - 6, x + 158, seaY - 6, 2, INK);
  drawThickLine(px, x + 96, seaY - 44, x + 96, seaY - 6, 2, INK);
  drawThickLine(px, x + 158, seaY - 44, x + 158, seaY - 6, 2, INK);
  fillRect(px, x + 168, seaY - 58, 16, 52, RED);
  fillCircle(px, x + 176, seaY - 72, 10, GREY);
  fillCircle(px, x + 190, seaY - 84, 13, GREY);
  fillCircle(px, x + 206, seaY - 96, 9, GREY);
  drawThickLine(px, x + 40, seaY - 52, x + 40, seaY - 6, 4, INK);
}

// Panel picture: two flags over a table, for the Delhi talks.
function drawFlags(px: Uint8Array, x: number, y: number): void {
  // India: saffron, white, green, with a navy wheel dot.
  const fx = x + 22;
  fillRect(px, fx, y, 92, 20, [255, 153, 51]);
  fillRect(px, fx, y + 20, 92, 20, WHITE);
  fillRect(px, fx, y + 40, 92, 20, [19, 136, 8]);
  fillCircle(px, fx + 46, y + 30, 9, BLUE);
  // Ink outline so the white stripe reads against the white panel.
  drawThickLine(px, fx, y, fx + 92, y, 2, INK);
  drawThickLine(px, fx, y + 60, fx + 92, y + 60, 2, INK);
  drawThickLine(px, fx, y, fx, y + 60, 2, INK);
  drawThickLine(px, fx + 92, y, fx + 92, y + 60, 2, INK);
  // Nepal: crimson double pennant with a white border.
  const nx = x + 150;
  fillPolygon(
    px,
    [
      [nx, y],
      [nx + 84, y + 22],
      [nx, y + 34],
      [nx + 70, y + 52],
      [nx, y + 62],
    ],
    [220, 20, 60],
  );
  fillCircle(px, nx + 24, y + 16, 7, WHITE);
  fillCircle(px, nx + 20, y + 42, 6, WHITE);
  drawThickLine(px, fx + 4, y + 60, fx + 4, y + 118, 4, INK);
  drawThickLine(px, nx + 4, y + 62, nx + 4, y + 118, 4, INK);
  // Table with two document sheets in sand colour, fully outlined.
  fillRect(px, x + 8, y + 118, 236, 10, INK);
  for (const docX of [x + 52, x + 150]) {
    fillRect(px, docX, y + 104, 52, 14, SAND);
    drawThickLine(px, docX, y + 104, docX + 52, y + 104, 2, INK);
    drawThickLine(px, docX, y + 118, docX + 52, y + 118, 2, INK);
    drawThickLine(px, docX, y + 104, docX, y + 118, 2, INK);
    drawThickLine(px, docX + 52, y + 104, docX + 52, y + 118, 2, INK);
  }
}

// Panel picture: stumps, ball and scoreboard, for the cricket story.
function drawCricket(px: Uint8Array, x: number, y: number): void {
  fillRect(px, x, y + 96, 252, 46, LEAF);
  for (const sx of [x + 52, x + 68, x + 84]) {
    fillRect(px, sx, y + 44, 8, 52, GOLD);
  }
  fillRect(px, x + 54, y + 38, 38, 6, GOLD);
  fillCircle(px, x + 196, y + 66, 18, RED);
  drawLine(px, x + 184, y + 56, x + 208, y + 76, WHITE);
  // Scoreboard.
  fillRect(px, x + 18, y, 216, 34, INK);
  drawText(px, "NZ 157-4", x + 34, y + 7, 3, WHITE);
}

// -------------------------------------------------------------- layout ----
function panel(
  px: Uint8Array,
  x: number,
  y: number,
  w: number,
  h: number,
  accent: RGB,
): void {
  fillRect(px, x, y, w, h, WHITE);
  fillRect(px, x, y, w, 6, accent);
  for (let i = 0; i < w; i++) {
    setPixel(px, x + i, y + h - 1, INK);
  }
  drawThickLine(px, x, y, x, y + h, 2, INK);
  drawThickLine(px, x + w - 2, y, x + w - 2, y + h, 2, INK);
}

function main(): void {
  const px = new Uint8Array(W * H * 3);
  for (let i = 0; i < px.length; i += 3) {
    px[i] = PAPER[0];
    px[i + 1] = PAPER[1];
    px[i + 2] = PAPER[2];
  }

  // Masthead.
  fillRect(px, 24, 22, 976, 5, INK);
  drawTextCentred(px, "THE WORLD IN ONE PAGE", 512, 38, 6, INK);
  drawTextCentred(px, "MONDAY 23 NOVEMBER 2026", 512, 96, 4, RED);
  fillRect(px, 24, 142, 976, 3, INK);
  drawTextCentred(px, "ONE DAY  -  FOUR STORIES  -  EARLY EDITION", 512, 152, 2, INK);

  // Lead story: COP31.
  panel(px, 24, 178, 976, 330, RED);
  drawGlobe(px, 190, 300, 78);
  drawText(px, "CLIMATE  -  ANTALYA, TURKIYE", 372, 198, 2, RED);
  drawText(px, "NO DEAL", 372, 226, 5, INK);
  drawText(px, "AT COP31", 372, 268, 5, INK);
  drawTextBlock(
    px,
    "AUSTRALIA'S PM BLAMES 'DIFFICULT GEOPOLITICAL TIMES' AS TALKS END WITHOUT A FOSSIL-FUEL DEAL.",
    372,
    318,
    2,
    600,
    6,
    INK,
  );

  // Three stories below.
  const py = 524;
  const ph = 336;
  const pw = 317;
  const gap = 12;
  const xs = [24, 24 + pw + gap, 24 + 2 * (pw + gap)];

  // Libya.
  panel(px, xs[0], py, pw, ph, BLUE);
  drawShip(px, xs[0] + 16, py + 28, 285);
  drawText(px, "LIBYA  -  SECURITY", xs[0] + 16, py + 180, 2, BLUE);
  drawText(px, "UN SEEKS", xs[0] + 16, py + 206, 3, INK);
  drawText(px, "BENGHAZI PROBE", xs[0] + 16, py + 232, 3, INK);
  drawTextBlock(
    px,
    "AFTER SUNDAY SHIP ATTACKS, UN URGES INQUIRY.",
    xs[0] + 16,
    py + 264,
    2,
    285,
    5,
    INK,
  );

  // Delhi talks.
  panel(px, xs[1], py, pw, ph, GOLD);
  drawFlags(px, xs[1] + 16, py + 22);
  drawText(px, "INDIA  -  NEPAL", xs[1] + 16, py + 180, 2, GOLD);
  drawText(px, "DELHI TALKS", xs[1] + 16, py + 206, 3, INK);
  drawText(px, "TODAY", xs[1] + 16, py + 232, 3, INK);
  drawTextBlock(
    px,
    "NEPAL PM SHAH MEETS MODI: ENERGY, TRADE, CONNECTIVITY.",
    xs[1] + 16,
    py + 264,
    2,
    285,
    5,
    INK,
  );

  // Cricket.
  panel(px, xs[2], py, pw, ph, TEAL);
  drawCricket(px, xs[2] + 16, py + 20);
  drawText(px, "CRICKET  -  WELLINGTON", xs[2] + 16, py + 180, 2, TEAL);
  drawText(px, "INDIA", xs[2] + 16, py + 206, 3, INK);
  drawText(px, "CLOSE IN", xs[2] + 16, py + 232, 3, INK);
  drawTextBlock(
    px,
    "NEW ZEALAND 157-4 AT LUNCH, DAY 5. STILL 195 BEHIND.",
    xs[2] + 16,
    py + 264,
    2,
    285,
    5,
    INK,
  );

  // Also-today ticker.
  fillRect(px, 24, 876, 976, 62, INK);
  drawText(
    px,
    "ALSO: COP32 HEADS TO ADDIS ABABA, 2027 - CHESS GAME 1 TUESDAY IN GENEVA",
    40,
    898,
    2,
    WHITE,
  );

  // Footer.
  drawTextCentred(px, "DRAWN IN CODE  -  NO PHOTOGRAPHS  -  SOURCES IN README", 512, 958, 2, INK);
  fillRect(px, 24, 994, 976, 3, INK);

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "entry.png");
  fs.writeFileSync(outPath, encodePng(px));
}

main();
