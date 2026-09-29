from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

# Project assets folder
assets = Path("assets")
assets.mkdir(exist_ok=True)

# App colors
background = "#163f32"
panel = "#eef2f1"
text = "#163f32"


def create_icon(size):
    # Create the square icon
    image = Image.new("RGB", (size, size), background)
    draw = ImageDraw.Draw(image)

    # Rounded inner panel
    margin = int(size * 0.10)
    radius = int(size * 0.12)

    draw.rounded_rectangle(
        (
            margin,
            margin,
            size - margin,
            size - margin,
        ),
        radius=radius,
        fill=panel,
    )

    # Draw a simple snowflake
    center = size // 2
    snowflake_radius = int(size * 0.23)

    # Main vertical line
    draw.line(
        (center, center - snowflake_radius,
         center, center + snowflake_radius),
        fill=text,
        width=max(3, size // 28),
    )

    # Main horizontal line
    draw.line(
        (center - snowflake_radius, center,
         center + snowflake_radius, center),
        fill=text,
        width=max(3, size // 28),
    )

    # Diagonal lines
    offset = int(snowflake_radius * 0.72)

    draw.line(
        (center - offset, center - offset,
         center + offset, center + offset),
        fill=text,
        width=max(3, size // 28),
    )

    draw.line(
        (center + offset, center - offset,
         center - offset, center + offset),
        fill=text,
        width=max(3, size // 28),
    )

    # Small "S" label under the snowflake
    try:
        font = ImageFont.truetype("arialbd.ttf", int(size * 0.16))
    except OSError:
        font = ImageFont.load_default()

    label = "S"

    bbox = draw.textbbox((0, 0), label, font=font)
    label_width = bbox[2] - bbox[0]
    label_height = bbox[3] - bbox[1]

    draw.text(
        (
            center - label_width / 2,
            int(size * 0.70) - label_height / 2,
        ),
        label,
        fill=text,
        font=font,
    )

    return image


# Create both required PWA icons
create_icon(192).save(
    assets / "icon-192.png",
    "PNG"
)

create_icon(512).save(
    assets / "icon-512.png",
    "PNG"
)

print("PWA icons created successfully.")