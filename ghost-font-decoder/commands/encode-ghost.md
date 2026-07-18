---
description: Hide a payload inside invisible Unicode behind a visible cover string (for testing detectors and demos).
argument-hint: <payload to hide>
allowed-tools: Bash(python3:*)
---

# Encode Ghost Font

Produce a "ghost font" string: a visible cover with an invisible payload
smuggled inside it. Useful for testing the decoder, building demos, or
red-teaming a detector.

Payload requested: `$ARGUMENTS`

Steps:

1. If `$ARGUMENTS` is empty, ask what text to hide and what visible cover to use.

2. Encode with the variation-selector method (default) behind a cover emoji:

   ```bash
   python3 "${CLAUDE_PLUGIN_ROOT}/scripts/ghost_font.py" encode --cover "😀" --method vs "$ARGUMENTS"
   ```

   Use `--method tags` for Unicode-tag (ASCII-smuggling) style instead.

3. Return the encoded string in a code block and remind the user it will look
   like just the cover character but carries the hidden payload. Suggest they
   verify it round-trips with `/decode-ghost`.

Only use this for legitimate testing, education, and defensive research.
