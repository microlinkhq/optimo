#!/usr/bin/env bash
set -euo pipefail

# Ubuntu ships ImageMagick 6, which has no `magick` binary. Update VERSION and
# SHA256 together; the download is rejected on a mismatch.
VERSION=7.1.2-26
SHA256=6366d353b81871929a653ad81158e805f3611d1be7836f2490b6afc38b64c92f
URL="https://github.com/ImageMagick/ImageMagick/releases/download/$VERSION/ImageMagick-$VERSION-gcc-x86_64.AppImage"

if command -v magick >/dev/null; then
  magick -version | head -1
  exit 0
fi

cd "$(mktemp -d)"
curl -fsSL -o magick.AppImage "$URL"
echo "$SHA256  magick.AppImage" | sha256sum -c -
chmod +x magick.AppImage

# `--appimage-extract` unpacks to ./squashfs-root without needing FUSE.
./magick.AppImage --appimage-extract >/dev/null
sudo mv squashfs-root /opt/imagemagick
sudo ln -s /opt/imagemagick/AppRun /usr/local/bin/magick

magick -version | head -1
