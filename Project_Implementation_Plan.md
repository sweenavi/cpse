# Comprehensive Phase-Wise Project Implementation Plan
## AI-Driven Standardization and Harmonization of Material Codes Across CPSEs
**Target Organization:** Ministry of Petroleum & Natural Gas (MoPNG) / Chennai Petroleum Corporation Limited (CPCL)  
**Standard Reference:** IEEE 830 / ISO/IEC/IEEE 29148  
**Pilot Testbed:** Chennai Petroleum Corporation Limited (CPCL) ↔ Indian Oil Corporation Limited (IOCL)  
**Document Version:** 2.0 (Production-Grade Engineering Blueprint)

---

## 1. Executive Summary & Strategic Mission Framework

### 1.1 Product Vision: Digital Public Infrastructure (DPI) for Procurement
The platform operates as a secure, federated Digital Public Infrastructure delivering **"One Nation – One Material Code"** (the *UPI of Material Master Data*). It bridges isolated SAP/ERP systems across Central Public Sector Enterprises (CPSEs)—such as CPCL, IOCL, ONGC, NTPC, SAIL, BPCL, HPCL, and BHEL—by transforming unstructured, fragmented, and shorthand-heavy industrial descriptions into a standardized national taxonomy with full backward traceability.

```
+----------------------------------------------------------------------------------------------------+
|                                    NATIONAL DPI ECOSYSTEM                                          |
|                                                                                                    |
|  [ CPCL SAP MM ] <=====> [ Edge Agent 6 ] ----(mTLS 1.3)----+                                      |
|  [ IOCL SAP MM ] <=====> [ Edge Agent 6 ] ----(mTLS 1.3)----+---> [ CENTRAL DPI HUB ]             |
|  [ ONGC / SAIL ] <=====> [ Edge Agent 6 ] ----(mTLS 1.3)----+     - Agent 1: Matching & Routing    |
|                                                                   - Agent 2: Legacy Migration      |
|  LEGACY SOURCES: Scanned Blueprints / PDFs / Historical POs ----> - Agent 3: Insights & Savings    |
|                                                                   - Agent 4: SAP Reconciliation    |
|                                                                   - Agent 5: Drift & Security      |
|                                                                   - Tamper-Evident SHA-256 Ledger  |
+----------------------------------------------------------------------------------------------------+
```

### 1.2 Strategic Reference Alignments
The implementation roadmap and data models are calibrated against specific operational and statutory benchmarks provided in the workspace:
1. **Material Master Datasets:** `SIH26099_synthetic_material_master_dataset.csv`, `material_standardization_training.csv`, `duplicate_detection_training.csv`, and `material_equivalence_mappings.csv`.
2. **CPCL Procurement Guidelines:** *Annual Procurement Plan FY 2021-22*, *Annual Procurement Plan FY 2023-24 (MSEs Order 2012)*, and *Future Procurement Plan 2025-26*.
3. **Complex Engineering Specifications:** *tc62666-r00* standard refinery and heavy rotating equipment datasheets (valves, pumps, gaskets, refractory linings).

---

## 2. The 6-Agent Autonomous AI Pipeline: Technical Matrix

The platform is driven by a 6-agent autonomous pipeline operating across on-premise edge nodes and the Central DPI Hub:

| Agent Identifier | Operational Domain | Primary Algorithm / Tech Stack | Input Data Streams | Output Artifacts | Target SLA / Metric |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Agent 6: Local Privacy Edge** | CPSE Intranet (On-Premise) | Presidio NER, Custom Regex Scrubbers, Local `BGE-large-en` | Raw SAP MM Material Master Tables (`MARA`, `MAKT`) | Anonymized 1024-dim Vector Embeddings + Cryptographic Ref IDs | Zero Cleartext Leakage (100% Commercial Masking) |
| **Agent 1: Matching & Routing Engine** | Central DPI Hub | Qdrant Vector Index, PostgreSQL Structured Matcher, Hybrid Scoring ($S_{\text{final}} = w_1 S_{\text{vec}} + w_2 S_{\text{attr}}$) | Anonymized Embeddings, Extracted Engineering Attributes | Tri-Tier Classification: Green ($\ge 0.95$), Yellow ($0.70-0.94$), Red ($< 0.70$) | $< 250\text{ ms}$ search across 10M SKUs; $< 0.5\%$ False Positive in Green Tier |
| **Agent 2: Legacy Migration Agent** | Central DPI Hub | LayoutLMv3, Tesseract 5.0, Domain Industrial Dictionaries (API, ASTM, IS, DIN, ASME) | Legacy PDFs, Scanned Blueprints, Historical Spreadsheets | Structured Key-Value JSON Attribute Payloads | Character OCR Confidence $> 85\%$; $> 95\%$ NER F1-score |
| **Agent 3: Reporting & Strategic Insights** | Central DPI Hub | Local Llama-3-8B-Instruct, Statistical Price Dispersion Engine, Joint Tendering Optimizer | Approved Material Mappings, Historical PO Rate Curves, Procurement Plans | Executive Summaries, Joint-Tendering Opportunity Matrices, Price Variance Reports | Automated bi-weekly generation; accurate bulk discount modeling |
| **Agent 4: SAP Reconciliation Connector** | CPSE Intranet & Central Hub | PyRFC, SAP NetWeaver RFC SDK, OData v4, IDoc `MATMAS05` | Approved National Code Mappings from Green/Yellow Tiers | Bi-Directional SAP MM Line-Item Key Updates | Idempotent sync; $< 2\text{ s}$ per transaction batch; zero table lockups |
| **Agent 5: Compliance & Drift Monitor** | Central DPI Hub & Edge | Continuous Diff Engine, SHA-256 Hash Chain Verifier, Approval Anomaly Detector | Live SAP Material Master Tables vs DPI Hub Registry State | Drift Alerts, Security Breach Flags, Audit Compliance Logs | Real-time detection of unauthorized ERP overrides; 100% immutable audit chain |

