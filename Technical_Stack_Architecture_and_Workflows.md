# Technical Stack, System Architecture & Process Workflows

**Project Title:** AI-Driven Standardization and Harmonization of Material Codes Across CPSEs  
**Standard Reference:** IEEE 1471 / ISO/IEC/IEEE 42010 Architecture Standard  
**Target Organization:** Ministry of Petroleum & Natural Gas (MoPNG) / Chennai Petroleum Corporation Limited (CPCL)  
**Pilot Testbed:** Chennai Petroleum Corporation Limited (CPCL) ↔ Indian Oil Corporation Limited (IOCL)  
**Document Version:** 2.0 (Master Engineering Specification)

> **Executive Summary:** This technical specification outlines the complete, open-source-first technology stack, federated sovereign system architecture, and detailed process workflows powering the "One Nation – One Material Code" digital public infrastructure. All core software components are 100% Free and Open-Source Software (FOSS) requiring zero recurring SaaS subscription fees.

---

## 1. Enterprise Technology Stack Matrix

The platform is constructed on an enterprise-grade, open-source-first stack deployed across on-premise CPSE edge nodes and the Sovereign Cloud (MeghRaj).

### 1.1 Complete Layer-by-Layer Technology Breakdown

| System Layer | Technology / Component | Version | Role & Architectural Purpose | License & Cost |
| :--- | :--- | :--- | :--- | :--- |
| **Presentation Layer** | **Next.js (App Router)** | `15.x` | React Server Components (RSC) architecture with zero client-bundle overhead. | MIT (**₹0 / Free**) |
| | **Tailwind CSS** | `v4.0` | Native CSS utility engine enforcing Swiss Industrial Print design tokens. | MIT (**₹0 / Free**) |
| | **Motion (fka Framer)**| `12.x` | Hardware-accelerated GPU micro-interactions (`transform` and `opacity`). | MIT (**₹0 / Free**) |
| | **Typography** | `Self/OFL` | `Geist Black` / `Neue Haas Grotesk` (headers) & `JetBrains Mono` (data). | SIL OFL (**₹0**) |
| **Edge Node (Spoke)** | **Microsoft Presidio** | `2.2.x` | Context-aware PII & commercial entity scrubbing (Vendor IDs, Prices, Plants). | MIT (**₹0 / Free**) |
| | **BGE-large-en-v1.5** | `1.5.0` | On-premise 1024-dimensional dense semantic vector embedding generation. | Apache 2.0 (**₹0**) |
| | **PyRFC Connector** | `3.3.x` | Direct C-extension binding to SAP NetWeaver RFC SDK for BAPI execution. | Apache 2.0 (**₹0**) |
| **Central AI Engine** | **Qdrant Vector DB** | `1.10.x` | Sub-250ms cosine similarity vector search across 10M+ SKUs (HNSW index). | Apache 2.0 (**₹0**) |
| | **DeBERTa-v3 / RoBERTa**| `v3-large`| Fine-tuned domain Named Entity Recognition (NER) for attribute parsing. | MIT (**₹0 / Free**) |
| | **LayoutLMv3** | `v3-base` | Multi-modal document transformer for parsing scanned legacy blueprints. | Open (**₹0 / Free**) |
| | **Tesseract OCR** | `5.4.x` | Optical character recognition with industrial dictionary spell-correction. | Apache 2.0 (**₹0**) |
| | **Llama-3-8B-Instruct**| `8B-AWQ` | Local quantized LLM on **vLLM** for automated executive briefings. | Llama 3 (**₹0**) |
| **Data & Messaging** | **PostgreSQL** | `16.3` | Relational master repository with partitioning, RLS, and JSONB stores. | PostgreSQL (**₹0**) |
| | **Apache Kafka** | `3.7.x` | High-throughput distributed event bus for streaming vectors and sync events. | Apache 2.0 (**₹0**) |
| | **Redis** | `7.2.x` | In-memory cache for reviewer queue state, optimistic UI locking, and tokens. | BSD-3 (**₹0 / Free**) |
| **Security & Gateway** | **SHA-256 Ledger** | `Native` | Cryptographically chained audit trail guaranteeing CAG compliance. | Standard (**₹0**) |
| | **Envoy Gateway** | `1.30.x` | Edge-to-Hub API gateway enforcing mutual TLS (mTLS 1.3) with cert pinning. | Apache 2.0 (**₹0**) |
| | **HashiCorp Vault** | `1.16.x` | Hardware Security Module (HSM) key management for signing audit blocks. | MPL 2.0 (**₹0**) |

---

## 2. System Architecture Design

### 2.1 Federated Sovereign Enterprise Architecture Diagram

