"""
Script to generate PWA icons for all required sizes
Run with: python scripts/generate-pwa-icons.py
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Icon sizes required for PWA
ICON_SIZES = [
    72, 96, 128, 144, 152, 192, 384, 512
]

# Apple touch icon sizes
APPLE_SIZES = [
    57, 60, 72, 76, 114, 120, 144, 152, 167, 180, 1024
]

# Favicon sizes
FAVICON_SIZES = [16, 32, 48]

def create_icon(size, text="DO", bg_color="#204978", text_color="#ffffff"):
    """Create a simple icon with text"""
    # Create image with background color
    img = Image.new('RGB', (size, size), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Try to load a font, fallback to default
    try:
        font_size = int(size * 0.4)
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        font = ImageFont.load_default()
    
    # Calculate text position (center)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (size - text_width) / 2
    y = (size - text_height) / 2
    
    # Draw text
    draw.text((x, y), text, fill=text_color, font=font)
    
    return img

def generate_icons():
    """Generate all required icons"""
    # Create output directory
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'public')
    os.makedirs(output_dir, exist_ok=True)
    
    print("Generating PWA icons...")
    
    # Generate standard PWA icons
    for size in ICON_SIZES:
        icon = create_icon(size, "DO")
        filename = os.path.join(output_dir, f'icon-{size}.png')
        icon.save(filename, 'PNG')
        print(f"  Created: icon-{size}.png ({size}x{size})")
    
    # Generate Apple touch icons
    for size in APPLE_SIZES:
        icon = create_icon(size, "DO")
        filename = os.path.join(output_dir, f'apple-touch-icon-{size}.png')
        icon.save(filename, 'PNG')
        print(f"  Created: apple-touch-icon-{size}.png ({size}x{size})")
    
    # Generate favicons
    for size in FAVICON_SIZES:
        icon = create_icon(size, "D")
        filename = os.path.join(output_dir, f'favicon-{size}.png')
        icon.save(filename, 'PNG')
        print(f"  Created: favicon-{size}.png ({size}x{size})")
    
    # Create favicon.ico (using 16x16 and 32x32)
    icon_16 = create_icon(16, "D")
    icon_32 = create_icon(32, "D")
    favicon_path = os.path.join(output_dir, 'favicon.ico')
    icon_16.save(favicon_path, format='ICO', sizes=[(16, 16)])
    print(f"  Created: favicon.ico")
    
    print("\n✅ All icons generated successfully!")
    print(f"Output directory: {output_dir}")

if __name__ == '__main__':
    generate_icons()