---

## 3. Master Work Breakdown Structure (WBS) & 12-Month Phase Roadmap

```
+----------------------------------------------------------------------------------------------------+
|                                    12-MONTH PILOT & SCALE ROADMAP                                  |
+-------------------+--------------------+--------------------+--------------------+-----------------+
| MONTHS 1-2        | MONTHS 3-4         | MONTHS 5-6         | MONTHS 7-8         | MONTHS 9-12     |
| Phase 0 & Phase 1 | Phase 1 & Phase 2  | Phase 2 & Phase 3  | Phase 4 & Phase 5  | Phase 6         |
| - Inception       | - Model Training   | - SAP MM Sync      | - Compliance Audit | - Pilot Go-Live |
| - Cloud & Edge    | - Edge Scrubbing   | - Swiss UI Portal  | - Savings Engine   | - CAG Sign-Off  |
| - Data Ingestion  | - Hybrid Resolution| - HITL Review      | - Drift Monitor    | - Scale to CPSEs|
+-------------------+--------------------+--------------------+--------------------+-----------------+
```

---

### Phase 0: Project Inception, Governance & Infrastructure Setup (Month 1, Weeks 1–4)

#### Objectives
Establish cross-CPSE governance with the Ministry of Petroleum & Natural Gas (MoPNG), provision the sovereign cloud landing zone (MeghRaj), configure on-premise edge enclaves at CPCL (Manali Refinery / Cauvery Basin) and IOCL, and stand up the baseline DevSecOps pipelines.

#### Weekly Sprint Breakdown
*   **Week 1 (Governance & Charters):**
    *   Form the Joint Steering Committee: Nodal Officers from MoPNG, CPCL Materials Management, and IOCL Refineries Division.
    *   Formulate Data Governance & Security Charter: Enforce zero raw commercial data exchange between enterprises.
    *   Freeze interface boundaries: Define the 12-character alphanumeric **Common National Material Code (NMC)** structure (`CNM-XXXXXX-XXX`).
*   **Week 2 (Central Cloud Enclave Provisioning - MeghRaj):**
    *   Provision production Kubernetes (k8s) cluster with GPU nodes for deep learning inference.
    *   Deploy **Qdrant Vector Database** cluster with distributed HNSW indexing and SSD-backed persistence.
    *   Provision managed PostgreSQL 16 instance with `pgvector` and row-level security.
    *   Deploy Apache Kafka and Redis cluster for high-throughput asynchronous job queueing.
*   **Week 3 (Edge Enclave Provisioning at CPCL & IOCL):**
    *   Deploy on-premise containerized Edge instances inside CPCL and IOCL local DMZ networks.
    *   Establish mutual TLS (mTLS 1.3) tunnel with cryptographic certificate pinning between Edge and Central Hub.
    *   Configure read-only staging databases mirroring SAP `MARA`, `MAKT`, `MARC`, and `MBEW` tables.
*   **Week 4 (DevSecOps & UI Baseline Scaffolding):**
    *   Configure CI/CD pipelines with SonarQube, Bandit, and Trivy container scanning.
    *   Scaffold the **Swiss Industrial Print** frontend architecture (Tailwind v4, React Server Components, Geist/JetBrains Mono typography).

