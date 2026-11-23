## Summary

What does this change and why? Link the issue.

Closes #

## Products touched

- [ ] `library`
- [ ] `docs`
- [ ] `studio`
- [ ] `web`
- [ ] `shop`
- [ ] `repo`

## Changes

-

## Testing

Run and paste the checks from the `AGENTS.md` of every product checked above.
Do not tick a product you did not touch, and do not mark a product's checks when
they did not run.

| Product | Checks to follow |
| --- | --- |
| `library` | [`library/AGENTS.md`](../library/AGENTS.md) |
| `docs` | [`docs/AGENTS.md`](../docs/AGENTS.md) |
| `studio` | [`software/AGENTS.md`](../software/AGENTS.md) |
| `web` | [`web/AGENTS.md`](../web/AGENTS.md) |
| `shop` | [`shop/AGENTS.md`](../shop/AGENTS.md) |
| `repo` | [`AGENTS.md`](../AGENTS.md) and [`LABELS.md`](../LABELS.md) |

```text
$ paste the commands and their real output
```

## Risk

What can break for someone using the library, the docs or Studio today? Mention
renamed library assets, install-path changes, a broken site build, or a schema
or protocol change. Write `none` when there is no such risk.

## Checklist

- [ ] The issue is linked and the labels match [`LABELS.md`](../LABELS.md) and
      the product `AGENTS.md` tables.
- [ ] Every touched product's checks ran; the real output is pasted above.
- [ ] Generated files were regenerated, not hand-edited.
- [ ] The diff contains only this change.
