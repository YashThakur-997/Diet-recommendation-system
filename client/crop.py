import sys
from PIL import Image, ImageChops

def trim(im):
    # The background is a gradient, so a simple ImageChops won't work perfectly.
    # Instead, we will find pixels that deviate from light gray.
    # We will sample the corner pixels to get back color, but since it's gradient,
    # let's just use a hardcoded luminance threshold or find any pixel that is very colored (blue/green).
    
    # logo has blue and green parts.
    gray = im.convert('L')
    # Threshold to find non-gray stuff (the logo is darker than the bright bg? 
    # Actually the logo has blue and green which are significantly darker/colored than the light background.
    
    # Or just crop centrally manually
    # The image is 1024x1024
    width, height = im.size
    # let's find the bounding box of colored pixels. 
    # For a RGB pixel, if stdev of (R,G,B) > some value or luminance < some threshold
    
    pixels = im.load()
    min_x, min_y = width, height
    max_x, max_y = 0, 0
    
    for x in range(width):
        for y in range(height):
            r, g, b = pixels[x, y]
            # Detect color or darkness. Background is around (230,230,230).
            # Logo has blue (0,0,255 ish) and green (0,255,0 ish).
            # If color channels have a high variance, it's colored.
            var = max(abs(r-g), abs(g-b), abs(r-b))
            if var > 20 or (r < 200 and g < 200 and b < 200):
                if x < min_x: min_x = x
                if y < min_y: min_y = y
                if x > max_x: max_x = x
                if y > max_y: max_y = y
                
    if min_x > max_x:
        print("Could not find logo, cropping to center")
        min_x, min_y, max_x, max_y = width//3, height//3, 2*width//3, 2*height//3
    
    # Add a small padding
    pad = 20
    min_x = max(0, min_x - pad)
    min_y = max(0, min_y - pad)
    max_x = min(width, max_x + pad)
    max_y = min(height, max_y + pad)
    
    # Make it a square crop to preserve aspect
    w, h = max_x - min_x, max_y - min_y
    size = max(w, h)
    cx, cy = (min_x + max_x) // 2, (min_y + max_y) // 2
    
    crop_x1 = max(0, cx - size // 2)
    crop_y1 = max(0, cy - size // 2)
    crop_x2 = min(width, cx + size // 2)
    crop_y2 = min(height, cy + size // 2)
    
    res = im.crop((crop_x1, crop_y1, crop_x2, crop_y2))
    
    # Optionally, we can make the background transparent
    res.save(sys.argv[2])
    print(f"Cropped to {crop_x1},{crop_y1},{crop_x2},{crop_y2}")

if __name__ == "__main__":
    im = Image.open(sys.argv[1])
    trim(im)