#### Deliverables & Milestone Gate (M0)
*   [x] Signed MoPNG Data Governance & Privacy Protocol.
*   [x] Operational MeghRaj Central DPI Hub and Edge enclaves with verified mTLS 1.3 connectivity.
*   [x] Initialized Qdrant and PostgreSQL schemas with baseline test records.

---

### Phase 1: Data Ingestion, NER Training & Hybrid Entity Resolution (Months 2–3, Weeks 5–12)

#### Objectives
Ingest, cleanse, and structure legacy material catalogs from CPCL and IOCL; train domain-adapted Named Entity Recognition (NER) models for mechanical, electrical, instrumentation, and chemical attributes; calibrate the hybrid matching engine.

#### Weekly Sprint Breakdown
*   **Week 5 (Dataset Ingestion & Exploration):**
    *   Ingest `SIH26099_synthetic_material_master_dataset.csv` (295 benchmark multi-CPSE SKUs across IOCL, CPCL, ONGC, NTPC, SAIL, BPCL, HPCL).
    *   Ingest `material_standardization_training.csv` and `duplicate_detection_training.csv`.
    *   Establish classification cross-walks with UNSPSC standard codes (e.g., UNSPSC `40161500` for Filters, `41111600` for Gaskets, `40171600` for Pipe Fittings).
*   **Week 6 (Domain-Adapted NER Pipeline Development):**
    *   Train domain-adapted transformer models (fine-tuned RoBERTa-large / DeBERTa-v3) on industrial technical descriptions.
    *   Target Entity Extraction Categories:
        *   `Material_Grade`: SS316, SS304, WCB, Carbon Steel, A234 WPB, Monel, Inconel.
        *   `Dimension_Size`: 2" NB, 50x3mm, 1291x1225x6.35mm, 51mm OD.
        *   `Pressure_Rating`: Class 150#, Class 300#, 0-100 Bar, PN16, Schedule 80.
        *   `Standard_Code`: ASME B16.34, API 6D, ASTM A106, IS 1239, DIN 2448.
        *   `Unit_Of_Measurement`: PCS, NOS, EA, KGS, MTRS, SET.
*   **Week 7 (Agent 2 Legacy OCR & Blueprint Digitization Engine):**
    *   Integrate LayoutLMv3 and Tesseract 5.0 for processing scanned purchase orders and manufacturer datasheets (`tc62666-r00-1583725206.pdf`).
    *   Implement dictionary-assisted OCR post-processing to resolve industrial character confusions (e.g., distinguishing bearing `6205-ZZ` from `6205-22`, `O-RING` vs `0-RING`).
    *   Flag OCR extractions with confidence $< 85\%$ for manual image crop inspection.
*   **Week 8 (Local Edge Vectorization Pipeline):**
    *   Deploy `BGE-large-en-v1.5` on CPSE Edge nodes to generate dense 1024-dimensional semantic embeddings.
    *   Benchmark edge vectorization throughput: Target $> 500$ descriptions/second on standard 8-core CPU instances.
*   **Weeks 9–10 (Hybrid Matching Engine Calibration - Agent 1):**
    *   Construct the Qdrant HNSW vector index using cosine distance.
    *   Implement the dual-scoring function:
        $$S_{\text{final}} = w_1 \cdot S_{\text{vector}} + w_2 \cdot S_{\text{attribute}}$$
        *(Default calibration: $w_1 = 0.45$, $w_2 = 0.55$ with mandatory hard attribute blocking on Material Grade and Pressure Class)*.
    *   Validate match results against `material_equivalence_mappings.csv` (e.g., matching CPCL `1151193733`, IOCL `1151193734`, and ONGC `1151193735` to `CNM-40161500-001`).
*   **Weeks 11–12 (Tri-Tier Decision Gate Hardening):**
    *   **Green Tier ($S_{\text{final}} \ge 0.95$):** Auto-link to existing Common National Material Code; trigger automated Agent 4 sync.
    *   **Yellow Tier ($0.70 \le S_{\text{final}} < 0.95$):** Compile Explainable AI (XAI) feature importance table and route to Reviewer Portal.
    *   **Red Tier ($S_{\text{final}} < 0.70$):** Flag as novel physical SKU; initiate new National Code generation sequence.
    *   Perform Golden Dataset evaluation: Verify false-positive rate is $< 0.5\%$ on Green Tier auto-merges.

#### Deliverables & Milestone Gate (M1)
*   [x] Trained and validated Domain NER model achieving $\ge 95\%$ F1-score.
*   [x] Automated legacy OCR pipeline processing PDF datasheets with $> 85\%$ character accuracy.
*   [x] Hybrid matching engine achieving $< 0.5\%$ false positives on the 295-item benchmark dataset.

---

