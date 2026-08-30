#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-$PWD}"
SRC="$ROOT/scripts/android-icons"
RES="$ROOT/android/app/src/main/res"
TMP="$ROOT/.android-icon-src"
EXPECTED_SHA="19a590d04bf29402223e462190cc531fa54b7bb2c73a2f9514bb60a44d5f092a"

rm -rf "$TMP"
mkdir -p "$TMP"

cat \
  "$SRC/approved-foreground-256.part01.b64" \
  "$SRC/approved-foreground-256.part02.b64" \
  "$SRC/approved-foreground-256.part03a.b64" \
  "$SRC/approved-foreground-256.part03b1.b64" \
  "$SRC/approved-foreground-256.part03b2.b64" \
  "$SRC/approved-foreground-256.part03b3.b64" \
  "$SRC/approved-foreground-256.part03b4.b64" \
  | tr -d '\r\n' | base64 -d > "$TMP/approved-foreground.webp"

echo "$EXPECTED_SHA  $TMP/approved-foreground.webp" | sha256sum -c -
[ "$(identify -format '%wx%h' "$TMP/approved-foreground.webp")" = "256x256" ]

convert "$TMP/approved-foreground.webp" -resize 512x512 -strip "$TMP/foreground-512.png"

# Brand background: deep violet/blue field with restrained cyan/orange energy arcs.
convert -size 512x512 radial-gradient:'#6d28d9-#05081f' \
  -fill none \
  -stroke '#243cff' -strokewidth 20 -draw 'arc 18,18 494,494 120,245' \
  -stroke '#00d9ff' -strokewidth 10 -draw 'arc 30,30 482,482 135,230' \
  -stroke '#ff6a00' -strokewidth 22 -draw 'arc 20,20 492,492 300,72' \
  -stroke '#ffb000' -strokewidth 8 -draw 'arc 38,38 474,474 315,58' \
  -blur 0x0.35 -strip "$TMP/background-512.png"

# Full-bleed Google Play icon. No text is rendered into the icon.
convert "$TMP/background-512.png" "$TMP/foreground-512.png" \
  -gravity center -compose over -composite -strip "$ROOT/FeatherFury-GooglePlay-512.png"

# One-color alpha silhouette for Android themed icons.
convert "$TMP/foreground-512.png" -alpha extract -threshold 10% "$TMP/alpha-mask.png"
convert -size 512x512 xc:white "$TMP/alpha-mask.png" \
  -alpha off -compose CopyOpacity -composite -strip "$TMP/monochrome-512.png"

# Legacy launcher icons + adaptive layers for all Android densities.
declare -A LEGACY=( [mdpi]=48 [hdpi]=72 [xhdpi]=96 [xxhdpi]=144 [xxxhdpi]=192 )
declare -A ADAPT=( [mdpi]=108 [hdpi]=162 [xhdpi]=216 [xxhdpi]=324 [xxxhdpi]=432 )
for density in mdpi hdpi xhdpi xxhdpi xxxhdpi; do
  dir="$RES/mipmap-$density"
  mkdir -p "$dir"
  convert "$ROOT/FeatherFury-GooglePlay-512.png" -resize "${LEGACY[$density]}x${LEGACY[$density]}" -strip "$dir/ic_launcher.png"
  cp "$dir/ic_launcher.png" "$dir/ic_launcher_round.png"
  convert "$TMP/foreground-512.png" -resize "${ADAPT[$density]}x${ADAPT[$density]}" -strip "$dir/ic_launcher_foreground.png"
  convert "$TMP/background-512.png" -resize "${ADAPT[$density]}x${ADAPT[$density]}" -strip "$dir/ic_launcher_background.png"
  convert "$TMP/monochrome-512.png" -resize "${ADAPT[$density]}x${ADAPT[$density]}" -strip "$dir/ic_launcher_monochrome.png"
done

mkdir -p "$RES/mipmap-anydpi-v26" "$RES/mipmap-anydpi-v33"
cat > "$RES/mipmap-anydpi-v26/ic_launcher.xml" <<'XML'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
XML
cp "$RES/mipmap-anydpi-v26/ic_launcher.xml" "$RES/mipmap-anydpi-v26/ic_launcher_round.xml"

cat > "$RES/mipmap-anydpi-v33/ic_launcher.xml" <<'XML'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
    <monochrome android:drawable="@mipmap/ic_launcher_monochrome" />
</adaptive-icon>
XML
cp "$RES/mipmap-anydpi-v33/ic_launcher.xml" "$RES/mipmap-anydpi-v33/ic_launcher_round.xml"

MANIFEST="$ROOT/android/app/src/main/AndroidManifest.xml"
grep -q 'android:icon="@mipmap/ic_launcher"' "$MANIFEST"
grep -q 'android:roundIcon="@mipmap/ic_launcher_round"' "$MANIFEST"

[ "$(identify -format '%wx%h' "$ROOT/FeatherFury-GooglePlay-512.png")" = "512x512" ]
[ "$(identify -format '%wx%h' "$RES/mipmap-xxxhdpi/ic_launcher_foreground.png")" = "432x432" ]
[ "$(stat -c%s "$ROOT/FeatherFury-GooglePlay-512.png")" -le 1048576 ]

echo "Feather Fury Android icon set installed and verified."
