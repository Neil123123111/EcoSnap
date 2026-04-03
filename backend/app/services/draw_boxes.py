"""
Draw YOLO World bounding boxes + labels onto an image and save the annotated copy.
"""
from __future__ import annotations

import os
from typing import List

from PIL import Image, ImageDraw, ImageFont

# Color palette per simplified category  (R, G, B)
CLASS_COLORS: dict = {
    "plastic":   (148, 103, 189),   # purple
    "glass":     ( 31, 119, 180),   # blue
    "cardboard": (140,  86,  75),   # brown
    "paper":     (148, 103, 189),   # purple
    "metal":     (127, 127, 127),   # gray
    "trash":     (214,  39,  40),   # red
}
DEFAULT_COLOR = (44, 160, 44)       # green


def _get_color(label: str):
    return CLASS_COLORS.get(label, DEFAULT_COLOR)


def _load_font(size: int = 14):
    candidates = [
        # macOS
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
        # Linux
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


def draw_boxes_on_image(image_path: str, detections: List[dict], output_path: str) -> str:
    """
    Draw bounding boxes with class labels on `image_path` and save to `output_path`.

    Each detection dict must contain:
        raw_class  : original class name from YOLO World
        label      : simplified category label
        confidence : float 0-1
        x, y       : center of box (pixels)
        w, h       : width / height of box (pixels)

    Returns `output_path`.
    """
    img = Image.open(image_path).convert("RGBA")
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))

    draw_overlay = ImageDraw.Draw(overlay)
    draw_main = ImageDraw.Draw(img)

    font = _load_font(14)

    for det in detections:
        x = float(det.get("x", 0))
        y = float(det.get("y", 0))
        w = float(det.get("w", 0))
        h = float(det.get("h", 0))
        raw_class = det.get("raw_class", det.get("label", "?"))
        label = det.get("label", raw_class)
        confidence = float(det.get("confidence", 0))

        if w == 0 or h == 0:
            continue

        x1, y1 = int(x - w / 2), int(y - h / 2)
        x2, y2 = int(x + w / 2), int(y + h / 2)

        color = _get_color(label)

        # Semi-transparent fill
        draw_overlay.rectangle([x1, y1, x2, y2], fill=(*color, 90))

        # Solid border (2 px)
        draw_main.rectangle([x1, y1, x2, y2], outline=color, width=2)

        # Label tag: "paper 87%"
        tag_text = f"{raw_class} {confidence:.0%}"
        bbox = draw_main.textbbox((0, 0), tag_text, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]

        pad = 4
        tag_x1 = x1
        tag_y1 = max(0, y1 - th - pad * 2)
        tag_x2 = x1 + tw + pad * 2
        tag_y2 = y1

        # Tag background
        draw_main.rectangle([tag_x1, tag_y1, tag_x2, tag_y2], fill=color)
        # Tag text
        draw_main.text(
            (tag_x1 + pad, tag_y1 + pad // 2),
            tag_text,
            fill=(255, 255, 255),
            font=font,
        )

    # Merge semi-transparent overlay
    img = Image.alpha_composite(img, overlay).convert("RGB")
    img.save(output_path, "JPEG", quality=92)
    return output_path