### Phase 2: Edge Privacy Layer & Non-Invasive SAP MM Integration (Months 4–5, Weeks 13–20)

#### Objectives
Deploy Agent 6 (Local Privacy Edge) to scrub sensitive commercial data on-premise; implement Agent 4 (SAP Reconciliation) for bi-directional, non-invasive synchronization with CPCL and IOCL SAP ECC 6.0 / S/4HANA systems.

#### Weekly Sprint Breakdown
*   **Weeks 13–14 (Agent 6 Edge Data Scrubbing & PII Redaction):**
    *   Implement strict allow-list masking using Microsoft Presidio and industrial NER filters.
    *   Strip commercial and supplier identifiers: Vendor Names (`Vendor-182`), Plant Identifiers (`Haldia Refinery`), Purchase Order Numbers, and Raw Unit Prices (`₹29.87`).
    *   Execute cryptographic hashing on CPSE internal material codes (`IOC-455007` $\rightarrow$ HMAC-SHA-256 Token) to create non-reversible reference IDs.
*   **Week 15 (Zero-Leakage Network Penetration Audit):**
    *   Engage CERT-In certified third-party auditors to execute packet capture inspection on egress traffic from Edge nodes.
    *   Certify that 100% of payload transmitted over mTLS consists solely of anonymized vector floats and cryptographic tokens.
*   **Weeks 16–17 (Agent 4 Bi-Directional SAP MM Connector):**
    *   Configure PyRFC and SAP NetWeaver RFC SDK to communicate with SAP ECC 6.0 and S/4HANA MM modules.
    *   Implement standard OData v4 and IDoc `MATMAS05` integration pipelines.
    *   Map approved National Material Codes to SAP standard classification fields (`MARA-MATNR`, `MAKT-MAKTX`, `MARA-BISMT` - Old Material Number, or custom enhancement `MARA-ZZNATCODE`).
*   **Weeks 18–19 (Idempotent Transaction Queue & Conflict Handling):**
    *   Build Redis-backed idempotent queueing with unique Transaction UUIDs.
    *   Implement exponential backoff retry logic ($t_{\text{retry}} = 2^n \times 500\text{ ms}$, max 5 retries) for SAP network timeouts.
    *   Implement strict rollback mechanisms: If SAP rejects an update due to line-item locking, revert Hub state to `PENDING_RETRY` without corrupting the audit ledger.
*   **Week 20 (End-to-End Staging Integration Test):**
    *   Execute 10,000 synthetic material sync cycles against CPCL and IOCL SAP staging environments.
    *   Verify zero database locks, zero schema corruption, and 100% reconciliation receipts.

#### Deliverables & Milestone Gate (M2)
*   [x] Certified Edge Privacy Agent guaranteeing zero cleartext leakage.
*   [x] Bi-directional SAP MM connector operating via standard PyRFC / OData without modifying core SAP business logic.
*   [x] 10,000-record staging sync completed with zero transactional failures.

---

### Phase 3: Swiss Industrial Reviewer Portal & Human-in-the-Loop Triage (Months 6–7, Weeks 21–28)

#### Objectives
Construct and deploy the Reviewer Portal following the **Swiss Industrial Print** architectural aesthetic; implement interactive multi-factor radar charts, Explainable AI diff matrices, and cross-CPSE price dispersion scatter plots; initiate human-in-the-loop triage for Yellow Tier records.

#### Weekly Sprint Breakdown
*   **Weeks 21–22 (Frontend Substrate & Component Engineering):**
    *   Implement Swiss Industrial Print design tokens:
        *   Substrate background: `#F4F4F0` (Matte documentation paper).
        *   Foreground typography: `#050505` (Carbon Ink).
        *   Accent highlights: `#E61919` (Aviation Red).
    *   Implement $90^{\circ}$ rigid geometry (zero `border-radius`), 1px Blueprint CSS grids (`display: grid; gap: 1px;`), and "Doppelrand" nested data cells.
    *   Configure typography scale: `Geist Black` / `Neue Haas Grotesk` for macro headers and `JetBrains Mono` for all tabular data and SAP codes.
*   **Weeks 23–24 (Visual Comparison Matrix & XAI Diff Engine):**
    *   **5-Axis Multi-Factor Radar Chart:** Plot *Dimensional Conformance*, *Material Grade Match*, *Pressure/Tolerance Rating*, *Standard/Quality Code Overlap*, and *UoM Consistency*.
    *   **XAI Justification Table:** Highlight exact token overlaps (`SS316 == SS316`), unit conversions (`2" NB == 50mm`), and attribute penalties.
    *   **Cross-CPSE Historical Price Dispersion Scatter Plot:** Render anonymized price distributions across CPSEs (e.g., CPCL ₹14,200 vs IOCL ₹12,800) to highlight volume bargaining opportunities.
