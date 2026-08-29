"""
Configurable Industrial Terminology Dictionary.
Used for OCR error correction, engineering normalization, and column mapping.
"""

import re
from typing import Dict, List, Tuple, Optional


# ──────────────── ENGINEERING STANDARDS ────────────────
STANDARD_PATTERNS = {
    "ASTM": r'\b(ASTM\s*[A-Z]?\s*\d{1,4}(?:\s*(?:GR\.?\s*[A-Z0-9]+|GRADE\s*[A-Z0-9]+))?)\b',
    "API":  r'\b(API\s*\d{2,4}[A-Z]?)\b',
    "ASME": r'\b(ASME\s*B\d+\.?\d*)\b',
    "IS":   r'\b(IS\s*\d{3,5}(?:\s*(?:PART|PT)?\s*\d+)?)\b',
    "DIN":  r'\b(DIN\s*\d{3,6})\b',
    "ISO":  r'\b(ISO\s*\d{3,6})\b',
    "BS":   r'\b(BS\s*\d{3,6})\b',
}


# ──────────────── MATERIAL GRADES ────────────────
KNOWN_GRADES = [
    "SS304", "SS304L", "SS316", "SS316L", "SS321", "SS310",
    "CF8M", "CF8", "CF3M",
    "WCB", "WCC", "WC6", "WC9", "LCB", "LCC",
    "A105", "A106 GR B", "A106 GR A", "A106 GRADE B",
    "A234 WPB", "A216 WCB", "A240", "A312", "A193 B7", "A194 2H",
    "SA210 GRADE C", "SA-210-C",
    "CS", "MS", "GI", "CI", "ALLOY STEEL",
    "NITRILE", "NBR", "VITON", "EPDM", "PTFE", "GRAPHITE",
    "COPPER", "BRASS", "BRONZE", "ALUMINIUM",
]

GRADE_PATTERNS = [
    r'\b(SS\s*3(?:04|16|21|10)L?)\b',
    r'\b(CF[38]M?)\b',
    r'\b(WC[BC69]|LC[BC])\b',
    r'\b(A(?:STM\s*)?(?:105|106|234|216|240|312|193|194)\s*(?:GR(?:ADE)?\.?\s*[A-Z0-9]+)?)\b',
    r'\b(SA[\s-]*210[\s-]*(?:GRADE\s*)?C)\b',
    r'\b(NITRILE|NBR|VITON|EPDM|PTFE|GRAPHITE)\b',
    r'\b(CS|MS|GI|CI|ALLOY\s+STEEL)\b',
]


# ──────────────── PRESSURE CLASS PATTERNS ────────────────
PRESSURE_CLASS_PATTERNS = [
    r'\b(?:CLASS|CL)[\s.]*(\d{2,4})\s*#?\b',
    r'\b(\d{3,4})\s*#\b',
    r'\b(\d{3,4})\s*LBS?\b',
    r'\b(PN\s*\d{1,3})\b',
]


# ──────────────── DIMENSION PATTERNS ────────────────
DIMENSION_PATTERNS = [
    r'(\d+(?:\.\d+)?)\s*(?:INCH|IN|")\s*(?:NB)?\b',
    r'(\d+)\s*(?:MM)\s*(?:OD|ID|DIA|THK|NB)\b',
    r'(DN\s*\d+)\b',
    r'(M\d+\s*[Xx]\s*\d+(?:\s*[Xx]\s*\d+)?(?:\s*MM)?)\b',
    r'(\d+\s*[Xx]\s*\d+(?:\s*[Xx]\s*\d+)?\s*MM)\b',
    r'(SCH(?:EDULE)?\s*\d{1,3}S?)\b',
    r'(\d+(?:\.\d+)?)\s*NB\b',
]


# ──────────────── SCHEDULE PATTERNS ────────────────
SCHEDULE_PATTERNS = [
    r'\b(?:SCH(?:EDULE)?|SCHEDULE)\s*(\d{1,3}S?)\b',
]


