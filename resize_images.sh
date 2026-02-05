#!/bin/bash

# Script to resize images to match display dimensions (2x for retina)
# Based on the PageSpeed Insights optimization plan
# This script resizes images to their largest display size at 2x and replaces originals

# Don't exit on error, continue processing
set +e

echo "Starting image resizing..."
echo "Creating backup directory..."
mkdir -p assets_backup

# Function to resize and replace (with aspect ratio preservation)
resize_image() {
    local file="$1"
    local target_height="$2"
    local target_width="$3"
    
    if [ ! -f "$file" ]; then
        echo "  Skipping $file (not found)"
        return
    fi
    
    # Backup original
    mkdir -p "assets_backup/$(dirname "$file")"
    cp "$file" "assets_backup/$file" 2>/dev/null || true
    
    # Check if it's a WebP file
    if [[ "$file" == *.webp ]]; then
        echo "  Resizing $file to ${target_width}x${target_height}..."
        # Convert WebP to PNG, resize, convert back to WebP
        local temp_png="${file%.webp}_temp.png"
        dwebp "$file" -o "$temp_png" >/dev/null 2>&1
        if [ -f "$temp_png" ]; then
            sips -z "$target_height" "$target_width" "$temp_png" --out "$temp_png" >/dev/null 2>&1
            if [ -f "$temp_png" ]; then
                cwebp -q 85 "$temp_png" -o "$file" >/dev/null 2>&1
                rm -f "$temp_png"
                if [ -f "$file" ]; then
                    echo "  ✓ Resized $file"
                else
                    echo "  ✗ Failed to resize $file (WebP conversion failed)"
                fi
            else
                echo "  ✗ Failed to resize $file (PNG resize failed)"
                rm -f "$temp_png"
            fi
        else
            echo "  ✗ Failed to resize $file (WebP decode failed)"
        fi
    else
        # Resize directly with sips (sips -z takes height width)
        echo "  Resizing $file to ${target_width}x${target_height}..."
        sips -z "$target_height" "$target_width" "$file" --out "$file.tmp" >/dev/null 2>&1
        if [ -f "$file.tmp" ]; then
            mv "$file.tmp" "$file"
            echo "  ✓ Resized $file"
        else
            echo "  ✗ Failed to resize $file (may not be supported format or file issue)"
        fi
    fi
}

# Logo: 57x60px displayed (largest use) → 114x120px (2x)
echo "Resizing logo..."
resize_image "assets/data/logo.png" 120 114
resize_image "assets/data/logo.webp" 120 114

# Hero image (LCP): 616x411px displayed → 1232x822px (2x)
# Note: Hydra Facial.png is also used in gallery, but hero is larger
echo "Resizing hero image (Hydra Facial)..."
resize_image "assets/treatments/Hydra Facial.png" 822 1232
resize_image "assets/treatments/Hydra Facial.webp" 822 1232

# Service card images: 616x140px displayed → 1232x280px (2x)
# Note: Some of these are also used in gallery, but service card is larger
echo "Resizing service card images..."
resize_image "assets/treatments/Hydra Facial treatment.png" 280 1232
resize_image "assets/treatments/Hydra Facial treatment.webp" 280 1232
resize_image "assets/treatments/Microdermabrasion.png" 280 1232
resize_image "assets/treatments/Microdermabrasion.webp" 280 1232
resize_image "assets/treatments/Acne Treatments.png" 280 1232
resize_image "assets/treatments/Acne Treatments.webp" 280 1232
resize_image "assets/treatments/Hair PRP Treatment.png" 280 1232
resize_image "assets/treatments/Hair PRP Treatment.webp" 280 1232
resize_image "assets/treatments/Facial PRP Treatment.png" 280 1232
resize_image "assets/treatments/Facial PRP Treatment.webp" 280 1232
resize_image "assets/treatments/Laser Hair Reduction.png" 280 1232
resize_image "assets/treatments/Laser Hair Reduction.webp" 280 1232
resize_image "assets/treatments/Tattoo Removal.png" 280 1232
resize_image "assets/treatments/Tattoo Removal.webp" 280 1232
resize_image "assets/treatments/Warts and Tags Removal.png" 280 1232
resize_image "assets/treatments/Warts and Tags Removal.webp" 280 1232

# Portrait: 180x220px displayed → 360x440px (2x)
echo "Resizing portrait images..."
resize_image "assets/portait/portait_03.png" 440 360
resize_image "assets/portait/portait_03.webp" 440 360

# Outdoor image: 616x320px displayed → 1232x640px (2x)
# Also used in gallery at 120x76px, but main use is larger
echo "Resizing outdoor image..."
resize_image "assets/outdoor/WhatsApp Image 2026-01-01 at 4.17.19 PM.jpeg" 640 1232
resize_image "assets/outdoor/WhatsApp Image 2026-01-01 at 4.17.19 PM.webp" 640 1232

# Gallery images (about section): 120x76px displayed → 240x152px (2x)
echo "Resizing about gallery images..."
for img in "IMG-20251228-WA0003~2.jpg" "IMG-20251228-WA0004~2.jpg" "IMG-20251228-WA0005~2.jpg" "IMG-20251228-WA0006~2.jpg" "IMG-20251228-WA0007~2.jpg" "IMG-20251228-WA0008~2.jpg" "IMG-20251228-WA0009~2.jpg" "IMG-20251228-WA0011~2.jpg"; do
    resize_image "assets/indoor/$img" 152 240
done

for img in "IMG-20251228-WA0003~2.webp" "IMG-20251228-WA0004~2.webp" "IMG-20251228-WA0005~2.webp" "IMG-20251228-WA0006~2.webp" "IMG-20251228-WA0007~2.webp" "IMG-20251228-WA0008~2.webp" "IMG-20251228-WA0009~2.webp" "IMG-20251228-WA0011~2.webp"; do
    resize_image "assets/indoor/$img" 152 240
done

# Blog images: 400x160px displayed → 800x320px (2x)
echo "Resizing blog images..."
for i in 1 2 3; do
    resize_image "assets/blog/$i.png" 320 800
    resize_image "assets/blog/$i.webp" 320 800
done

echo ""
echo "Image resizing complete!"
echo "Original images backed up in assets_backup/ directory"