*   **Weeks 25–26 (Reviewer Workflow & Adjudication Queue):**
    *   Construct the Yellow Tier triage queue ($0.70 \le S_{\text{final}} < 0.95$).
    *   Build keyboard-first navigation shortcuts (`Arrow Keys` for navigation, `Enter` to Approve, `Esc` to Reject, `M` to Modify Specs).
    *   Implement optimistic UI updates with immediate feedback and background SAP dispatching.
*   **Weeks 27–28 (Frontend Pre-Flight Quality Gate Audit):**
    *   Execute strict frontend verification against design-system benchmarks:
        *   [x] Strict WCAG AA contrast compliance across all text/background pairs ($\ge 4.5:1$).
        *   [x] Zero layout shifts (CLS $0.0$) using fixed aspect containers and deterministic grid tracks.
        *   [x] Responsive viewport stability using `min-h-[100dvh]` (zero `h-screen` viewport jumps).
        *   [x] Hardware-accelerated GPU animations restricted strictly to `transform` and `opacity`.
        *   [x] Zero `useState` for high-frequency scroll or pointer physics.

```
+----------------------------------------------------------------------------------------------------+
|                      SWISS INDUSTRIAL PRINT: REVIEWER PORTAL LAYOUT                                |
+------------------------------------------------------------------+---------------------------------+
|  [ SYSTEM.HUB // MATERIAL ADJUDICATION ]                         |  TELEMETRY: TIER-2 (YELLOW)     |
+------------------------------------------------------------------+---------------------------------+
|  < LOCAL CPCL SPECIFICATION >                                    |  < CANDIDATE NATIONAL MATCH >   |
|  - Internal Code: CPCL-649787                                    |  - National Code: NMC-100046    |
|  - Raw Desc: "LADLE REFRACTORY LINING BRICK MGO-C"               |  - Std Name: "Ladle Refractory  |
|  - Material: Magnesia Carbon (MgO-C) | Plant: Cauvery Basin      |    Lining Brick MgO-C"          |
+------------------------------------------------------------------+---------------------------------+
|  [ EXPLAINABLE AI (XAI) DIFF MATRIX ]                            |  [ 5-AXIS TOPOLOGY RADAR ]      |
|  - Material Chemistry Overlap: 100% [ MATCH: MgO-C ]             |          Pressure Class         |
|  - Application Thermal Class: 100% [ MATCH: Refractory ]         |                /\               |
|  - Dimensional Ratio: 98.4% [ TOLERANCE: +/- 1mm ]              |   Standard    /  \   Dimension  |
|  - Unified Confidence Score: 92.4% [ YELLOW TIER REVIEW ]        |               \  /              |
|                                                                  |                \/               |
|                                                                  |             Material            |
+------------------------------------------------------------------+---------------------------------+
|  [ HISTORICAL RATE DISPERSION ]                                  |  [ ACTION GATEWAY ]             |
|  - CPCL Rate: Rs 863.14/ea | Benchmark: Rs 810.00/ea             |  [ /// APPROVE & SYNC SAP ]     |
|  - Est. Group Savings: Rs 53.14/ea (6.1%)                        |  [ /// REJECT ]  [ /// MODIFY ] |
+----------------------------------------------------------------------------------------------------+
```

#### Deliverables & Milestone Gate (M3)
*   [x] Deployed Swiss Industrial Print Reviewer Portal.
*   [x] Interactive 5-Axis Radar and XAI justification tables operating with $< 50\text{ ms}$ render time.
*   [x] Reviewer throughput benchmarked at $> 60$ adjudications/hour per engineer.

---

### Phase 4: Compliance Ledger, Drift Detection & Security Monitoring (Months 8–9, Weeks 29–36)

#### Objectives
Deploy Agent 5 (Compliance & Drift Monitor) to continuously verify live SAP records against the DPI Hub; establish an immutable, cryptographically chained SHA-256 audit ledger satisfying CAG and vigilance mandates.

#### Weekly Sprint Breakdown
*   **Weeks 29–30 (Cryptographic Audit Ledger Engine):**
    *   Construct the append-only audit ledger table in PostgreSQL:
        $$\text{Hash}_n = \text{SHA-256}(\text{Hash}_{n-1} \parallel \text{Timestamp} \parallel \text{UserID} \parallel \text{Action} \parallel \text{PayloadJSON})$$
    *   Store hourly root state Merkle hashes in tamper-evident external storage to prevent database administrator tampering.