# ──────────────── ENGINEERING ABBREVIATIONS ────────────────
ENGINEERING_ABBREVIATIONS = {
    "NB": "Nominal Bore",
    "OD": "Outer Diameter",
    "ID": "Inner Diameter",
    "SCH": "Schedule",
    "RF": "Raised Face",
    "FF": "Flat Face",
    "BW": "Butt Weld",
    "SW": "Socket Weld",
    "THK": "Thickness",
    "CL": "Class",
    "DN": "Diameter Nominal",
    "PN": "Pressure Nominal",
    "ERW": "Electric Resistance Welded",
    "SMLS": "Seamless",
    "SS": "Stainless Steel",
    "CS": "Carbon Steel",
    "MS": "Mild Steel",
    "GI": "Galvanized Iron",
    "CI": "Cast Iron",
    "AS": "Alloy Steel",
    "FLG": "Flange",
    "WLDNK": "Weldolet/Welding Neck",
    "WN": "Welding Neck",
    "SO": "Slip On",
    "BL": "Blind",
    "LJ": "Lap Joint",
    "THD": "Threaded",
    "BLRF": "Blind Raised Face",
    "WNRF": "Welding Neck Raised Face",
    "SORF": "Slip On Raised Face",
}


# ──────────────── UNIT OF MEASUREMENT NORMALIZATION ────────────────
UOM_NORMALIZATION = {
    "NOS": "NOS", "NO": "NOS", "NO.": "NOS", "NOS.": "NOS",
    "PCS": "NOS", "PC": "NOS", "PIECE": "NOS", "PIECES": "NOS",
    "EA": "NOS", "EACH": "NOS", "UNIT": "NOS", "UNITS": "NOS",
    "MTR": "MTR", "MT": "MTR", "M": "MTR", "METER": "MTR", "METRE": "MTR", "METERS": "MTR",
    "KG": "KG", "KGS": "KG", "KILOGRAM": "KG", "KILOGRAMS": "KG",
    "TON": "MT", "TONNE": "MT", "TONS": "MT",
    "MM": "MM", "MILLIMETER": "MM", "MILLIMETRE": "MM",
    "INCH": "INCH", "IN": "INCH", '"': "INCH",
    "SET": "SET", "SETS": "SET",
    "LOT": "LOT", "LOTS": "LOT",
    "LTR": "LTR", "LT": "LTR", "LITER": "LTR", "LITRE": "LTR",
    "ROLL": "ROLL", "ROLLS": "ROLL",
    "PKT": "PKT", "PACKET": "PKT", "PACK": "PKT",
    "BOX": "BOX", "BOXES": "BOX",
    "DRUM": "DRUM", "DRUMS": "DRUM",
    "PAIR": "PAIR", "PAIRS": "PAIR",
    "SQM": "SQM", "SQ.M": "SQM", "SQ M": "SQM",
    "RMT": "RMT", "RM": "RMT",
}


# ──────────────── MATERIAL GROUP CLASSIFICATION ────────────────
MATERIAL_GROUP_KEYWORDS = {
    "PIPES": ["PIPE", "PIPING", "TUBE", "TUBING"],
    "VALVES": ["VALVE", "GATE VALVE", "GLOBE VALVE", "CHECK VALVE", "BALL VALVE", "BUTTERFLY VALVE", "PLUG VALVE", "NEEDLE VALVE"],
    "FLANGES": ["FLANGE", "BLIND FLANGE", "WELD NECK", "SLIP ON"],
    "FITTINGS": ["ELBOW", "TEE", "REDUCER", "COUPLING", "UNION", "NIPPLE", "CAP", "BEND", "RETURN BEND"],
    "GASKETS": ["GASKET", "SPIRAL WOUND", "RING JOINT", "METALLIC GASKET"],
    "FASTENERS": ["BOLT", "NUT", "STUD", "SCREW", "WASHER", "ANCHOR"],
    "BEARINGS": ["BEARING", "BALL BEARING", "ROLLER BEARING"],
    "SEALS": ["SEAL", "O-RING", "MECHANICAL SEAL", "OIL SEAL", "PACKING"],
    "INSTRUMENTS": ["GAUGE", "THERMOMETER", "PRESSURE GAUGE", "TRANSMITTER", "INDICATOR"],
    "ELECTRICAL": ["CABLE", "WIRE", "SWITCH", "BREAKER", "PANEL", "MOTOR", "TRANSFORMER"],
    "REFRACTORIES": ["REFRACTORY", "BRICK", "CASTABLE", "CEMENT", "MORTAR"],
    "LUBRICANTS": ["OIL", "GREASE", "LUBRICANT", "HYDRAULIC OIL"],
    "SAFETY": ["SAFETY", "HELMET", "GLOVES", "GOGGLES", "SHOE", "FIRE"],
    "GENERAL": ["PLATE", "SHEET", "STRIP", "ROD", "BAR", "ANGLE", "CHANNEL", "BEAM"],
}


