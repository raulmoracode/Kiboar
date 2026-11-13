## Summary

What does this change and why? Link the issue.

Closes #

## Changes

-

## Testing

What did you run, and what did it print? The CI runs `tools/lint.py`, the KiCad
format check and the sample render; anything it cannot see (Kiboar version,
board you tested with, screenshots) goes here.

```text
$ python3 tools/lint.py
```

## Risk

What can break for someone using the library today? Mention renamed symbols or
footprints, changed model paths, or a new non-commercial file. Write `none`
when there is no such risk.

## Checklist

- [ ] `python3 tools/lint.py` passes.
- [ ] `kicad-cli sym upgrade` and `fp upgrade` leave the library unchanged.
- [ ] New symbols have `Manufacturer`, `MPN`, `ki_keywords` and `ki_fp_filters`
      where they apply.
- [ ] New footprints have a courtyard and an `(attr ...)` that matches the pads.
- [ ] New CAD data has its origin and licence recorded in `NOTICE`, or is
      original work covered by MIT.