*   **Weeks 31–32 (Agent 5 Live ERP Drift Detection Engine):**
    *   Implement scheduled background delta scanners comparing live SAP MM material descriptions with approved National Hub mappings.
    *   Drift Severity Classification:
        *   **Minor Drift (Level 1):** Punctuation or minor abbreviation changes $\rightarrow$ Logged as informational note.
        *   **Moderate Drift (Level 2):** UoM modification or tolerance changes $\rightarrow$ Flagged for re-adjudication.
        *   **Critical Drift / Security Breach (Level 3):** Unauthorized manual reassignment of material grade, standard code, or deletion of the mapped National Code in SAP $\rightarrow$ Real-time high-priority security alert.
*   **Weeks 33–34 (Reviewer Anomaly & Velocity Monitoring):**
    *   Implement behavioral monitoring on human reviewers: Detect anomalous bulk approvals (e.g., approving $> 100$ records in under 60 seconds without expanding XAI diff tables).
    *   Automatically suspend suspicious review sessions and route batch for senior supervisory audit.
*   **Weeks 35–36 (Nodal Oversight & Vigilance Dashboard):**
    *   Build executive compliance dashboards displaying real-time audit ledger status, drift occurrence rates, and system-wide synchronization health.

#### Deliverables & Milestone Gate (M4)
*   [x] Cryptographically chained SHA-256 audit ledger with automated integrity verification.
*   [x] Agent 5 active across CPCL and IOCL, detecting unauthorized local ERP overrides within $< 15\text{ minutes}$.
*   [x] Automated vigilance alerts for anomalous reviewer behavior.

---

### Phase 5: Procurement Savings Simulator & Strategic Sourcing Analytics (Months 10–11, Weeks 37–44)

#### Objectives
Deploy Agent 3 (Reporting & Insights) to simulate aggregated inter-CPSE procurement; calculate historical price variances; generate natural language executive briefings aligned with CPCL Annual Procurement Plans and public MSE mandates.

#### Weekly Sprint Breakdown
*   **Weeks 37–38 (Statistical Price Dispersion & Sourcing Model):**
    *   Aggregate annual procured quantities across deduplicated materials (e.g., combining CPCL, IOCL, and ONGC annual volumes for Ball Valves and O-Rings from `SIH26099_synthetic_material_master_dataset.csv`).
    *   Calculate Price Dispersion Index ($PDI = \frac{P_{\max} - P_{\min}}{P_{\text{median}}}$) across CPSE facilities.
    *   Model econometric bulk purchasing discount curves based on volume tiers:
        $$\text{Savings} = \sum_{i} Q_i \cdot \left( P_i - P_{\text{target}}(Q_{\text{total}}) \right)$$
*   **Weeks 39–40 (Policy Alignment with Annual Procurement Plans):**
    *   Align savings models with statutory guidelines in:
        *   *Annual Procurement Plan FY 2021-22* (General tender benchmarks).
        *   *Annual Procurement Plan FY 2023-24 (MSEs Order 2012)*: Ensure joint-tendering simulations protect mandatory 25% procurement quotas from Micro & Small Enterprises (MSEs) and 4% from SC/ST MSEs.
        *   *Future Procurement Plan 2025-26*: Map capital equipment spares and long-lead turnaround items.
*   **Weeks 41–42 (Agent 3 Natural Language Briefing Engine):**
    *   Deploy local, on-premise `Llama-3-8B-Instruct` for automated summary generation.
    *   Generate executive digests: "Executive Summary: Aggregating ASTM A106 Seamless Pipe procurement across CPCL Manali and IOCL Haldia yields an estimated annual savings of ₹4.82 Crore (14.2% reduction) under a common rate contract."
*   **Weeks 43–44 (Automated Scheduled Reporting & Ministry Feeds):**
    *   Implement automated PDF/Excel briefing exports for MoPNG nodal officers and CPCL/IOCL Director (Finance) boards.

#### Deliverables & Milestone Gate (M5)
*   [x] Operational Procurement Savings Simulator modeling volume rate discounts.
*   [x] Policy compliance engine ensuring adherence to Public Procurement Policy for MSEs Order 2012.
*   [x] Automated natural language executive briefing generator running locally on Llama-3.

---

### Phase 6: Pilot Go-Live, CAG Audit Validation & Multi-CPSE Expansion (Month 12 & Beyond)

#### Objectives
Execute final production cutover of the CPCL ↔ IOCL pilot; conduct official CAG / Internal Audit validation; establish operational handoff; release the national expansion blueprint for ONGC, NTPC, SAIL, BPCL, HPCL, and BHEL.