# ──────────────── OCR ERROR CORRECTION MAP ────────────────
# Common OCR character confusions in industrial/engineering text
OCR_ERROR_CORRECTIONS = {
    # O ↔ 0 confusion in standard codes
    "A1O6": ("A106", "ASTM standard code O→0 correction", 0.97),
    "A1O5": ("A105", "ASTM standard code O→0 correction", 0.97),
    "A2I6": ("A216", "ASTM standard code I→1 correction", 0.96),
    "A24O": ("A240", "ASTM standard code O→0 correction", 0.97),
    "A3I2": ("A312", "ASTM standard code I→1 correction", 0.96),
    "SS3O4": ("SS304", "Stainless steel grade O→0 correction", 0.98),
    "SS3I6": ("SS316", "Stainless steel grade I→1, O→0 correction", 0.98),
    "SS 3O4": ("SS 304", "Stainless steel grade O→0 correction", 0.98),
    "SS 3I6": ("SS 316", "Stainless steel grade I→1 correction", 0.98),
    "API 6OO": ("API 600", "API standard code O→0 correction", 0.97),
    "API 6D": ("API 6D", "Already correct", 1.0),
    "62O5": ("6205", "Bearing number O→0 correction", 0.96),
    "62O5-ZZ": ("6205-ZZ", "Bearing number O→0 correction", 0.96),
    "15O#": ("150#", "Pressure class O→0 correction", 0.98),
    "3OO#": ("300#", "Pressure class O→0 correction", 0.98),
    "6OO#": ("600#", "Pressure class O→0 correction", 0.98),
    "1NCH": ("INCH", "Engineering unit 1→I correction", 0.95),
    "0-RING": ("O-RING", "Seal type 0→O correction", 0.97),
    "WCB_B0DY": ("WCB BODY", "Casting grade correction", 0.96),
    "NBR_7OA": ("NBR 70A", "Rubber hardness O→0 correction", 0.95),
    "SEAMLES": ("SEAMLESS", "Truncated word correction", 0.94),
    "SEAMLSS": ("SEAMLESS", "Missing character correction", 0.93),
    "FLANGED": ("FLANGED", "Already correct", 1.0),
    "GATF VALVE": ("GATE VALVE", "OCR F→E correction in GATE", 0.93),
    "GIOBE VALVE": ("GLOBE VALVE", "OCR I→L correction", 0.92),
    "B0LT": ("BOLT", "OCR 0→O correction", 0.96),
    "FIANGE": ("FLANGE", "OCR I→L correction", 0.94),
    "ELB0W": ("ELBOW", "OCR 0→O correction", 0.96),
    "GAIVANZIED": ("GALVANIZED", "Spelling correction", 0.90),
    "GALVANZIED": ("GALVANIZED", "Spelling correction", 0.91),
    "GALVANISED": ("GALVANIZED", "British→American spelling", 0.99),
}


# ──────────────── COLUMN NAME NORMALIZATION ────────────────
# Maps legacy spreadsheet column names to the standard schema fields
COLUMN_NAME_MAP = {
    # Material Code
    "item code": "legacy_material_code",
    "material code": "legacy_material_code",
    "mat code": "legacy_material_code",
    "mat. code": "legacy_material_code",
    "material no": "legacy_material_code",
    "material no.": "legacy_material_code",
    "part no": "legacy_material_code",
    "part no.": "legacy_material_code",
    "part number": "legacy_material_code",
    "code": "legacy_material_code",
    "sl no": "serial_number",
    "sl.no": "serial_number",
    "sl. no": "serial_number",
    "sr no": "serial_number",
    "sr. no": "serial_number",
    "s.no": "serial_number",
    "s. no": "serial_number",
    "serial no": "serial_number",
    "no": "serial_number",
    "no.": "serial_number",
    "#": "serial_number",

    # Description
    "description": "material_description",
    "material description": "material_description",
    "item description": "material_description",
    "item name": "material_description",
    "material name": "material_description",
    "name": "material_description",
    "desc": "material_description",
    "desc.": "material_description",
    "particulars": "material_description",

    # Material Group
    "material group": "material_group",
    "group": "material_group",
    "category": "material_group",
    "class": "material_group",
    "type": "material_group",

    # Unit of Measurement
    "uom": "uom",
    "unit": "uom",
    "unit of measurement": "uom",
    "unit of measure": "uom",

    # Make/Brand
    "make": "make_brand",
    "brand": "make_brand",
    "make/brand": "make_brand",
    "manufacturer": "make_brand",
    "mfr": "make_brand",

    # Specification
    "specification": "standard",
    "spec": "standard",
    "spec.": "standard",
    "specifications": "standard",
    "standard": "standard",
    "std": "standard",

    # HSN/SAC Code
    "hsn": "hsn_sac_code",
    "hsn code": "hsn_sac_code",
    "hsn/sac": "hsn_sac_code",
    "hsn/sac code": "hsn_sac_code",
    "sac code": "hsn_sac_code",

    # Quantity
    "qty": "quantity",
    "quantity": "quantity",
    "stock qty": "quantity",
    "stock": "quantity",
    "stock quantity": "quantity",
    "balance": "quantity",
    "balance qty": "quantity",

    # Price
    "rate": "unit_price",
    "unit price": "unit_price",
    "unit rate": "unit_price",
    "price": "unit_price",
    "price/unit": "unit_price",
    "cost": "unit_price",

    # Total Value
    "total": "total_value",
    "total value": "total_value",
    "amount": "total_value",
    "value": "total_value",
    "total amount": "total_value",
    "total cost": "total_value",
}


