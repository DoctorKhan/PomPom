#!/bin/bash

# PomPom Extension Packager
# This script creates a distributable ZIP file of the Chrome extension

echo "🐕 Packaging PomPom Chrome Extension..."

# Navigate to the extension directory
cd "$(dirname "$0")/extension"

# Create icons if they don't exist
if [ ! -f "icons/icon16.png" ]; then
    echo "📸 Generating extension icons..."
    python3 -c "
import base64
from PIL import Image, ImageDraw, ImageFont
import os

os.makedirs('icons', exist_ok=True)

def create_icon(size):
    img = Image.new('RGBA', (size, size), (59, 130, 246, 255))
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype('/System/Library/Fonts/Arial.ttf', int(size * 0.7))
    except:
        font = ImageFont.load_default()
    draw.text((size/2, size/2), 'P', fill='white', font=font, anchor='mm')
    return img

for size in [16, 32, 48, 128]:
    icon = create_icon(size)
    icon.save(f'icons/icon{size}.png')
    print(f'Created icon{size}.png')
"
fi

# Create the ZIP file
echo "📦 Creating extension package..."
zip -r ../pompom-extension-v1.0.0.zip . \
    -x "*.git*" \
    "*create-icons.html" \
    "*README.md" \
    "*.DS_Store"

echo "✅ Extension packaged successfully!"
echo "📁 Location: ../pompom-extension-v1.0.0.zip"
echo "📊 Size: $(ls -lh ../pompom-extension-v1.0.0.zip | awk '{print $5}')"

# Update the version info in the install page
VERSION="1.0.0"
DATE=$(date '+%B %d, %Y')
sed -i.bak "s/Version [0-9]\+\.[0-9]\+\.[0-9]\+ • Updated: .*/Version ${VERSION} • Updated: ${DATE}/" ../extension-install.html

echo "🔄 Updated version info in extension-install.html"