#### Weekly Sprint Breakdown
*   **Weeks 45–46 (Full Pilot Go-Live Cutover):**
    *   Execute full catalog harmonization across CPCL (Cauvery Basin & Manali) and IOCL (Haldia, Panipat, Gujarat refineries).
    *   Process full material inventory ($> 100,000$ active line items).
    *   Achieve $> 95\%$ auto-harmonization on standard items, with remaining items cleared through domain reviewer queues.
*   **Weeks 47–48 (CAG / Vigilance Audit Clearance):**
    *   Submit immutable SHA-256 cryptographic audit logs to CAG and internal vigilance teams for formal audit inspection.
    *   Validate 100% backward traceability from any generated Common National Material Code to legacy SAP line items.
*   **Weeks 49–50 (Operational Handoff & Nodal Training):**
    *   Conduct comprehensive training for CPCL and IOCL Materials Management teams.
    *   Publish Standard Operating Procedures (SOP) for new SKU creation and exception handling.
*   **Weeks 51–52 (Multi-CPSE Expansion Blueprint Release):**
    *   Publish federated Edge deployment packages (Docker / Helm charts) for rolling out to ONGC, NTPC, SAIL, BPCL, HPCL, and BHEL.
    *   Establish the permanent National Material Master Nodal Operations Center.

#### Deliverables & Milestone Gate (M6)
*   [x] Complete operational harmonization of CPCL ↔ IOCL Material Masters.
*   [x] Official CAG and Vigilance Audit clearance certification.
*   [x] Multi-CPSE rollout kit for national-scale expansion.

---

## 4. Data Management, Taxonomy & Database Schema Specifications

### 4.1 Common National Material Code (NMC) Structure
The platform assigns a deterministic 12-character alphanumeric identifier:

$$\mathbf{CNM} - \mathbf{XXXXXX} - \mathbf{XXX}$$

*   `CNM`: Static Prefix (**C**ommon **N**ational **M**aterial).
*   `XXXXXX`: 6-digit UNSPSC Segment/Family category code (e.g., `401615` for Filters, `401716` for Pipe Fittings, `411116` for Gaskets).
*   `XXX`: 3-digit deterministic cluster sequence counter (`001` to `999`).

### 4.2 Core Relational Database Schema (PostgreSQL 16)

```sql
-- 1. Master Registry: Common National Material Codes
CREATE TABLE national_material_master (
    national_material_code VARCHAR(16) PRIMARY KEY, -- e.g., 'CNM-401615-001'
    standardized_name VARCHAR(255) NOT NULL,
    unspsc_code VARCHAR(10) NOT NULL,
    unspsc_category VARCHAR(150),
    material_grade VARCHAR(100),
    dimension_spec VARCHAR(100),
    pressure_rating VARCHAR(50),
    standard_specification VARCHAR(100), -- e.g., 'ASME B16.34', 'API 6D'
    base_uom VARCHAR(20) NOT NULL,
    technical_specifications JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Federated Edge Mapping: 1:N Relationship to CPSE Legacy Records
CREATE TABLE cpse_legacy_mapping (
    mapping_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    national_material_code VARCHAR(16) REFERENCES national_material_master(national_material_code),
    cpse_identifier VARCHAR(50) NOT NULL, -- e.g., 'CPCL', 'IOCL', 'ONGC', 'SAIL'
    cpse_plant_location VARCHAR(100),
    cpse_material_code_hashed VARCHAR(64) NOT NULL, -- Cryptographic hash
    legacy_description_raw TEXT NOT NULL,
    legacy_specification_raw TEXT,
    legacy_uom VARCHAR(20),
    existing_classification_code VARCHAR(50),
    ai_confidence_score NUMERIC(5, 4) NOT NULL,
    triage_tier VARCHAR(10) NOT NULL CHECK (triage_tier IN ('GREEN', 'YELLOW', 'RED')),
    review_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (review_status IN ('AUTO_APPROVED', 'MANUAL_APPROVED', 'REJECTED', 'PENDING')),
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMPTZ,
    sap_sync_status VARCHAR(20) NOT NULL DEFAULT 'UNSYNCED' CHECK (sap_sync_status IN ('UNSYNCED', 'SYNCED', 'FAILED', 'RETRY_QUEUED')),
    sap_sync_timestamp TIMESTAMPTZ,
    sap_transaction_receipt VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cpse_material UNIQUE(cpse_identifier, cpse_material_code_hashed)
);

-- 3. Cryptographic Tamper-Evident Audit Ledger (SHA-256 Chained)
CREATE TABLE cryptographic_audit_ledger (
    ledger_index BIGSERIAL PRIMARY KEY,
    previous_entry_hash VARCHAR(64) NOT NULL,
    current_entry_hash VARCHAR(64) NOT NULL,
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor_identity VARCHAR(100) NOT NULL, -- User ID or Agent Name (e.g., 'Agent-1-Engine')
    action_type VARCHAR(50) NOT NULL, -- e.g., 'AUTO_LINK', 'MANUAL_APPROVE', 'SAP_SYNC', 'DRIFT_DETECTED'
    affected_national_code VARCHAR(16),
    affected_cpse_code_hash VARCHAR(64),
    payload_snapshot JSONB NOT NULL,
    CONSTRAINT chk_hash_length CHECK (LENGTH(current_entry_hash) = 64)
);

-- Indexing for sub-millisecond lookups
CREATE INDEX idx_legacy_national_code ON cpse_legacy_mapping(national_material_code);
CREATE INDEX idx_legacy_cpse_tier ON cpse_legacy_mapping(cpse_identifier, triage_tier, review_status);
CREATE INDEX idx_audit_timestamp ON cryptographic_audit_ledger(event_timestamp);
```

