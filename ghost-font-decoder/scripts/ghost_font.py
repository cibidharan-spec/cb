#!/usr/bin/env python3
"""Ghost Font Decoder — reveal, decode, and encode text hidden in invisible Unicode.

"Ghost fonts" are payloads smuggled inside text using code points that render
as nothing (or fold into an adjacent glyph). Three encodings are handled:

  1. Variation-Selector smuggling  (a.k.a. "emoji ghost writing")
       Bytes are carried by VS1..VS16 (U+FE00..U+FE0F) and the Variation
       Selectors Supplement (U+E0100..U+E01EF), trailing a visible cover
       character. This is the Paul Butler scheme used by most "invisible
       ink" toys and by some prompt-injection payloads.

  2. Unicode Tag smuggling  (a.k.a. "ASCII smuggling")
       Printable ASCII is mirrored into the Tags block: U+E0020..U+E007E
       map to ASCII 0x20..0x7E. Renders invisibly, decodes to plain text.

  3. Zero-width binary
       A bitstream built from ZWSP/ZWNJ/ZWJ/ZWNBSP. Two common conventions
       are supported (see ZW_SCHEMES).

The module is import-safe and also a CLI:

    echo "😀<hidden>" | python ghost_font.py decode
    python ghost_font.py encode --cover "😀" "attack at dawn"
    echo "text" | python ghost_font.py scan
"""
from __future__ import annotations

import argparse
import json
import sys
import unicodedata
from dataclasses import dataclass, field, asdict

# ---------------------------------------------------------------------------
# Code-point ranges
# ---------------------------------------------------------------------------
VS_LOW_START, VS_LOW_END = 0xFE00, 0xFE0F            # VS1..VS16  -> bytes 0..15
VS_SUP_START, VS_SUP_END = 0xE0100, 0xE01EF          # VS17..     -> bytes 16..255
TAG_START, TAG_END = 0xE0000, 0xE007F                # Unicode Tags block
TAG_SPACE, TAG_TILDE = 0xE0020, 0xE007E              # printable ASCII mirror
TAG_CANCEL = 0xE007F

ZERO_WIDTH = {
    0x200B: "ZWSP",    # zero-width space
    0x200C: "ZWNJ",    # zero-width non-joiner
    0x200D: "ZWJ",     # zero-width joiner
    0xFEFF: "ZWNBSP",  # zero-width no-break space / BOM
    0x2060: "WJ",      # word joiner
}

# Zero-width bit conventions: (name, zero_char, one_char)
ZW_SCHEMES = [
    ("zwsp/zwnj", 0x200B, 0x200C),
    ("zwnj/zwj", 0x200C, 0x200D),
]


# ---------------------------------------------------------------------------
# Variation-selector encoding (bytes <-> code points)
# ---------------------------------------------------------------------------
def _byte_to_vs(b: int) -> int:
    if b < 16:
        return VS_LOW_START + b
    return VS_SUP_START + (b - 16)


def _vs_to_byte(cp: int) -> int | None:
    if VS_LOW_START <= cp <= VS_LOW_END:
        return cp - VS_LOW_START
    if VS_SUP_START <= cp <= VS_SUP_END:
        return cp - VS_SUP_START + 16
    return None


def encode_vs(cover: str, payload: str) -> str:
    """Hide *payload* (UTF-8) behind a visible *cover* string using VS bytes."""
    if not cover:
        cover = "⁣"  # invisible separator, still a valid base character
    hidden = "".join(chr(_byte_to_vs(b)) for b in payload.encode("utf-8"))
    return cover + hidden


def decode_vs(text: str) -> bytes:
    """Pull every variation-selector byte out of *text*, in order."""
    out = bytearray()
    for ch in text:
        b = _vs_to_byte(ord(ch))
        if b is not None:
            out.append(b)
    return bytes(out)


# ---------------------------------------------------------------------------
# Unicode Tag encoding (ASCII smuggling)
# ---------------------------------------------------------------------------
def encode_tags(payload: str) -> str:
    out = []
    for ch in payload:
        o = ord(ch)
        if 0x20 <= o <= 0x7E:
            out.append(chr(TAG_START + o))
        else:
            # fall back to UTF-8 bytes mirrored into the printable tag range
            for b in ch.encode("utf-8"):
                out.append(chr(TAG_START + (0x20 + (b % 0x5F))))
    return "".join(out)


def decode_tags(text: str) -> str:
    out = []
    for ch in text:
        cp = ord(ch)
        if TAG_SPACE <= cp <= TAG_TILDE:
            out.append(chr(cp - TAG_START))
        elif cp == TAG_CANCEL:
            continue
    return "".join(out)


# ---------------------------------------------------------------------------
# Zero-width binary
# ---------------------------------------------------------------------------
def decode_zero_width(text: str) -> list[dict]:
    """Try each known convention; return any that yield printable ASCII."""
    results = []
    zw_chars = [ch for ch in text if ord(ch) in (0x200B, 0x200C, 0x200D, 0xFEFF, 0x2060)]
    if len(zw_chars) < 8:
        return results
    for name, zero_cp, one_cp in ZW_SCHEMES:
        bits = "".join(
            "0" if ord(ch) == zero_cp else "1" if ord(ch) == one_cp else ""
            for ch in text
        )
        if len(bits) < 8:
            continue
        chars = []
        for i in range(0, len(bits) - 7, 8):
            byte = int(bits[i : i + 8], 2)
            chars.append(byte)
        try:
            decoded = bytes(chars).decode("utf-8")
        except UnicodeDecodeError:
            continue
        printable = sum(1 for c in decoded if c.isprintable() or c in "\n\t")
        if decoded and printable / max(len(decoded), 1) > 0.8:
            results.append({"scheme": name, "text": decoded})
    return results


