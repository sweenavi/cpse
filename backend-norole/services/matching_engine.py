import re
import numpy as np
from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Domain-specific keyword weights
ATTRIBUTE_WEIGHTS = {
    "material_grade": 0.35,
    "pressure_class": 0.25,
    "nominal_dimension": 0.20,
    "standard_spec": 0.15,
    "uom": 0.05,
}

GRADE_PATTERNS = [
    r"\b(SS316L?|SS304L?|SS321|SS310)\b",
    r"\b(ASTM\s+A216\s+WCB|A216\s+WCB|WCB)\b",
    r"\b(ASTM\s+A234\s+WPB|A234\s+WPB|WPB)\b",
    r"\b(CF8M|CF8|CF3M)\b",
    r"\b(SA210\s+GRADE\s+C|SA-210-C)\b",
    r"\b(NITRILE\s+RUBBER|NBR|VITON|EPDM)\b",
    r"\b(MGO-C|MAGNESIA\s+CARBON)\b",
    r"\b(LITHIUM\s+COMPLEX|EP2)\b",
]

PRESSURE_PATTERNS = [
    r"\b(CLASS\s*150#?|150#|150\s*LBS|PN20)\b",
    r"\b(CLASS\s*300#?|300#|300\s*LBS|PN50)\b",
    r"\b(CLASS\s*600#?|600#|600\s*LBS|PN100)\b",
    r"\b(CLASS\s*800#?|800#|800\s*LBS)\b",
    r"\b(CLASS\s*1500#?|1500#)\b",
    r"\b(CLASS\s*2500#?|2500#)\b",
]

DIMENSION_PATTERNS = [
    r'(\d+(?:\.\d+)?\s*(?:INCH|IN|")(?:\s*NB)?)',
    r'(\d+X\d+(?:X\d+)?\s*(?:MM|M))',
    r'(\d+\s*MM\s*OD)',
    r'(\d+\s*MM\s*DIA)',
    r'(DN\s*\d+)',
    r'(SCH\s*\d+S?)',
]

STANDARD_PATTERNS = [
    r'\b(ASME\s+B16\.\d+|ANSI\s+B16\.\d+)\b',
    r'\b(API\s+6D|API\s+600|API\s+610|API\s+598)\b',
    r'\b(IS\s+\d+|DIN\s+\d+|BS\s+\d+)\b',
    r'\b(TEMA\s+TYPE\s+[A-Z])\b',
    r'\b(ISO\s+\d+)\b',
]

def extract_attributes(text: str) -> Dict[str, str]:
    text_upper = text.upper()
    extracted = {
        "material_grade": "Standard Industrial",
        "pressure_class": "Standard Rating",
        "nominal_dimension": "Standard Size",
        "standard_spec": "IS/ASME Standard",
        "uom": "NOS",
    }

    for pattern in GRADE_PATTERNS:
        match = re.search(pattern, text_upper)
        if match:
            extracted["material_grade"] = match.group(0).strip()
            break

    for pattern in PRESSURE_PATTERNS:
        match = re.search(pattern, text_upper)
        if match:
            extracted["pressure_class"] = match.group(0).strip()
            break

    for pattern in DIMENSION_PATTERNS:
        match = re.search(pattern, text_upper)
        if match:
            extracted["nominal_dimension"] = match.group(0).strip()
            break

    for pattern in STANDARD_PATTERNS:
        match = re.search(pattern, text_upper)
        if match:
            extracted["standard_spec"] = match.group(0).strip()
            break

    return extracted

def compute_real_vector_similarity(s1: str, s2: str) -> float:
    """Computes real TF-IDF vector embeddings and cosine similarity."""
    try:
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), token_pattern=r'(?u)\b[\w#"-]+\b')
        tfidf_matrix = vectorizer.fit_transform([s1.upper(), s2.upper()])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(np.clip(sim, 0.0, 1.0))
    except Exception:
        # Fallback to Jaccard
        t1 = set(re.findall(r'\w+', s1.upper()))
        t2 = set(re.findall(r'\w+', s2.upper()))
        if not t1 or not t2: return 0.0
        return len(t1.intersection(t2)) / len(t1.union(t2))

def compute_token_jaccard(s1: str, s2: str) -> float:
    tokens1 = set(re.findall(r'\w+', s1.upper()))
    tokens2 = set(re.findall(r'\w+', s2.upper()))
    if not tokens1 or not tokens2:
        return 0.0
    return len(tokens1.intersection(tokens2)) / len(tokens1.union(tokens2))

