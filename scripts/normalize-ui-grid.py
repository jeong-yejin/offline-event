#!/usr/bin/env python3
"""Normalize fixed CSS layout lengths to a 4px grid (rem uses the current 16px root).

Run with --write to apply, or --check to report drift. Relative units, breakpoints,
hairline borders, tracking, colors, animation timing and domain numbers are not spacing tokens.
"""
import argparse
import math
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
GRID = 4
ROOT_FONT = 16
PROPERTY = re.compile(
    r'^(?:--[\w-]+|(?:row-|column-)?gap|(?:scroll-)?(?:padding|margin)(?:-[\w-]+)?|'
    r'(?:min-|max-)?(?:width|height|inline-size|block-size)|(?:top|right|bottom|left)|'
    r'inset(?:-[\w-]+)?|font-size|line-height|border(?:-[\w-]+)?-radius|'
    r'grid-(?:template|auto)-(?:columns|rows)|flex(?:-basis)?|background-size|'
    r'transform|translate|perspective|outline-offset)$'
)
DECLARATION = re.compile(r'(?<=[{;])\s*([\w-]+)\s*:\s*([^;{}]+)')
LENGTH = re.compile(r'(?<![\w.])(-?(?:\d*\.)?\d+)(px|rem)\b')
COMMENTS = re.compile(r'/\*[\s\S]*?\*/')


def normalize(value):
    def replace(match):
        pixels = float(match[1]) * (ROOT_FONT if match[2] == 'rem' else 1)
        snapped = max(GRID, math.floor(abs(pixels) / GRID + 0.5) * GRID) if pixels else 0
        if pixels < 0:
            snapped = -snapped
        return f'{snapped}px'
    return LENGTH.sub(replace, value)


def rewrite(source):
    # Mask comments at identical offsets so declarations never match prose/examples.
    masked = COMMENTS.sub(lambda match: ' ' * len(match[0]), source)
    edits = []
    for match in DECLARATION.finditer(masked):
        if not PROPERTY.fullmatch(match[1]):
            continue
        start, end = match.span(2)
        value = source[start:end]
        updated = normalize(value)
        if value != updated:
            edits.append((start, end, updated, match[1], value))
    for start, end, updated, _, _ in reversed(edits):
        source = source[:start] + updated + source[end:]
    return source, edits


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--write', action='store_true')
    group.add_argument('--check', action='store_true')
    args = parser.parse_args()
    count = 0
    files = sorted([*ROOT.glob('src/**/*.css'), *ROOT.glob('public/**/*.css')])
    for path in files:
        source = path.read_text()
        updated, edits = rewrite(source)
        if not edits:
            continue
        count += len(edits)
        print(f'{path.relative_to(ROOT)}: {len(edits)} declarations')
        if args.write:
            path.write_text(updated)
    print(f'{len(files)} CSS files checked; {count} declarations {"updated" if args.write else "off grid"}.')
    return 1 if args.check and count else 0


if __name__ == '__main__':
    raise SystemExit(main())