```mermaid
flowchart TB
    subgraph CPSE_EDGE["CPSE Intranet Perimeter (e.g., CPCL / IOCL)"]
        direction TB
        SAP_ERP[("SAP S/4HANA / ECC 6.0\n(MARA, MAKT, MARC, MBEW)")]
        
        subgraph AGENT_6["Agent 6: Local Privacy Edge Node"]
            PRESIDIO["Presidio PII & Commercial Scrubber\n(Strips Vendor IDs, Prices, Plants)"]
            EMBED_LOCAL["Local Vectorizer\n(BGE-large-en-v1.5 1024-dim)"]
            TOKENIZER["Cryptographic Tokenizer\n(HMAC-SHA-256)"]
        end
        
        subgraph AGENT_4["Agent 4: SAP Connector"]
            PYRFC["PyRFC / SAP NetWeaver SDK"]
            ODATA["OData v4 Client"]
            IDOC["IDoc MATMAS05 Handler"]
        end

        SAP_ERP -->|Read-Only Delta| PRESIDIO
        PRESIDIO --> EMBED_LOCAL --> TOKENIZER
        AGENT_4 -->|Approved Sync / BAPI| SAP_ERP
    end

    subgraph TRANSPORT["Secure Transport Fabric"]
        MTLS_GW{{"Envoy API Gateway\n(mTLS 1.3 + Certificate Pinning)"}}
    end

    subgraph CLOUD_HUB["Central DPI Sovereign Cloud (MeghRaj / Govt Cloud)"]
        direction TB
        KAFKA[["Apache Kafka Event Bus\n(raw-vectors | sync-receipts | drift-alerts)"]]
        
        subgraph CORE_AI["Autonomous AI Pipeline Engine"]
            A1["Agent 1: Matching & Routing Engine\n(Hybrid Vector + Structured Scoring)"]
            A2["Agent 2: Legacy Migration Agent\n(LayoutLMv3 + Tesseract 5.0 OCR)"]
            A3["Agent 3: Strategic Insights Agent\n(Procurement Simulator & Llama-3)"]
            A5["Agent 5: Drift & Security Monitor\n(Continuous ERP Diff & Hash Audit)"]
        end

        subgraph DATA_FABRIC["Persistent Data & Indexing Fabric"]
            QDRANT[("Qdrant Vector DB\n(HNSW 1024-dim Index)")]
            POSTGRES[("PostgreSQL 16 Cluster\n(1:N Mapping Registry & RLS)")]
            LEDGER[("Cryptographic Audit Ledger\n(SHA-256 Chained Blocks)")]
            REDIS[("Redis 7.2 Cluster\n(Queue State & Session Cache)")]
        end

        A1 <--> QDRANT
        A1 <--> POSTGRES
        A1 --> LEDGER
        A5 --> LEDGER
        A5 -.->|Verify Live ERP| SAP_ERP
        A3 <--> POSTGRES
        A2 --> A1
    end

    subgraph UI_LAYER["Presentation & Reviewer Portal (Swiss Industrial Print)"]
        PORTAL["Reviewer Adjudication Portal\n(Next.js 15 RSC + Tailwind v4)"]
        RADAR["5-Axis Factor Radar Visualizer"]
        XAI_DIFF["XAI Token-Level Diff Matrix"]
        SIMULATOR["Procurement Savings Simulator"]
        DASH_DRIFT["Nodal Vigilance Dashboard"]
    end

    TOKENIZER -->|Anonymized Float32 Vectors| MTLS_GW
    MTLS_GW --> KAFKA
    KAFKA --> A1
    A1 -->|Green Tier: Auto-Sync| AGENT_4
    A1 -->|Yellow Tier: Human Review| PORTAL
    PORTAL -->|Adjudication Approval| AGENT_4
    PORTAL --- RADAR
    PORTAL --- XAI_DIFF
    CORE_AI --- SIMULATOR
    A5 --- DASH_DRIFT
```

---

## 3. Comprehensive Process Workflows

### 3.1 End-to-End Ingestion, Deduplication & Tri-Tier Resolution Workflow