def calculate_hybrid_match(
    local_desc: str,
    master_desc: str,
    master_grade: str,
    master_pressure: str,
    master_dim: str,
    master_std: str,
    uom_match: bool = True
) -> Dict[str, Any]:
    """
    Real Hybrid Math Pipeline:
    1. Real Vector Cosine Similarity
    2. Real Attribute Similarity
    3. Hard-blocking penalty check
    4. 5-Axis Radar Topology
    5. XAI Diff Matrix
    """
    local_attrs = extract_attributes(local_desc)

    # Real Vector Cosine Similarity
    vector_sim = compute_real_vector_similarity(local_desc, master_desc)

    # Attribute Similarity calculation
    grade_sim = 1.0 if (local_attrs["material_grade"] in master_grade.upper() or master_grade.upper() in local_attrs["material_grade"]) else compute_token_jaccard(local_attrs["material_grade"], master_grade)
    pressure_sim = 1.0 if (local_attrs["pressure_class"] in master_pressure.upper() or master_pressure.upper() in local_attrs["pressure_class"]) else compute_token_jaccard(local_attrs["pressure_class"], master_pressure)
    dim_sim = 1.0 if (local_attrs["nominal_dimension"] in master_dim.upper() or master_dim.upper() in local_attrs["nominal_dimension"]) else compute_token_jaccard(local_attrs["nominal_dimension"], master_dim)
    std_sim = 1.0 if (local_attrs["standard_spec"] in master_std.upper() or master_std.upper() in local_attrs["standard_spec"]) else compute_token_jaccard(local_attrs["standard_spec"], master_std)
    uom_sim = 1.0 if uom_match else 0.5

    attr_similarity = (
        grade_sim * ATTRIBUTE_WEIGHTS["material_grade"] +
        pressure_sim * ATTRIBUTE_WEIGHTS["pressure_class"] +
        dim_sim * ATTRIBUTE_WEIGHTS["nominal_dimension"] +
        std_sim * ATTRIBUTE_WEIGHTS["standard_spec"] +
        uom_sim * ATTRIBUTE_WEIGHTS["uom"]
    )

    # Hard-blocking penalty rules
    penalty = 0.0
    if pressure_sim < 0.3 and ("150" in local_desc and "300" in master_desc):
        penalty += 0.30  # Forces Red Tier on critical pressure mismatch
    if grade_sim < 0.3 and ("SS316" in local_desc and "SS304" in master_desc):
        penalty += 0.25  # Forces Red Tier on grade mismatch

    # Final Combined Hybrid Score
    raw_final = (0.45 * vector_sim + 0.55 * attr_similarity) - penalty
    final_confidence = round(float(np.clip(raw_final, 0.0, 1.0)), 3)

    if final_confidence >= 0.95:
        tier = "GREEN"
        status = "AUTO_MATCHED"
    elif final_confidence >= 0.70:
        tier = "YELLOW"
        status = "PENDING_REVIEW"
    else:
        tier = "RED"
        status = "NOVEL_MASTER_REQUIRED"

    radar_scores = {
        "dimensions": int(dim_sim * 95 + 5),
        "materialGrade": int(grade_sim * 95 + 5),
        "pressureClass": int(pressure_sim * 95 + 5),
        "standardCode": int(std_sim * 95 + 5),
        "uomConsistency": int(uom_sim * 100),
    }

    xai_diffs = [
        {
            "attributeName": "Material Grade",
            "localSpec": local_attrs["material_grade"],
            "nationalSpec": master_grade,
            "isMatch": grade_sim >= 0.75,
            "matchScore": f"{int(grade_sim * 100)}%",
            "weight": ATTRIBUTE_WEIGHTS["material_grade"],
        },
        {
            "attributeName": "Pressure Class",
            "localSpec": local_attrs["pressure_class"],
            "nationalSpec": master_pressure,
            "isMatch": pressure_sim >= 0.75,
            "matchScore": f"{int(pressure_sim * 100)}%",
            "weight": ATTRIBUTE_WEIGHTS["pressure_class"],
        },
        {
            "attributeName": "Nominal Dimension",
            "localSpec": local_attrs["nominal_dimension"],
            "nationalSpec": master_dim,
            "isMatch": dim_sim >= 0.75,
            "matchScore": f"{int(dim_sim * 100)}%",
            "weight": ATTRIBUTE_WEIGHTS["nominal_dimension"],
        },
        {
            "attributeName": "Standard Specification",
            "localSpec": local_attrs["standard_spec"],
            "nationalSpec": master_std,
            "isMatch": std_sim >= 0.75,
            "matchScore": f"{int(std_sim * 100)}%",
            "weight": ATTRIBUTE_WEIGHTS["standard_spec"],
        },
        {
            "attributeName": "Unit of Measurement (UoM)",
            "localSpec": local_attrs["uom"],
            "nationalSpec": "NOS / EA",
            "isMatch": uom_sim >= 0.9,
            "matchScore": f"{int(uom_sim * 100)}%",
            "weight": ATTRIBUTE_WEIGHTS["uom"],
        },
    ]

    return {
        "finalConfidence": final_confidence,
        "vectorScore": round(vector_sim, 3),
        "attributeScore": round(attr_similarity, 3),
        "triageTier": tier,
        "status": status,
        "radarScores": radar_scores,
        "xaiDiffs": xai_diffs,
    }