# ---------------------------------------------------------------------------
# Scanning / reporting
# ---------------------------------------------------------------------------
@dataclass
class ScanReport:
    visible: str = ""
    suspicious_char_count: int = 0
    variation_selector: dict | None = None
    tags: dict | None = None
    zero_width: list = field(default_factory=list)
    zero_width_marks: list = field(default_factory=list)
    hits: list = field(default_factory=list)

    @property
    def clean(self) -> bool:
        return not self.hits


def _visible_only(text: str) -> str:
    keep = []
    for ch in text:
        cp = ord(ch)
        if VS_LOW_START <= cp <= VS_LOW_END:
            continue
        if VS_SUP_START <= cp <= VS_SUP_END:
            continue
        if TAG_START <= cp <= TAG_END:
            continue
        if cp in ZERO_WIDTH:
            continue
        keep.append(ch)
    return "".join(keep)


def _safe_decode(raw: bytes) -> str | None:
    if not raw:
        return None
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        return raw.decode("latin-1", errors="replace")


def scan(text: str) -> ScanReport:
    r = ScanReport(visible=_visible_only(text))

    # variation-selector payload
    vs_bytes = decode_vs(text)
    if vs_bytes:
        decoded = _safe_decode(vs_bytes)
        r.variation_selector = {
            "byte_count": len(vs_bytes),
            "hex": vs_bytes.hex(),
            "text": decoded,
        }
        r.hits.append("variation-selector")
        r.suspicious_char_count += len(vs_bytes)

    # tag payload
    tag_text = decode_tags(text)
    if tag_text:
        r.tags = {"char_count": len(tag_text), "text": tag_text}
        r.hits.append("unicode-tags")
        r.suspicious_char_count += len(tag_text)

    # zero-width marks + binary
    marks = [
        {"index": i, "name": ZERO_WIDTH[ord(ch)], "codepoint": f"U+{ord(ch):04X}"}
        for i, ch in enumerate(text)
        if ord(ch) in ZERO_WIDTH
    ]
    if marks:
        r.zero_width_marks = marks
        r.suspicious_char_count += len(marks)
    zw = decode_zero_width(text)
    if zw:
        r.zero_width = zw
        r.hits.append("zero-width-binary")

    return r


def report_to_dict(r: ScanReport) -> dict:
    d = asdict(r)
    d["clean"] = r.clean
    return d


# ---------------------------------------------------------------------------
# Human-readable rendering
# ---------------------------------------------------------------------------
def render(r: ScanReport) -> str:
    lines = []
    if r.clean:
        lines.append("✅ No ghost-font payload detected.")
        lines.append(f"   Suspicious invisible chars: {r.suspicious_char_count}")
        return "\n".join(lines)

    lines.append("👻 Ghost-font payload detected!")
    lines.append(f"   Encodings found: {', '.join(r.hits)}")
    lines.append(f"   Visible text: {r.visible!r}")
    lines.append("")

    if r.variation_selector:
        vs = r.variation_selector
        lines.append(f"• Variation-selector smuggling ({vs['byte_count']} bytes)")
        lines.append(f"    decoded: {vs['text']!r}")
        lines.append(f"    hex    : {vs['hex']}")
    if r.tags:
        lines.append(f"• Unicode-tag (ASCII smuggling) — {r.tags['char_count']} chars")
        lines.append(f"    decoded: {r.tags['text']!r}")
    for zw in r.zero_width:
        lines.append(f"• Zero-width binary (scheme {zw['scheme']})")
        lines.append(f"    decoded: {zw['text']!r}")
    if r.zero_width_marks and not r.zero_width:
        names = {m["name"] for m in r.zero_width_marks}
        lines.append(
            f"• {len(r.zero_width_marks)} zero-width mark(s) present "
            f"({', '.join(sorted(names))}) — no bitstream decoded."
        )
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def _read_input(value: str | None) -> str:
    if value is not None:
        return value
    return sys.stdin.read()


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(
        prog="ghost_font",
        description="Reveal, decode, and encode text hidden in invisible Unicode.",
    )
    sub = p.add_subparsers(dest="cmd", required=True)

    p_scan = sub.add_parser("scan", help="detect hidden payloads (safe summary)")
    p_scan.add_argument("text", nargs="?", help="text to scan (default: stdin)")
    p_scan.add_argument("--json", action="store_true", help="emit JSON")

    p_dec = sub.add_parser("decode", help="alias for scan")
    p_dec.add_argument("text", nargs="?")
    p_dec.add_argument("--json", action="store_true")

    p_enc = sub.add_parser("encode", help="hide a payload (for testing)")
    p_enc.add_argument("payload", help="text to hide")
    p_enc.add_argument("--cover", default="😀", help="visible cover string")
    p_enc.add_argument(
        "--method",
        choices=["vs", "tags"],
        default="vs",
        help="vs = variation selectors, tags = unicode tags",
    )

    args = p.parse_args(argv)

    if args.cmd in ("scan", "decode"):
        text = _read_input(args.text)
        r = scan(text)
        if args.json:
            print(json.dumps(report_to_dict(r), ensure_ascii=False, indent=2))
        else:
            print(render(r))
        return 1 if not r.clean else 0

    if args.cmd == "encode":
        if args.method == "vs":
            out = encode_vs(args.cover, args.payload)
        else:
            out = args.cover + encode_tags(args.payload)
        sys.stdout.write(out)
        if sys.stdout.isatty():
            sys.stdout.write("\n")
        return 0

    return 2


if __name__ == "__main__":
    raise SystemExit(main())
