# Signal87 Duplicate Detector Overlay

An open, modular, security-sensitive duplicate detection capability designed for classified and mixed-domain repositories where **source data remains in place**.

## What this provides

- **Non-intrusive overlay:** Integrates with SharePoint, Oracle, IBM, and legacy DMS systems without migrating content.
- **No-copy architecture:** Stores pointers, hashes, embeddings, feature vectors, and policy metadata only.
- **Near-duplicate detection at scale:** Identifies exact and semantic duplicates (including light rewrites).
- **Cross-level operation:** Supports Secret and Top Secret enclaves with strict origination control and controlled movement gates.
- **Multimodal processing:** Text, tables, embedded images, standalone imagery, and binary/financial artifacts.
- **Temporal awareness:** Tracks revisions over time and preserves lineage when documents drift.
- **Guardrails + intelligence scoring:** Applies deterministic policy checks around non-deterministic ML outputs.
- **Full auditability:** Immutable, queryable action logs for every classification-sensitive operation.

## Reference architecture

### 1) In-place connectors (read-only where required)

Connectors run close to data to avoid extraction and movement:

- SharePoint connector
- Oracle connector
- IBM/FileNet connector
- Generic DMS connector

Each connector emits:

- Repository pointer (URI, object key, version ID)
- Metadata envelope (classification, originator controls, domain)
- Content-derived signatures

### 2) Multimodal feature pipeline

- **Text:** language detection, tokenization, sentence embeddings, shingles/MinHash.
- **Tables:** structure-aware extraction (row/column topology + cell embeddings).
- **Embedded images + imagery:** OCR + perceptual hash + vision embeddings.
- **Binary/financial artifacts:** format fingerprinting, schema profile, stable metadata vectors.

### 3) Detection engine

- Candidate generation using ANN/vector index + MinHash LSH.
- Reranking with transformer-based semantic similarity.
- Temporal matching using version lineage windows.
- Cluster graph builds canonical document + linked near-duplicates.

### 4) Guardrail and policy layer

- Deterministic policy engine evaluates:
  - Classification compatibility
  - Originator control restrictions
  - Allowed flow paths (e.g., Secret → Top Secret only via approved channels)
- If policy is ambiguous, actions are forced into human review.

### 5) Intelligence scoring

Composite score from:

- Similarity confidence
- Cross-modal corroboration
- Policy risk impact
- Provenance confidence
- Temporal consistency

### 6) Immutable auditing

Every action logs:

- Who/what initiated the event
- Which repositories and object pointers were touched
- Which model version and policy bundle were used
- Which decision path was taken (auto/human-in-loop)

## Deployment model

- Modular microservices (containerized)
- GPU inference pools for transformer and vision models
- Open standards for interoperability (OpenAPI/gRPC, OCI images, parquet-compatible telemetry)
- Pluggable vector databases / search indexes to avoid vendor lock-in

## UI

The dashboard includes a **Duplicate Detector** view that demonstrates:

- In-place, no-copy architecture messaging
- Cluster queue with confidence and intelligence scores
- Classification path visibility
- Multimodal findings
- Explicit audit-log posture

## Local run

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```