def normalize_column_name(raw_name: str) -> str:
    """Maps a raw column header to the standard schema field name."""
    cleaned = raw_name.strip().lower().replace("_", " ").replace("-", " ")
    return COLUMN_NAME_MAP.get(cleaned, cleaned)


def normalize_uom(raw_uom: str) -> str:
    """Normalizes a unit of measurement string."""
    cleaned = raw_uom.strip().upper().replace(".", "")
    return UOM_NORMALIZATION.get(cleaned, cleaned)


def classify_material_group(description: str) -> str:
    """Classifies a material into a group based on description keywords."""
    desc_upper = description.upper()
    for group, keywords in MATERIAL_GROUP_KEYWORDS.items():
        for kw in keywords:
            if kw in desc_upper:
                return group
    return "GENERAL"


def apply_ocr_corrections(text: str) -> tuple:
    """
    Applies industrial-domain OCR corrections.
    Returns (corrected_text, list_of_corrections).
    """
    corrections = []
    corrected = text

    for raw_token, (fixed_token, reason, conf) in OCR_ERROR_CORRECTIONS.items():
        if raw_token in corrected.upper() and fixed_token != raw_token:
            # Case-insensitive replacement preserving structure
            pattern = re.compile(re.escape(raw_token), re.IGNORECASE)
            if pattern.search(corrected):
                corrected = pattern.sub(fixed_token, corrected)
                corrections.append({
                    "original": raw_token,
                    "corrected": fixed_token,
                    "reason": reason,
                    "confidence": conf,
                    "dictionary_source": "Industrial OCR Correction Dictionary"
                })

    return corrected, corrections


def extract_engineering_attributes(text: str) -> Dict[str, str]:
    """
    Extracts engineering attributes from a material description.
    Returns a dict with extracted fields.
    """
    text_upper = text.upper()
    attrs = {}

    # Extract material grade
    for pattern in GRADE_PATTERNS:
        match = re.search(pattern, text_upper)
        if match:
            attrs["material_grade"] = match.group(0).strip()
            break

    # Extract pressure class
    for pattern in PRESSURE_CLASS_PATTERNS:
        match = re.search(pattern, text_upper)
        if match:
            val = match.group(1).strip()
            attrs["pressure_class"] = val
            break

    # Extract dimensions
    for pattern in DIMENSION_PATTERNS:
        match = re.search(pattern, text_upper)
        if match:
            attrs["dimensions"] = match.group(0).strip()
            break

    # Extract schedule
    for pattern in SCHEDULE_PATTERNS:
        match = re.search(pattern, text_upper)
        if match:
            attrs["schedule"] = match.group(1).strip()
            break

    # Extract standards (multiple possible)
    standards_found = []
    for std_name, pattern in STANDARD_PATTERNS.items():
        for m in re.finditer(pattern, text_upper):
            standards_found.append(m.group(0).strip())
    if standards_found:
        attrs["standard"] = " / ".join(standards_found)

    # Classify material group
    attrs["material_group"] = classify_material_group(text)

    return attrs
