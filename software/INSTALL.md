# Installing Kiboar Studio

Kiboar Studio 0.1 is an early, **unsigned** macOS build for testers. It is not
notarized, so macOS Gatekeeper blocks it by default. There are three ways to
install it; Homebrew is the cleanest.

## Requirements

- macOS 11 or newer.
- Apple Silicon for the `0.1.0` build. An Intel build is not published yet.
- No KiCad installation is needed.

## Homebrew (recommended)

```bash
brew tap raulmoracode/kiboar
brew install --cask kiboar-studio
```

If macOS blocks the first launch, remove the quarantine attribute from the
installed app:

```bash
xattr -dr com.apple.quarantine "/Applications/Kiboar Studio.app"
```

Update with `brew upgrade --cask kiboar-studio`. Uninstall with
`brew uninstall --cask kiboar-studio`.

## Installer script

The script verifies the published SHA-256, installs into `~/Applications` (no
sudo) and removes the quarantine attribute from that copy.

```bash
curl -fsSL https://raw.githubusercontent.com/raulmoracode/Kiboar/main/software/scripts/install-macos.sh -o /tmp/install-kiboar.sh
less /tmp/install-kiboar.sh          # read it before running it
bash /tmp/install-kiboar.sh
```

From a clone:

```bash
bash software/scripts/install-macos.sh
```

Options: `--version`, `--app-dir`, `--dmg`, `--no-open`. Run
`install-macos.sh --help`.

## Manual DMG

1. Download `Kiboar Studio_0.1.0_aarch64.dmg` from the
   [`studio-v0.1.0` release](https://github.com/raulmoracode/Kiboar/releases/tag/studio-v0.1.0).
2. Open the DMG and drag **Kiboar Studio** to Applications.
3. Remove the quarantine attribute:

   ```bash
   xattr -dr com.apple.quarantine "/Applications/Kiboar Studio.app"
   ```

4. Open the app.

To check the download yourself:

```bash
shasum -a 256 "Kiboar Studio_0.1.0_aarch64.dmg"
```

Compare it with the `SHA256SUMS` asset on the release.

## Why this is needed

The app is ad-hoc signed but not signed with an Apple Developer ID and not
notarized. Without the quarantine removal, macOS shows “Kiboar Studio is damaged
and can’t be opened” or “cannot be opened because the developer cannot be
verified”. Removing the attribute tells macOS that you chose to trust this
specific copy.

This does not disable Gatekeeper globally and does not change the app for other
users. It is a deliberate trade-off for the 0.1 tester build; signing and
notarization are post-MVP.

## What 0.1 does and does not do

It detects an RP2040 bootloader, lists the registry boards, inspects a UF2
(structure, family and SHA-256), asks you to type the board id and writes the
file with progress and cancellation.

It does not verify the board identity after flashing, does not remap keys, does
not show a layout and does not include Kiboar firmware. Those are later stages.

## Uninstall

Homebrew:

```bash
brew uninstall --cask kiboar-studio
```

Script or manual install:

```bash
rm -rf "/Applications/Kiboar Studio.app"
# or, if the script installed it:
rm -rf "$HOME/Applications/Kiboar Studio.app"
```
