"""
Script to generate PWA icons for all required sizes
Run with: python scripts/generate-pwa-icons.py
"""

from PIL import Image
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

def create_icon_from_logo(size, logo_path):
    """Create icon by resizing logo image"""
    try:
        # Open the logo image
        logo = Image.open(logo_path)
        
        # Convert to RGBA if not already
        if logo.mode != 'RGBA':
            logo = logo.convert('RGBA')
        
        # Resize to target size using high-quality resampling
        icon = logo.resize((size, size), Image.Resampling.LANCZOS)
        
        return icon
    except Exception as e:
        print(f"Error creating icon from logo: {e}")
        # Fallback: create a simple colored square
        return Image.new('RGB', (size, size), '#204978')

def generate_icons():
    """Generate all required icons"""
    # Get paths
    script_dir = os.path.dirname(__file__)
    project_dir = os.path.join(script_dir, '..')
    logo_path = os.path.join(project_dir, 'public', 'logo.png')
    output_dir = os.path.join(project_dir, 'public')
    
    # Check if logo exists
    if not os.path.exists(logo_path):
        print(f"Error: logo.png not found at {logo_path}")
        print("Please ensure logo.png exists in the public directory.")
        return
    
    os.makedirs(output_dir, exist_ok=True)
    
    print("Generating PWA icons from logo.png...")
    
    # Generate standard PWA icons
    for size in ICON_SIZES:
        icon = create_icon_from_logo(size, logo_path)
        filename = os.path.join(output_dir, f'icon-{size}.png')
        icon.save(filename, 'PNG')
        print(f"  Created: icon-{size}.png ({size}x{size})")
    
    # Generate Apple touch icons
    for size in APPLE_SIZES:
        icon = create_icon_from_logo(size, logo_path)
        filename = os.path.join(output_dir, f'apple-touch-icon-{size}.png')
        icon.save(filename, 'PNG')
        print(f"  Created: apple-touch-icon-{size}.png ({size}x{size})")
    
    # Generate favicons
    for size in FAVICON_SIZES:
        icon = create_icon_from_logo(size, logo_path)
        filename = os.path.join(output_dir, f'favicon-{size}.png')
        icon.save(filename, 'PNG')
        print(f"  Created: favicon-{size}.png ({size}x{size})")
    
    # Create favicon.ico (using 16x16 and 32x32)
    icon_16 = create_icon_from_logo(16, logo_path)
    icon_32 = create_icon_from_logo(32, logo_path)
    favicon_path = os.path.join(output_dir, 'favicon.ico')
    icon_16.save(favicon_path, format='ICO', sizes=[(16, 16)])
    print(f"  Created: favicon.ico")
    
    print("\n✅ All icons generated successfully from logo.png!")
    print(f"Output directory: {output_dir}")

if __name__ == '__main__':
    generate_icons()
