# ONMC: National Unified Material Master Platform
### *AI-Driven Standardization, Harmonization, and Deduplication of Material Codes Across CPSEs*

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🏛️ Executive Project Overview

- **Problem Title**: AI-Driven Standardization and Harmonization of Material Codes Across CPSEs
- **Target Organization**: **Ministry of Petroleum & Natural Gas (MoPNG)** // **Chennai Petroleum Corporation Limited (CPCL)**
- **Standards Conformance**: IEEE 830 / ISO/IEC/IEEE 29148 Software Requirements Specification (SRS)
- **Deployment Mandate**: 100% Free & Open-Source Software (FOSS) — Zero Recurring SaaS API Token Costs

---

## 📖 Comprehensive Project Description

Central Public Sector Enterprises (CPSEs) operating in heavy engineering, power, steel, mining, and oil & gas sectors (such as **CPCL, IOCL, ONGC, HPCL, BPCL, SAIL, NTPC, and BHEL**) independently procure, catalog, and inventory millions of industrial materials, spare parts, valves, pipes, and consumables.

Due to decentralized ERP landscapes (principally SAP Materials Management), identical or functionally interchangeable components are assigned distinct internal material codes, non-standardized shorthand descriptions, conflicting technical parameter formatting, and discordant Units of Measurement (UoM).

### Key Challenges Addressed
1. **Catalog Fragmentation & Redundant Safety Stock**: Identical materials cataloged under multiple codes lead to duplicate safety stock holdings and inflated inventory carrying costs across public sector warehouses.
2. **Procurement Slicing**: Fragmented purchasing data prevents multi-enterprise demand consolidation, forfeiting high-volume tender discounts and bargaining power.
3. **Zero Inter-Enterprise Visibility**: Lack of a standardized cross-referencing taxonomy prevents emergency stock transfers and mutual aid between neighboring refinery or plant locations during unplanned outages.
4. **Failure of Rule-Based Matching**: Traditional fuzzy string matching algorithms fail on dense, abbreviation-laden industrial specifications (e.g., distinguishing pressure ratings `150#` vs `300#` or metallurgy grades `SS316` vs `SS304`).

### The Digital Public Infrastructure (DPI) Solution: "One Nation – One Material Code"
Positioned as the **"UPI of Material Master Data"**, this platform delivers a sovereign, federated Digital Public Infrastructure that:
- Ingests raw material records from disparate SAP/ERP databases via secure, non-invasive connectors.
- Uses domain-adapted **Natural Language Processing (NLP)** and **Named Entity Recognition (NER)** to extract core engineering attributes (Material Grade, Dimension, Pressure Class, Standard Specifications, and UoM).
- Computes **Hybrid Vector & Attribute Cosine Similarity** to match equivalent items across enterprise boundaries.
- Recommends standardized descriptions, UNSPSC categorizations, and persistent **Common National Material Codes (`CNM-XXXXXX-XXX`)** while maintaining an immutable **1:N backward mapping** to all legacy CPSE part numbers.
- Provides technical reviewers with transparent **Explainable AI (XAI)** justification tables and interactive **5-Axis Factor Radar Charts**.
- Enforces an immutable, tamper-evident **SHA-256 Merkle Blockchain Ledger** to audit all adjudications and detect unauthorized ERP table drifts.

### Stakeholder Alignment & Functional Routing
The platform provides Role-Based Access Control (RBAC) dynamically routing each key stakeholder to a tailored operational dashboard:

| Stakeholder | Primary Goal | Associated Module / Dashboard |
| :--- | :--- | :--- |
| **MoPNG / Government** | National standardization & procurement efficiency | **Registry Explorer View** (1:N National Catalog) |
| **CPSE Management** | Clean, harmonized material masters | **Legacy OCR Inspector** (Blueprint / Legacy Data Harmonization) |
| **Procurement Teams** | Faster & cheaper procurement | **Sourcing Simulator View** (Joint Tendering & Price Dispersion) |
| **Engineering Experts** | Technically correct material equivalence | **Reviewer Portal View** (Technical Adjudication & Equivalency) |
| **Inventory Teams** | Better stock visibility & optimization | **Duplicate Cluster View** (Inventory Deduplication & Safety Stock) |
| **IT/SAP Teams** | Secure ERP integration & Data security | **Vigilance Dashboard View** (Live SAP Drift & Cryptographic Ledger) |

---

## 🤖 6-Agent Autonomous Architecture Pipeline

```
+---------------------------------------------------------------------------------------------------+
|                                 6-AGENT AGENTIC PIPELINE ARCHITECTURE                             |
+---------------------------------+---------------------------------+-------------------------------+
|  Agent 6: Local Privacy Edge    |  Agent 1: Matching & Routing    |  Agent 2: Legacy Migration    |
|  - Presidio PII/Commercial Mask |  - Attribute Extraction & NER   |  - LayoutLMv3 + Tesseract OCR |
|  - On-Premise Vectorization     |  - Tri-Tier Decision Gate       |  - Industrial Spell-Check     |
+---------------------------------+---------------------------------+-------------------------------+
|  Agent 4: SAP MM Connector      |  Agent 5: Drift & Compliance    |  Agent 3: Sourcing Simulator  |
|  - PyRFC / NetWeaver BAPI Sync  |  - Real-Time SAP Delta Listener |  - Econometric PDI Modeling   |
|  - Idempotent RFC Receipts      |  - SHA-256 Merkle Ledger        |  - Statutory MSE Quota Engine |
+---------------------------------+---------------------------------+-------------------------------+
```

