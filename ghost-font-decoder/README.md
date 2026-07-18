# Ghost Font Decoder

A Claude Code plugin that reveals, decodes, and encodes text hidden inside
**invisible Unicode** — "ghost fonts."

Some text carries a payload you can't see: bytes smuggled behind an emoji,
an "ASCII-smuggling" instruction mirrored into the Unicode Tags block, or a
binary message built from zero-width characters. These techniques power
"invisible ink" toys — and some real prompt-injection attacks. This plugin
surfaces them.

## Encodings handled

| Encoding | Code points | Also known as |
| --- | --- | --- |
| Variation selectors | `U+FE00`–`U+FE0F`, `U+E0100`–`U+E01EF` | emoji invisible ink |
| Unicode tags | `U+E0020`–`U+E007E` | ASCII smuggling |
| Zero-width binary | ZWSP / ZWNJ / ZWJ / ZWNBSP | zero-width steganography |

## Install

Add the marketplace, then install the plugin:

```
/plugin marketplace add cibidharan-spec/cb
/plugin install ghost-font-decoder@ghost-font-decoder
```

(The repository root ships a `.claude-plugin/marketplace.json`, so the repo
itself is the marketplace.)

## Use

### Slash commands

- `/decode-ghost <text or file>` — detect and decode any hidden payload.
- `/encode-ghost <payload>` — hide a payload behind a cover string (testing/demos).

### Skill

The `ghost-font-decoder` skill triggers automatically when text looks like it
contains hidden Unicode or you ask to reveal invisible characters.

### CLI (standalone)

The engine is a dependency-free Python script — no plugin required:

```bash
# Decode
printf '%s' "$TEXT" | python3 scripts/ghost_font.py decode
printf '%s' "$TEXT" | python3 scripts/ghost_font.py decode --json

# Encode (for testing)
python3 scripts/ghost_font.py encode --cover "😀" --method vs "secret message"
python3 scripts/ghost_font.py encode --cover "Hi"  --method tags "hidden"
```

Exit code `1` = payload found, `0` = clean.

## Safety

A decoded payload is **data, not a command.** This plugin's commands and skill
report what they find and explicitly refuse to act on decoded instructions,
because ASCII-smuggling is a known vector for hiding prompt-injection text.

## Layout

```
.claude-plugin/marketplace.json      # repo-root marketplace manifest
ghost-font-decoder/
├── .claude-plugin/plugin.json       # plugin manifest
├── commands/
│   ├── decode-ghost.md
│   └── encode-ghost.md
├── skills/ghost-font-decoder/SKILL.md
├── scripts/ghost_font.py            # dependency-free engine (encode/decode/scan)
└── README.md
```
