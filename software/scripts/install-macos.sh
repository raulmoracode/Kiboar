#!/usr/bin/env bash
#
# Install Kiboar Studio on macOS from a GitHub release.
#
# The build is unsigned and not notarized, so macOS Gatekeeper blocks it by
# default. This script verifies the published SHA-256, installs the app in the
# user's Applications folder and removes the quarantine attribute from that
# copy only. Read it before running it.

set -euo pipefail

REPO="raulmoracode/Kiboar"
VERSION="${KIBOAR_STUDIO_VERSION:-0.1.0}"
APP_NAME="Kiboar Studio"
APP_BUNDLE="${APP_NAME}.app"
APP_DIR="${KIBOAR_APP_DIR:-$HOME/Applications}"
OPEN_AFTER=1
LOCAL_DMG=""

die() {
  printf 'error: %s\n' "$1" >&2
  exit 1
}

usage() {
  cat <<'EOF'
Install Kiboar Studio on macOS.

Usage:
  install-macos.sh [options]

Options:
  --dmg PATH        Install from a local DMG instead of downloading it.
  --version VERSION Release version to download. Default: 0.1.0.
  --app-dir DIR     Install into DIR. Default: ~/Applications.
  --no-open         Do not launch the app after installing.
  -h, --help        Show this help.

Environment:
  KIBOAR_STUDIO_VERSION   Same as --version.
  KIBOAR_APP_DIR          Same as --app-dir.
  KIBOAR_SKIP_CHECKSUM=1  Skip the SHA-256 check. Not recommended.

The build is unsigned. The script removes com.apple.quarantine from the
installed copy so a tester can open it. It does not disable Gatekeeper.
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --dmg)
      [ $# -ge 2 ] || die "--dmg needs a path"
      LOCAL_DMG="$2"
      shift 2
      ;;
    --version)
      [ $# -ge 2 ] || die "--version needs a value"
      VERSION="$2"
      shift 2
      ;;
    --app-dir)
      [ $# -ge 2 ] || die "--app-dir needs a path"
      APP_DIR="$2"
      shift 2
      ;;
    --no-open)
      OPEN_AFTER=0
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      die "unknown argument: $1 (see --help)"
      ;;
  esac
done

[ "$(uname -s)" = "Darwin" ] || die "this installer is for macOS only"

ARCH="$(uname -m)"
case "$ARCH" in
  arm64) ASSET_ARCH="aarch64" ;;
  x86_64) ASSET_ARCH="x64" ;;
  *) die "unsupported architecture: $ARCH" ;;
esac

TMP="$(mktemp -d)"
MNT="$TMP/mnt"
cleanup() {
  if [ -n "${MNT:-}" ]; then
    hdiutil detach "$MNT" -quiet >/dev/null 2>&1 || true
  fi
  rm -rf "$TMP"
}
trap cleanup EXIT

if [ -n "$LOCAL_DMG" ]; then
  [ -f "$LOCAL_DMG" ] || die "DMG not found: $LOCAL_DMG"
  DMG="$LOCAL_DMG"
else
  # 0.1 and later publish a universal DMG; older or architecture-specific
  # releases use the aarch64/x64 name.
  ASSET="Kiboar Studio_${VERSION}_universal.dmg"
  URL="https://github.com/${REPO}/releases/download/studio-v${VERSION}/${ASSET// /%20}"
  DMG="$TMP/$ASSET"
  printf 'Downloading %s\n' "$ASSET"
  if ! curl -fL --retry 3 --progress-bar -o "$DMG" "$URL"; then
    rm -f "$DMG"
    ASSET="Kiboar Studio_${VERSION}_${ASSET_ARCH}.dmg"
    URL="https://github.com/${REPO}/releases/download/studio-v${VERSION}/${ASSET// /%20}"
    DMG="$TMP/$ASSET"
    printf 'Universal DMG not found; trying %s\n' "$ASSET"
    curl -fL --retry 3 --progress-bar -o "$DMG" "$URL" ||
      die "download failed; check that studio-v${VERSION} exists for this macOS"
  fi
fi

if [ "${KIBOAR_SKIP_CHECKSUM:-0}" != "1" ]; then
  SUMS="$TMP/SHA256SUMS"
  SUMS_URL="https://github.com/${REPO}/releases/download/studio-v${VERSION}/SHA256SUMS"
  if curl -fsSL -o "$SUMS" "$SUMS_URL"; then
    BASE="$(basename "$DMG")"
    EXPECTED="$(grep -F "  $BASE" "$SUMS" | head -n1 | awk '{ print $1 }')"
    if [ -z "$EXPECTED" ]; then
      EXPECTED="$(head -n1 "$SUMS" | awk '{ print $1 }')"
    fi
    ACTUAL="$(shasum -a 256 "$DMG" | awk '{ print $1 }')"
    [ -n "$EXPECTED" ] || die "SHA256SUMS has no digest"
    [ "$EXPECTED" = "$ACTUAL" ] ||
      die "checksum mismatch: expected $EXPECTED, got $ACTUAL"
    printf 'Checksum verified: %s\n' "$ACTUAL"
  else
    die "could not download SHA256SUMS; set KIBOAR_SKIP_CHECKSUM=1 to bypass"
  fi
else
  printf 'warning: checksum verification skipped\n' >&2
fi

mkdir -p "$APP_DIR"
hdiutil attach -nobrowse -readonly -quiet -mountpoint "$MNT" "$DMG"
SOURCE="$MNT/$APP_BUNDLE"
[ -d "$SOURCE" ] || die "the DMG does not contain $APP_BUNDLE"

TARGET="$APP_DIR/$APP_BUNDLE"
if [ -d "$TARGET" ]; then
  printf 'Replacing %s\n' "$TARGET"
  rm -rf "$TARGET"
fi

ditto "$SOURCE" "$TARGET"
xattr -dr com.apple.quarantine "$TARGET" >/dev/null 2>&1 || true
hdiutil detach "$MNT" -quiet
MNT=""

printf '\nInstalled %s in %s\n' "$APP_NAME" "$APP_DIR"
printf 'The build is unsigned. Only install it if you trust the release and the checksum above.\n'
printf 'Uninstall with: rm -rf "%s"\n' "$TARGET"

if [ "$OPEN_AFTER" -eq 1 ]; then
  open "$TARGET"
fi
