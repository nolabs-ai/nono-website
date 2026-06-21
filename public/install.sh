#!/bin/sh
# nono installer — https://nono.sh
#
#   curl -fsSL https://nono.sh/install.sh | sh
#
# Downloads the latest nono CLI release for your platform from GitHub,
# verifies its SHA-256 checksum, and installs the `nono` binary.
#
# Environment overrides:
#   NONO_VERSION      install a specific tag (e.g. v0.64.1) instead of latest
#   NONO_INSTALL_DIR  install location (default: /usr/local/bin if writable, else ~/.local/bin)

set -eu

REPO="always-further/nono"
BIN="nono"

err()  { printf 'error: %s\n' "$1" >&2; exit 1; }
info() { printf '%s\n' "$1" >&2; }
need() { command -v "$1" >/dev/null 2>&1 || err "required command not found: $1"; }

need curl
need tar

# --- detect platform ---------------------------------------------------------
os="$(uname -s)"
arch="$(uname -m)"

case "$os" in
  Darwin) target_os="apple-darwin" ;;
  Linux)  target_os="unknown-linux-gnu" ;;
  *) err "unsupported OS: $os (nono supports macOS and Linux; on Windows use WSL2)" ;;
esac

case "$arch" in
  arm64|aarch64) target_arch="aarch64" ;;
  x86_64|amd64)  target_arch="x86_64" ;;
  *) err "unsupported architecture: $arch" ;;
esac

# --- resolve version ---------------------------------------------------------
version="${NONO_VERSION:-}"
if [ -z "$version" ]; then
  # Follow the 'latest' redirect to discover the newest tag (no API rate limit).
  version="$(curl -fsSLI -o /dev/null -w '%{url_effective}' \
    "https://github.com/$REPO/releases/latest" \
    | sed -n 's#.*/tag/\(v[^/]*\)$#\1#p')"
  [ -n "$version" ] || err "could not determine the latest version"
fi

asset="${BIN}-${version}-${target_arch}-${target_os}.tar.gz"
base="https://github.com/$REPO/releases/download/$version"

info "Installing nono $version ($target_arch-$target_os)..."

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT INT TERM

# --- download ----------------------------------------------------------------
curl -fsSL "$base/$asset" -o "$tmp/$asset" || err "failed to download $asset"
curl -fsSL "$base/SHA256SUMS.txt" -o "$tmp/SHA256SUMS.txt" || err "failed to download checksums"

# --- verify checksum ---------------------------------------------------------
expected="$(awk -v a="$asset" '$2==a {print $1}' "$tmp/SHA256SUMS.txt")"
[ -n "$expected" ] || err "no checksum found for $asset"
if command -v sha256sum >/dev/null 2>&1; then
  actual="$(sha256sum "$tmp/$asset" | awk '{print $1}')"
elif command -v shasum >/dev/null 2>&1; then
  actual="$(shasum -a 256 "$tmp/$asset" | awk '{print $1}')"
else
  err "need sha256sum or shasum to verify the download"
fi
[ "$expected" = "$actual" ] || err "checksum mismatch for $asset"

# --- extract -----------------------------------------------------------------
tar -xzf "$tmp/$asset" -C "$tmp"
[ -f "$tmp/$BIN" ] || err "binary '$BIN' not found in archive"
chmod +x "$tmp/$BIN"

# --- choose install dir ------------------------------------------------------
install_dir="${NONO_INSTALL_DIR:-}"
if [ -z "$install_dir" ]; then
  if [ -d /usr/local/bin ] && [ -w /usr/local/bin ]; then
    install_dir="/usr/local/bin"
  else
    install_dir="$HOME/.local/bin"
  fi
fi
mkdir -p "$install_dir"

# --- install -----------------------------------------------------------------
if mv "$tmp/$BIN" "$install_dir/$BIN" 2>/dev/null; then
  :
elif command -v sudo >/dev/null 2>&1; then
  info "Writing to $install_dir requires elevated permissions..."
  sudo mv "$tmp/$BIN" "$install_dir/$BIN"
else
  err "could not write to $install_dir (set NONO_INSTALL_DIR to a writable path)"
fi

info ""
info "✓ nono $version installed to $install_dir/$BIN"

case ":$PATH:" in
  *":$install_dir:"*) ;;
  *)
    info ""
    info "  $install_dir is not on your PATH. Add it with:"
    info "    export PATH=\"$install_dir:\$PATH\""
    ;;
esac

info ""
info "Get started:  nono run --profile always-further/opencode -- opencode"