### 1. Agent 1: Autonomous Matching & Routing Engine ([backend/services/matching_engine.py](backend/services/matching_engine.py))
- **Hybrid Similarity Algorithm**:
  $$S_{\text{final}} = (0.45 \cdot S_{\text{vector}} + 0.55 \cdot S_{\text{attribute}}) - \text{Penalty}_{\text{HardBlock}}$$
- **Tri-Tier Confidence Routing**:
  - 🟢 **Green Tier ($\ge 95\%$)**: Autonomous assignment & auto-sync to SAP MM.
  - 🟡 **Yellow Tier ($70\% - 94\%$)**: Human-in-the-loop review queue with 5-axis factor radar & XAI token diff matrix.
  - 🔴 **Red Tier ($< 70\%$)**: Flags distinct novel item; triggers Common National Code generation workflow.
- **Hard-Blocking Rules**: Incompatible material grades (e.g. SS316 vs SS304) or pressure classes (150# vs 300#) automatically incur heavy penalties, preventing false-positive auto-merges.

### 2. Agent 2: Legacy Document Migration & Blueprint OCR ([backend/services/ocr_pipeline.py](backend/services/ocr_pipeline.py))
- Multimodal OCR with spatial bounding-box alignment for legacy blueprints and scanned purchase orders.
- Domain dictionary spell-correction against ASTM, ASME, and API lexicons (`SS3I6` ➔ `SS316`, `15O#` ➔ `150#`, `WCB_B0DY` ➔ `WCB BODY`).

### 3. Agent 3: Strategic Sourcing & Demand Aggregator ([backend/services/sourcing_simulator.py](backend/services/sourcing_simulator.py))
- Computes **Price Dispersion Index (PDI)** across CPSEs procuring identical materials.
- Econometric bulk discount modeling ($P_{\text{target}} = P_{\text{min}} \cdot (1 - \text{discount})$).
- Statutory compliance tracking for **Public Procurement Policy for MSEs Order, 2012** (25% total MSE, 4% SC/ST, 3% Women entrepreneurs).
- Dynamic executive natural language briefing memo generator.

### 4. Agent 4: SAP S/4HANA Reconciliation Connector ([backend/services/sap_connector.py](backend/services/sap_connector.py))
- Non-invasive `BAPI_MATERIAL_MAINTAINDATA_RT` synchronization with idempotent UUID tokens and formal RFC transaction receipts (`MATDOC-2026-XXXXXX`).

### 5. Agent 5: Vigilance, Live Drift & Cryptographic Ledger ([backend/services/audit_ledger.py](backend/services/audit_ledger.py))
- Real-time delta monitoring on live SAP `MAKT` and `MARC` tables detecting unauthorized local overrides.
- Blockchain-grade **SHA-256 Merkle chain block generation** (`hashlib.sha256(prev_hash + payload + timestamp)`).
- One-click automated rollback to restore approved national specifications in local ERP tables.

### 6. Agent 6: Local Privacy-Preserving Edge Redactor ([backend/services/privacy_edge.py](backend/services/privacy_edge.py))
- Presidio-style on-premise sanitization stripping vendor names, PO numbers, and unit purchase prices before vectorization for **Digital Personal Data Protection (DPDP) Act 2023** compliance.

---

## 🚀 Key Platform Capabilities

1. **Reviewer Portal & Adjudication Gateway**: Side-by-side comparison cards, interactive 5-axis SVG factor radar chart, XAI token diff justification table, and keyboard shortcuts (<kbd>Enter</kbd> to Approve, <kbd>Esc</kbd> to Reject, <kbd>M</kbd> to Modify).
2. **National Registry & 1:N Explorer**: Sub-millisecond search across all unified masters with multi-enterprise filter pills (CPCL, IOCL, ONGC, BPCL, HPCL, SAIL).
3. **Inter-CPSE Duplicate & Cluster Analytics**: Groups identical and near-duplicate materials with similarity confidence percentages and calculates safety stock carrying cost savings.
4. **Bulk CSV Dataset Ingestion**: Drag-and-drop ingestion of raw CPSE plant spreadsheets with automated batch deduplication.
5. **One-Click Export to SAP S/4HANA**: Instant download of the standardized catalog in CSV/JSON format ready for ERP mass upload.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Vanilla Tailwind CSS (Google Stitch Design System Tokens), Lucide Icons |
| **Backend** | Python 3.12, FastAPI, Uvicorn, Pydantic v2 |
| **AI / NLP / ML** | Scikit-Learn (TF-IDF Vectorizers & Cosine Similarity), NumPy, Regex NER Token Extractors |
| **Data Processing** | Pandas, Multi-Part Stream Processors |
| **Security & Audit** | SHA-256 Cryptographic Merkle Ledger (`hashlib`), Presidio Edge Entity Redaction |
| **ERP Protocol** | Simulated SAP NetWeaver RFC / OData v4 BAPI Gateway |

---

## ⚙️ Quickstart & Local Setup

### Prerequisites
- **Node.js**: v18.0+ & `npm`
- **Python**: v3.10+ & `pip`

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/sumitborse63/onmc.git
cd onmc
```

---

### Step 2: Set Up & Launch FastAPI Backend
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install fastapi uvicorn pydantic python-multipart pandas scikit-learn numpy

# Launch the FastAPI server
python main.py
```
> Backend API will start at: **`http://localhost:8000`**  
> Interactive Swagger API Docs: **`http://localhost:8000/docs`**

---

### Step 3: Set Up & Launch React Frontend
Open a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
> Frontend Web Application will start at: **`http://localhost:5173`**

---

## 📂 Project Structure

```
onmc/
├── backend/
│   ├── main.py                     # FastAPI server, REST routes & CSV loader
│   ├── services/
│   │   ├── matching_engine.py      # Agent 1: Real TF-IDF & attribute hybrid matcher
│   │   ├── ocr_pipeline.py         # Agent 2: Industrial OCR spell-checker
│   │   ├── sourcing_simulator.py   # Agent 3: Econometric PDI & MSE quota calculator
│   │   ├── sap_connector.py        # Agent 4: SAP NetWeaver BAPI RFC connector
│   │   ├── audit_ledger.py         # Agent 5: SHA-256 Merkle chain audit ledger
│   │   └── privacy_edge.py         # Agent 6: Presidio PII & commercial redactor
│   └── requirements.txt            # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                 # Full-bleed cockpit layout & tab router
│   │   ├── index.css               # Google Stitch design system & Tailwind tokens
│   │   ├── services/
│   │   │   └── api.ts              # API client connecting to FastAPI backend
│   │   ├── components/
│   │   │   ├── FactorRadarChart.tsx    # 5-Axis interactive SVG radar chart
│   │   │   ├── XAIDiffTable.tsx        # Explainable AI token diff matrix
│   │   │   └── PriceDispersionChart.tsx# SVG price variance scatter plot
│   │   └── views/
│   │       ├── ReviewerPortalView.tsx  # Yellow Tier adjudication gateway
│   │       ├── RegistryExplorerView.tsx# 1:N National Catalog Explorer & CSV uploader
│   │       ├── DuplicateClusterView.tsx# Duplicate detection & safety stock analytics
│   │       ├── SourcingSimulatorView.tsx# Joint tendering & MSE quota simulator
│   │       ├── LegacyOCRInspectorView.tsx# Multimodal OCR drawing inspector
│   │       └── VigilanceDashboardView.tsx# Live SAP drift monitor & Merkle ledger
│   ├── package.json
│   └── vite.config.ts
│
├── SIH26099_synthetic_material_master_dataset.csv # 293+ benchmark refinery records
├── DESIGN.md                       # Google Stitch semantic design system specification
├── Technical_Stack_Architecture_and_Workflows.md # Full architecture & workflow specification
├── LICENSE
└── README.md
```

---

## 📄 API Reference Overview

| HTTP Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Telemetry heartbeat for all 6 autonomous agents |
| `GET` | `/api/data/records` | 293+ ingested material master records from benchmark CSV |
| `GET` | `/api/data/masters` | Harmonized 1:N Common National Material Masters |
| `GET` | `/api/data/duplicates` | Cross-CPSE duplicate & near-duplicate clusters |
| `POST` | `/api/data/upload-csv` | Bulk CPSE CSV dataset ingestion & batch AI resolution |
| `GET` | `/api/data/export-mapped-csv` | Stream downloadable CSV formatted for SAP S/4HANA |
| `POST` | `/api/agent1/evaluate-match` | Real-time hybrid vector similarity & XAI diff calculation |
| `POST` | `/api/agent1/adjudicate` | Reviewer approval/rejection, SAP commit & Merkle block creation |
| `POST` | `/api/agent2/ocr-spellcheck` | Industrial lexicon character disambiguation & JSON parser |
| `POST` | `/api/agent3/sourcing-simulate` | Econometric price dispersion & MSEs Order 2012 quota engine |
| `GET` | `/api/agent5/ledger` | Live SHA-256 Merkle chain cryptographic audit trail |
| `POST` | `/api/agent5/revert-drift/{id}` | Reverts unauthorized SAP override and enforces approved master |
| `POST` | `/api/agent6/scrub-privacy` | DPDP Act 2023 edge PII and commercial entity redactor |

---

## 📜 Statutory Compliance & Governance

- **DPDP Act 2023**: Zero commercial leakage via Agent 6 edge sanitization.
- **Public Procurement Policy for MSEs Order, 2012**: Enforces mandatory 25% allocation (4% SC/ST, 3% Women MSEs) in all aggregated joint tenders.
- **CAG & Internal Vigilance Audit**: Complete traceability through tamper-evident SHA-256 Merkle chain hashes.