### 4.3 Qdrant Vector Collection Configuration
```json
{
  "collection_name": "national_material_embeddings",
  "vectors": {
    "size": 1024,
    "distance": "Cosine"
  },
  "hnsw_config": {
    "m": 32,
    "ef_construct": 256,
    "full_scan_threshold": 10000,
    "max_indexing_threads": 4
  },
  "optimizers_config": {
    "deleted_threshold": 0.2,
    "vacuum_min_vector_number": 1000,
    "default_segment_number": 4
  }
}
```

---

## 5. Comprehensive Risk Management & Contingency Matrix

| Risk Event | Severity | Probability | Impact Area | Mitigation & Contingency Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **Cleartext Commercial Leakage across Edge** | Critical | Low | Data Sovereignty / Statutory Compliance | Agent 6 enforces zero-leakage regex & Presidio allow-lists. CI/CD automated packet inspection halts deployment on any cleartext egress. |
| **False-Positive Auto-Merge in Green Tier** | High | Low | Operational Safety / Warehouse Confusion | Hard attribute blocking: If Material Grade or Pressure Class differs, confidence is automatically capped at 0.69 (Red Tier), preventing auto-merge. |
| **SAP Table Locking or Network Failure** | High | Medium | ERP Availability / Operational Disruption | Agent 4 uses non-invasive OData/RFC with idempotent UUIDs and exponential backoff retry. Sync occurs during off-peak windows with zero schema changes. |
| **Reviewer Backlog in Yellow Tier** | Medium | Medium | Pilot Schedule SLA | Implement keyboard-first triage UI, bulk review for identical cluster variations, and auto-escalation alerts to supervisory engineers after 48h. |
| **ERP Description Drift after Harmonization** | High | Medium | Master Data Integrity | Agent 5 runs hourly diff scans against SAP MM tables, instantly generating vigilance alerts upon unauthorized manual local edits. |

---

## 6. Verification, Testing & Acceptance Protocols

### 6.1 Algorithmic Performance Acceptance Thresholds
*   **NER Extraction F1-Score:** $> 95\%$ on mechanical/chemical spare parts datasets.
*   **Green Tier Precision:** $\ge 99.5\%$ ($< 0.5\%$ false-positive rate on golden test set).
*   **Vector Search Latency:** $< 250\text{ ms}$ for top-10 candidate retrieval across 10,000,000 records under 100 concurrent requests.
*   **SAP Sync Throughput:** $> 500$ records/minute with $0.0\%$ transaction collision rate.

### 6.2 Frontend Code Quality Pre-Flight Matrix
All UI code delivered for the Reviewer Portal must satisfy the following criteria:
- [x] **Substrate Consistency:** Strict adherence to Swiss Industrial Print light mode (`#F4F4F0` / `#050505` / `#E61919`).
- [x] **Geometry:** $100\%$ rigid $90^{\circ}$ cuts (zero `rounded-*` classes).
- [x] **Typography:** `Geist Black` / `Neue Haas Grotesk` structural headers and `JetBrains Mono` telemetry grids.
- [x] **A11y Contrast:** WCAG AA compliance verified on all text elements ($\ge 4.5:1$).
- [x] **Viewport Stability:** Exclusive use of `min-h-[100dvh]` to eliminate mobile address bar jump.
- [x] **GPU-Safe Motion:** Motion choreography restricted exclusively to `transform` and `opacity` with custom cubic-beziers.

---
*Signed & Approved for Implementation:*  
**Implementation Specification:** National Unified Material Master Implementation  
**Target Entity:** Ministry of Petroleum & Natural Gas (MoPNG) / Chennai Petroleum Corporation Limited (CPCL)
