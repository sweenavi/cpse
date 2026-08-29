"""
Image Preprocessing Pipeline for OCR.
Uses OpenCV for deskew, denoise, contrast, thresholding.
Always preserves original file; outputs a processed copy.
"""

import os
import logging
import numpy as np
from typing import Tuple

logger = logging.getLogger(__name__)


def preprocess_image(input_path: str, output_dir: str) -> Tuple[str, str]:
    """
    Full preprocessing pipeline.
    Returns (original_path, processed_path).
    """
    import cv2
    from PIL import Image, ExifTags

    os.makedirs(output_dir, exist_ok=True)

    basename = os.path.basename(input_path)
    name, ext = os.path.splitext(basename)
    processed_path = os.path.join(output_dir, f"{name}_processed{ext}")

    # Load image
    img = cv2.imread(input_path)
    if img is None:
        raise ValueError(f"Cannot read image: {input_path}")

    original_h, original_w = img.shape[:2]
    logger.info(f"Preprocessing image {basename}: {original_w}x{original_h}")

    # Step 1: Orientation correction (EXIF)
    img = _fix_orientation(input_path, img)

    # Step 2: Convert to grayscale for processing
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Step 3: Deskewing
    gray = _deskew(gray)

    # Step 4: Denoising
    gray = _denoise(gray)

    # Step 5: Contrast enhancement (CLAHE)
    gray = _enhance_contrast(gray)

    # Step 6: Adaptive thresholding (optional output)
    # Keep the enhanced grayscale as primary output for OCR
    # Thresholded version can help table detection
    thresh = _adaptive_threshold(gray)

    # Save processed grayscale (better for OCR than binary threshold)
    cv2.imwrite(processed_path, gray)

    # Also save threshold version for table detection
    thresh_path = os.path.join(output_dir, f"{name}_thresh{ext}")
    cv2.imwrite(thresh_path, thresh)

    logger.info(f"Preprocessing complete: {processed_path}")
    return input_path, processed_path


def _fix_orientation(file_path: str, img):
    """Fix image orientation using EXIF data."""
    try:
        from PIL import Image as PILImage, ExifTags
        pil_img = PILImage.open(file_path)
        exif = pil_img._getexif()
        if exif:
            for tag, value in exif.items():
                tag_name = ExifTags.TAGS.get(tag, tag)
                if tag_name == 'Orientation':
                    import cv2
                    if value == 3:
                        img = cv2.rotate(img, cv2.ROTATE_180)
                    elif value == 6:
                        img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
                    elif value == 8:
                        img = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)
                    break
    except Exception as e:
        logger.debug(f"EXIF orientation check skipped: {e}")
    return img


def _deskew(gray_img):
    """Correct skew using Hough line transform."""
    import cv2

    try:
        # Edge detection
        edges = cv2.Canny(gray_img, 50, 150, apertureSize=3)

        # Detect lines
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100,
                                minLineLength=gray_img.shape[1] // 4,
                                maxLineGap=20)
        if lines is not None and len(lines) > 0:
            angles = []
            for line in lines:
                x1, y1, x2, y2 = line[0]
                angle = np.degrees(np.arctan2(y2 - y1, x2 - x1))
                if abs(angle) < 15:  # Only near-horizontal lines
                    angles.append(angle)

            if angles:
                median_angle = np.median(angles)
                if abs(median_angle) > 0.3:  # Only correct if meaningful skew
                    h, w = gray_img.shape[:2]
                    center = (w // 2, h // 2)
                    M = cv2.getRotationMatrix2D(center, median_angle, 1.0)
                    gray_img = cv2.warpAffine(gray_img, M, (w, h),
                                              flags=cv2.INTER_LINEAR,
                                              borderMode=cv2.BORDER_REPLICATE)
                    logger.info(f"Deskewed by {median_angle:.2f} degrees")
    except Exception as e:
        logger.debug(f"Deskew skipped: {e}")

    return gray_img


def _denoise(gray_img):
    """Remove scanning noise while preserving text."""
    import cv2
    try:
        denoised = cv2.fastNlMeansDenoising(gray_img, None, h=10, templateWindowSize=7, searchWindowSize=21)
        return denoised
    except Exception as e:
        logger.debug(f"Denoising skipped: {e}")
        return gray_img


def _enhance_contrast(gray_img):
    """Enhance contrast using CLAHE (Contrast Limited Adaptive Histogram Equalization)."""
    import cv2
    try:
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray_img)
        return enhanced
    except Exception as e:
        logger.debug(f"Contrast enhancement skipped: {e}")
        return gray_img


def _adaptive_threshold(gray_img):
    """Create a binary image using adaptive thresholding."""
    import cv2
    try:
        # Gaussian adaptive threshold works well for varying illumination
        thresh = cv2.adaptiveThreshold(
            gray_img, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            blockSize=15,
            C=8
        )
        return thresh
    except Exception as e:
        logger.debug(f"Thresholding skipped: {e}")
        return gray_img


def detect_document_type(gray_img) -> str:
    """
    Heuristic to detect if document is PRINTED or HANDWRITTEN.
    Based on line regularity and stroke variance.
    """
    import cv2

    h, w = gray_img.shape[:2]

    # Binary threshold
    _, binary = cv2.threshold(gray_img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # Check contour regularity
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if len(contours) < 5:
        return "PRINTED"

    # Measure bounding box height variance of character-like contours
    heights = []
    for c in contours:
        _, _, cw, ch = cv2.boundingRect(c)
        if 5 < ch < h * 0.1 and 3 < cw < w * 0.3:
            heights.append(ch)

    if len(heights) < 10:
        return "PRINTED"

    height_std = np.std(heights)
    height_mean = np.mean(heights)

    # Handwritten text has more variation in character heights
    coefficient_of_variation = height_std / height_mean if height_mean > 0 else 0

    if coefficient_of_variation > 0.45:
        return "HANDWRITTEN"
    elif coefficient_of_variation > 0.30:
        return "MIXED"
    else:
        return "PRINTED"
