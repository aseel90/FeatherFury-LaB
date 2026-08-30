#!/usr/bin/env bash
set -euo pipefail
ROOT="${1:-$(pwd)}"
SRC_B64="$ROOT/android-assets"
TMP="$ROOT/.android-icon-src"
RES="$ROOT/android/app/src/main/res"
mkdir -p "$TMP"

cat "$SRC_B64/google-play-512.part1.b64" "$SRC_B64/google-play-512.part2.b64" | base64 --decode > "$TMP/google-play-512.png"
base64 --decode "$SRC_B64/adaptive-foreground-512.b64" > "$TMP/adaptive-foreground-512.png"

DIM=$(identify -format '%wx%h' "$TMP/google-play-512.png")
[ "$DIM" = "512x512" ] || { echo "Google Play icon must be 512x512, got $DIM" >&2; exit 1; }
BYTES=$(stat -c%s "$TMP/google-play-512.png")
[ "$BYTES" -le 1048576 ] || { echo "Google Play icon exceeds 1024KB" >&2; exit 1; }

# Produce a clean one-color mask from the approved transparent foreground for Android themed icons.
convert "$TMP/adaptive-foreground-512.png" -alpha extract -threshold 8% "$TMP/mono-alpha.png"
convert -size 512x512 xc:white "$TMP/mono-alpha.png" -alpha off -compose CopyOpacity -composite "$TMP/monochrome-512.png"

declare -A LEGACY=( [mdpi]=48 [hdpi]=72 [xhdpi]=96 [xxhdpi]=144 [xxxhdpi]=192 )
declare -A ADAPTIVE=( [mdpi]=108 [hdpi]=162 [xhdpi]=216 [xxhdpi]=324 [xxxhdpi]=432 )
for d in mdpi hdpi xhdpi xxhdpi xxxhdpi; do
  mkdir -p "$RES/mipmap-$d"
  convert "$TMP/google-play-512.png" -resize "${LEGACY[$d]}x${LEGACY[$d]}" "$RES/mipmap-$d/ic_launcher.png"
  cp "$RES/mipmap-$d/ic_launcher.png" "$RES/mipmap-$d/ic_launcher_round.png"
  convert "$TMP/adaptive-foreground-512.png" -resize "${ADAPTIVE[$d]}x${ADAPTIVE[$d]}" "$RES/mipmap-$d/ic_launcher_foreground.png"
  convert "$TMP/monochrome-512.png" -resize "${ADAPTIVE[$d]}x${ADAPTIVE[$d]}" "$RES/mipmap-$d/ic_launcher_monochrome.png"
done

mkdir -p "$RES/values" "$RES/mipmap-anydpi-v26" "$RES/mipmap-anydpi-v33"
cat > "$RES/values/ff_icon_colors.xml" <<'XML'
<?xml version="1.0" encoding="utf-8"?>
<resources>
  <color name="ff_launcher_background">#120B3D</color>
</resources>
XML
cat > "$RES/mipmap-anydpi-v26/ic_launcher.xml" <<'XML'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@color/ff_launcher_background" />
  <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
XML
cp "$RES/mipmap-anydpi-v26/ic_launcher.xml" "$RES/mipmap-anydpi-v26/ic_launcher_round.xml"
cat > "$RES/mipmap-anydpi-v33/ic_launcher.xml" <<'XML'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@color/ff_launcher_background" />
  <foreground android:drawable="@mipmap/ic_launcher_foreground" />
  <monochrome android:drawable="@mipmap/ic_launcher_monochrome" />
</adaptive-icon>
XML
cp "$RES/mipmap-anydpi-v33/ic_launcher.xml" "$RES/mipmap-anydpi-v33/ic_launcher_round.xml"

cp "$TMP/google-play-512.png" "$ROOT/FeatherFury-GooglePlay-512.png"

grep -q 'android:icon="@mipmap/ic_launcher"' "$ROOT/android/app/src/main/AndroidManifest.xml"
grep -q 'android:roundIcon="@mipmap/ic_launcher_round"' "$ROOT/android/app/src/main/AndroidManifest.xml"
grep -q '<monochrome android:drawable="@mipmap/ic_launcher_monochrome"' "$RES/mipmap-anydpi-v33/ic_launcher.xml"

echo "Feather Fury Android icon resources installed from approved identity."
