"""
Table Detection & Structure Extraction.
Uses OpenCV morphological operations for line detection and grid reconstruction.
"""

import logging
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class CellInfo:
    """Single table cell with position and text content."""
    row: int
    col: int
    x: int
    y: int
    w: int
    h: int
    text: str = ""
    confidence: float = 0.0


@dataclass
class TableResult:
    """Detected table structure."""
    rows: int = 0
    cols: int = 0
    cells: List[CellInfo] = field(default_factory=list)
    header_row: List[str] = field(default_factory=list)
    data_rows: List[List[str]] = field(default_factory=list)
    bbox: Dict[str, int] = field(default_factory=dict)


def detect_table(image_path: str, ocr_words: List[Any] = None) -> TableResult:
    """
    Detect table structure in an image.
    Uses OpenCV line detection for ruled tables,
    falls back to text-position clustering for unruled tables.
    """
    import cv2

    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        logger.error(f"Cannot read image for table detection: {image_path}")
        return TableResult()

    h, w = img.shape[:2]

    # Try ruled table detection first
    result = _detect_ruled_table(img)

    # If no table found with lines, try text-position based detection
    if result.rows == 0 and ocr_words:
        result = _detect_from_text_positions(ocr_words, w, h)

    return result


def _detect_ruled_table(gray_img) -> TableResult:
    """Detect table with visible grid lines using morphological operations."""
    import cv2

    h, w = gray_img.shape[:2]

    # Threshold
    _, binary = cv2.threshold(gray_img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # Detect horizontal lines
    horiz_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (max(w // 8, 40), 1))
    horiz_lines = cv2.morphologyEx(binary, cv2.MORPH_OPEN, horiz_kernel, iterations=2)

    # Detect vertical lines
    vert_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, max(h // 8, 40)))
    vert_lines = cv2.morphologyEx(binary, cv2.MORPH_OPEN, vert_kernel, iterations=2)

    # Find horizontal line positions
    horiz_positions = _find_line_positions(horiz_lines, axis='horizontal')
    vert_positions = _find_line_positions(vert_lines, axis='vertical')

    if len(horiz_positions) < 2 or len(vert_positions) < 2:
        return TableResult()

    # Merge close lines
    horiz_positions = _merge_close_positions(horiz_positions, threshold=h * 0.02)
    vert_positions = _merge_close_positions(vert_positions, threshold=w * 0.02)

    # Build grid cells
    cells = []
    num_rows = len(horiz_positions) - 1
    num_cols = len(vert_positions) - 1

    for r in range(num_rows):
        for c in range(num_cols):
            y1 = int(horiz_positions[r])
            y2 = int(horiz_positions[r + 1])
            x1 = int(vert_positions[c])
            x2 = int(vert_positions[c + 1])

            cells.append(CellInfo(
                row=r, col=c,
                x=x1, y=y1,
                w=x2 - x1, h=y2 - y1,
            ))

    logger.info(f"Detected ruled table: {num_rows} rows x {num_cols} cols")

    return TableResult(
        rows=num_rows,
        cols=num_cols,
        cells=cells,
        bbox={"x": int(vert_positions[0]), "y": int(horiz_positions[0]),
              "w": int(vert_positions[-1] - vert_positions[0]),
              "h": int(horiz_positions[-1] - horiz_positions[0])},
    )


def _find_line_positions(line_img, axis='horizontal') -> List[float]:
    """Find unique line positions from a binary line image."""
    import cv2

    if axis == 'horizontal':
        projection = np.sum(line_img, axis=1)
    else:
        projection = np.sum(line_img, axis=0)

    positions = []
    in_line = False
    line_start = 0

    threshold = np.max(projection) * 0.3 if np.max(projection) > 0 else 0

    for i, val in enumerate(projection):
        if val > threshold and not in_line:
            in_line = True
            line_start = i
        elif val <= threshold and in_line:
            in_line = False
            positions.append((line_start + i) / 2.0)

    if in_line:
        positions.append((line_start + len(projection) - 1) / 2.0)

    return positions


def _merge_close_positions(positions: List[float], threshold: float) -> List[float]:
    """Merge line positions that are closer than threshold."""
    if not positions:
        return []

    merged = [positions[0]]
    for pos in positions[1:]:
        if pos - merged[-1] > threshold:
            merged.append(pos)
        else:
            merged[-1] = (merged[-1] + pos) / 2.0

    return merged


def _detect_from_text_positions(ocr_words, img_width: int, img_height: int) -> TableResult:
    """
    Detect table structure from OCR word positions.
    Groups words into rows by y-coordinate, then into columns by x-coordinate.
    """
    if not ocr_words:
        return TableResult()

    # Extract bounding boxes from word results
    word_data = []
    for w in ocr_words:
        if hasattr(w, 'bbox') and w.bbox:
            word_data.append({
                'text': w.text,
                'x': w.bbox.get('x', 0),
                'y': w.bbox.get('y', 0),
                'w': w.bbox.get('w', 0),
                'h': w.bbox.get('h', 0),
                'confidence': getattr(w, 'confidence', 0.5),
            })

    if not word_data:
        return TableResult()

    # Sort by y position
    word_data.sort(key=lambda w: w['y'])

    # Cluster into rows by y-coordinate
    rows_clusters = []
    current_row = [word_data[0]]
    avg_height = np.mean([w['h'] for w in word_data]) if word_data else 20

    for w in word_data[1:]:
        if abs(w['y'] - current_row[-1]['y']) < avg_height * 0.6:
            current_row.append(w)
        else:
            rows_clusters.append(current_row)
            current_row = [w]
    rows_clusters.append(current_row)

    # Sort words within each row by x-coordinate
    for row in rows_clusters:
        row.sort(key=lambda w: w['x'])

    # Determine columns by finding consistent x-position clusters
    all_x_starts = [w['x'] for row in rows_clusters for w in row]
    col_boundaries = _cluster_positions(all_x_starts, threshold=avg_height * 2)

    num_rows = len(rows_clusters)
    num_cols = max(len(col_boundaries), 1)

    # Build cells
    cells = []
    data_rows = []

    for r_idx, row_words in enumerate(rows_clusters):
        row_texts = [""] * num_cols
        for w in row_words:
            # Assign word to closest column
            col_idx = 0
            min_dist = float('inf')
            for c_idx, col_x in enumerate(col_boundaries):
                dist = abs(w['x'] - col_x)
                if dist < min_dist:
                    min_dist = dist
                    col_idx = c_idx

            if row_texts[col_idx]:
                row_texts[col_idx] += " " + w['text']
            else:
                row_texts[col_idx] = w['text']

            cells.append(CellInfo(
                row=r_idx, col=col_idx,
                x=w['x'], y=w['y'],
                w=w['w'], h=w['h'],
                text=w['text'],
                confidence=w['confidence'],
            ))

        data_rows.append(row_texts)

    # First row is likely the header
    header = data_rows[0] if data_rows else []
    body = data_rows[1:] if len(data_rows) > 1 else []

    logger.info(f"Detected text-based table: {num_rows} rows x {num_cols} cols")

    return TableResult(
        rows=num_rows,
        cols=num_cols,
        cells=cells,
        header_row=header,
        data_rows=body,
    )


def _cluster_positions(positions: List[float], threshold: float) -> List[float]:
    """Cluster numeric positions into groups and return centroids."""
    if not positions:
        return []

    sorted_pos = sorted(positions)
    clusters = [[sorted_pos[0]]]

    for p in sorted_pos[1:]:
        if p - np.mean(clusters[-1]) < threshold:
            clusters[-1].append(p)
        else:
            clusters.append([p])

    return [np.mean(c) for c in clusters]


def extract_cell_images(image_path: str, table: TableResult, output_dir: str) -> List[str]:
    """Extract individual cell images from the table for per-cell OCR."""
    import cv2

    os.makedirs(output_dir, exist_ok=True)
    img = cv2.imread(image_path)
    if img is None:
        return []

    cell_paths = []
    for cell in table.cells:
        if cell.w > 5 and cell.h > 5:
            padding = 2
            y1 = max(0, cell.y + padding)
            y2 = min(img.shape[0], cell.y + cell.h - padding)
            x1 = max(0, cell.x + padding)
            x2 = min(img.shape[1], cell.x + cell.w - padding)

            cell_img = img[y1:y2, x1:x2]
            cell_path = os.path.join(output_dir, f"cell_r{cell.row}_c{cell.col}.png")
            cv2.imwrite(cell_path, cell_img)
            cell_paths.append(cell_path)

    return cell_paths


import os