```mermaid
flowchart TD
    START([Start: Material Ingestion Trigger]) --> INGEST_TYPE{Ingestion Source?}
    
    %% Branch 1: Live SAP Data
    INGEST_TYPE -->|Live SAP Record| EDGE_READ[Agent 6 reads raw SAP MARA/MAKT record]
    EDGE_READ --> PII_SCRUB[Presidio & Regex strip Vendor IDs, Plants, Prices]
    EDGE_READ --> EXTRACT_ATTR[Domain NER extracts Grade, Dimension, Pressure, Spec]
    PII_SCRUB --> VECTORIZE[BGE-large-en generates 1024-dim float vector]
    VECTORIZE --> DISPATCH_MTLS[Dispatch over mTLS 1.3 to Central Hub]

    %% Branch 2: Legacy Documents
    INGEST_TYPE -->|Scanned PDF / Blueprint| OCR_INP[Agent 2 Ingests PDF / Image]
    OCR_INP --> LAYOUT_LM[LayoutLMv3 identifies Spec Tables & Title Blocks]
    LAYOUT_LM --> TESSERACT[Tesseract 5.0 executes OCR]
    TESSERACT --> SPELL_CHECK[Industrial Dictionary corrects technical tokens]
    SPELL_CHECK --> CONF_CHECK{OCR Confidence >= 85%?}
    CONF_CHECK -->|No| MANUAL_OCR_CROP[Route crop to Reviewer for visual validation]
    CONF_CHECK -->|Yes| VECTORIZE

    %% Central Matching
    DISPATCH_MTLS --> QDRANT_SEARCH[Agent 1 queries Qdrant HNSW Index for Top-10]
    MANUAL_OCR_CROP --> QDRANT_SEARCH
    QDRANT_SEARCH --> CALC_COSINE[Compute Vector Cosine Similarity S_vec]
    CALC_COSINE --> CALC_ATTR[Evaluate Structured Attribute Overlap S_attr]
    
    CALC_ATTR --> HARD_BLOCK{Material Grade or Pressure Class Conflict?}
    HARD_BLOCK -->|Yes: Conflict Detected| FORCE_RED[Force Confidence S_final < 0.70]
    HARD_BLOCK -->|No: Valid Pair| COMPUTE_FINAL[Compute Unified Score: S_final = 0.45*S_vec + 0.55*S_attr]
    
    FORCE_RED --> TRI_TIER_GATE
    COMPUTE_FINAL --> TRI_TIER_GATE{Tri-Tier Confidence Evaluation}

    %% Tri-Tier Branches
    TRI_TIER_GATE -->|S_final >= 0.95| TIER_GREEN[GREEN TIER: Autonomous Auto-Approval]
    TRI_TIER_GATE -->|0.70 <= S_final < 0.95| TIER_YELLOW[YELLOW TIER: Human-in-the-Loop Triage]
    TRI_TIER_GATE -->|S_final < 0.70| TIER_RED[RED TIER: Novel Material Code Generation]

    %% Execution
    TIER_GREEN --> AUTO_MAP[Map to existing National Code CNM-XXXXXX-XXX]
    AUTO_MAP --> COMMIT_LEDGER[Append entry to SHA-256 Cryptographic Ledger]
    COMMIT_LEDGER --> TRIGGER_SAP_SYNC[Trigger Agent 4 SAP Reconciliation]

    TIER_YELLOW --> ENQUEUE_QUEUE[Enqueue into Reviewer Portal Queue]
    ENQUEUE_QUEUE --> RENDER_XAI[Generate 5-Axis Radar & XAI Diff Matrix]

    TIER_RED --> GEN_NAT_CODE[Generate New Common National Code]
    GEN_NAT_CODE --> COMMIT_LEDGER
```

---

### 3.2 Green Tier Autonomous SAP Reconciliation Sequence

```mermaid
sequenceDiagram
    autonumber
    participant A1 as Agent 1 (Engine)
    participant A4 as Agent 4 (SAP Connector)
    participant Queue as Redis Transaction Queue
    participant SAP as CPSE SAP S/4HANA (MM)
    participant Ledger as SHA-256 Audit Ledger

    A1->>A4: Dispatch Approved Green Match (Legacy Code + National Code)
    A4->>A4: Generate Idempotent Transaction UUID
    A4->>Queue: Enqueue Job with UUID & Payload
    A4->>SAP: Execute PyRFC BAPI Call (BAPI_MATERIAL_SAVEDATA)
    
    alt SAP Update Success (HTTP 200 / BAPI Return S)
        SAP-->>A4: Return Transaction Acknowledgment & Doc Number
        A4->>Queue: Mark Transaction 'COMPLETED'
        A4->>Ledger: Commit Cryptographic SHA-256 Audit Log
    else Transient Network Drop / 503 Timeout
        SAP-->>A4: Network Timeout
        A4->>A4: Exponential Backoff (2^n * 500ms, Max 5 Retries)
        A4->>SAP: Retry PyRFC Call with Identical UUID
    else SAP Business Fault (Line-Item Locked / Schema Validation Error)
        SAP-->>A4: Return Business Fault Code (E-Type Message)
        A4->>Queue: Move to Dead Letter Queue (DLQ)
        A4->>A4: Trigger Alert to Local SAP System Administrator
    end
```

---

### 3.3 Yellow Tier Human-in-the-Loop Reviewer Workflow

```mermaid
flowchart TD
    A[Yellow Tier Item Enqueued] --> B[Domain Reviewer opens Adjudication Queue]
    B --> C[Render Side-by-Side Dual Doppelrand Panels]
    C --> D[Plot 5-Axis Radar Chart & XAI Token Diff Table]
    
    D --> E{Reviewer Decision Action}
    
    E -->|Keyboard [ENTER]| F[APPROVE & MAP]
    E -->|Keyboard [ESC]| G[REJECT AS DUPLICATE]
    E -->|Keyboard [M]| H[MODIFY ATTRIBUTES]
    
    F --> I[Update PostgreSQL Mapping to 'MANUAL_APPROVED']
    I --> J[Append SHA-256 Ledger Entry with Reviewer ID & Timestamp]
    J --> K[Trigger Agent 4 SAP MM Sync]
    
    G --> L[Mark Candidate Unmatched]
    L --> M[Initiate New National Material Code Creation]
    
    H --> N[Open Inline Attribute Editor Modal]
    N --> O[Reviewer adjusts Grade / Dimension / Standard]
    O --> P[Re-compute Confidence Score]
    P --> C
```

---

### 3.4 Continuous Live ERP Drift & Security Monitoring Workflow

```mermaid
flowchart TD
    CRON([Cron Trigger: Hourly Execution]) --> A5[Agent 5 Delta Scanner Wakes Up]
    A5 --> READ_ERP[Query live SAP MM MAKT & MARA tables via RFC]
    A5 --> READ_HUB[Query approved PostgreSQL Master Registry baseline]
    
    READ_ERP & READ_HUB --> COMP_DIFF[Execute Attribute & Text Diff Comparison]
    COMP_DIFF --> HAS_DIFF{Is Diff Detected?}
    
    HAS_DIFF -->|No: System Stable| AUDIT_LEDGER[Verify SHA-256 Hash Chain Integrity]
    AUDIT_LEDGER --> SUCCESS_LOG([Log Clean Hourly Audit State])
    
    HAS_DIFF -->|Yes: Drift Found| EVAL_SEV{Evaluate Drift Severity}
    
    EVAL_SEV -->|Level 1: Punctuation/Casing| AUTO_UPDATE[Auto-update hub text with audit log]
    EVAL_SEV -->|Level 2: Tolerance / UoM Altered| FLAG_REVIEW[Suspend mapping & re-route to Reviewer Queue]
    EVAL_SEV -->|Level 3: Material Grade Mismatch / Deleted Code| SECURITY_BREACH[TRIGGER HIGH-SEVERITY SECURITY ALERT]
    
    SECURITY_BREACH --> ALERT_CVO[Dispatch Alert to Chief Vigilance Officer Dashboard]
    SECURITY_BREACH --> AUTO_REVERT[Queue Agent 4 to enforce approved Hub state back to SAP]
```

---

### 3.5 Strategic Sourcing & Procurement Savings Simulator Workflow

```mermaid
flowchart TD
    START_SIM([User / Scheduled Sourcing Simulation]) --> GATHER[Agent 3 queries deduplicated National Code Registry]
    GATHER --> AGG_VOL[Aggregate Procurement Quantities across CPCL, IOCL, ONGC, SAIL]
    GATHER --> AGG_PRICES[Collect Historical Unit Purchase Rates]
    
    AGG_PRICES --> CALC_PDI[Calculate Price Dispersion Index: PDI = P_max - P_min / P_median]
    AGG_VOL --> CALC_DISCOUNT[Model Econometric Bulk Discount Target Rate Curve]
    
    CALC_PDI & CALC_DISCOUNT --> SIM_SAVINGS[Compute Projected Annual Financial Savings in Rs Crore]
    
    SIM_SAVINGS --> CHECK_MSE{Validate Public Procurement Policy for MSEs Order 2012}
    CHECK_MSE -->|MSE Quotas Verified| SLICE_LOTS[Model Sliced Tender Lots: 25% MSE, 4% SC/ST, 3% Women]
    
    SLICE_LOTS --> LOCAL_LLM[Prompt Local Llama-3-8B-Instruct on vLLM]
    LOCAL_LLM --> SYNTH_SUMMARY[Generate Natural-Language Executive Briefing]
    SYNTH_SUMMARY --> DISPATCH_REPORTS[Export Automated Sourcing Briefing to MoPNG & CPCL Board]
```

---

### Document Authorization & Sign-Off

| Prepared By | Target Organization |
| :--- | :--- |
| **ONMC Engineering & Core Architecture**<br>Digital Public Infrastructure | **Ministry of Petroleum & Natural Gas (MoPNG)**<br>Chennai Petroleum Corporation Limited (CPCL) |
