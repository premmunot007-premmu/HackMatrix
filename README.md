# 🛡️ CoverWise — AI Health Cover Intelligence & Out-of-Pocket Estimator

> **"Understand your health cover before you need it."**

CoverWise is a production-grade health insurance intelligence web application built with **Next.js 16 (App Router)**, **TypeScript 5**, **React 19**, and a custom **Vanilla CSS Design System**. It translates and elevates the single-file prototype (`coverwise.html`) into an end-to-end, presentation-ready solution directly addressing all requirements of the AI Insurance Policy Intelligence problem statement.

---

## 🚀 Key Features & Capabilities

### 1. 📑 In-Browser PDF Parsing & Clause Extraction (`Policy` Tab)
- **Client-Side PDF OCR Pipeline**: Powered by `pdfjs-dist` to parse uploaded health insurance PDFs directly inside the browser without third-party servers.
- **Automated Parameter Extraction**: Scans pages for Sum Insured, waiting periods (initial, specified, PED), room-rent limits, deductibles, co-pays, and exclusions.
- **Dynamic Policy Library**: Any uploaded PDF is instantly structured, cited with real page numbers, and registered into your active policy library.
- **8-Dimension Policy Breakdown**:
  - Annual Sum Insured (floater / individual)
  - Initial, Disease-Specific & Pre-Existing (PED) Waiting Periods
  - Patient Co-payment percentages
  - Per-claim Deductibles
  - Daily Room-Rent Limits (with proportionate deduction penalty warnings)
  - Key Exclusions (cataract, maternity, dialysis, cosmetic)
  - Treatment Sub-Limits
  - Mandatory Claim Documentation
- **Verbatim Evidence Inspection**: One-click modal to inspect cited policy text with page numbers, section headings, and applicability rules.
- **Ambiguity & Gap Detection**: Automatically flags missing clauses (e.g. unspecified ICU ceilings, ambiguous PED wording).

### 2. 💬 Evidence-Grounded Policy Q&A Assistant (`Q&A` Tab)
- **Plain-English Query Engine**: Ask questions such as *"Is cataract surgery covered?"*, *"What is my waiting period?"*, *"What is the ICU room limit?"*, or *"How does cashless claim work?"*.
- **Ground Truth Citations**: Every generated response includes:
  - Exact policy name and section citation
  - Page number reference
  - Confidence rating (`High` / `Medium` / `Low`)
  - Verbatim clause quote (`“...”`) and applicability condition
  - **"What could change this answer?"** transparency callouts.
- **Utility Controls**: One-click Copy Answer to Clipboard and Conversation Thread Clearing.

### 3. 🧮 Treatment Cost & Out-of-Pocket Estimator (`Estimator` Tab)
- **Live Financial Calculation**:
  - Base procedure tariff × City multiplier × Hospital tier multiplier
  - Daily room rate vs Policy room rent limit
- **Proportionate Room Rent Deduction (The #1 Surprise Bill Driver)**: Accurately computes proportionate reduction when selected room tariff exceeds the policy daily limit, scaling associated medical charges.
- **Itemized Hospital Bill & TPA Audit Breakdown**:
  - Room & Nursing tariff vs policy limit
  - Surgeon & Operation Theatre charges (scaled by excess room factor)
  - Diagnostics & Radiology (100% admissible within terms)
  - Pharmacy & Consumables
- **Sequential Deduction Waterfall**:
  1. Policy Exclusion check
  2. Waiting period satisfaction test (initial 30 days + specific disease duration + PED duration)
  3. Treatment sub-limit capping
  4. Proportionate room rent reduction factor
  5. Deductible absorption
  6. Co-payment calculation
  7. Sum Insured ceiling enforcement
- **Visual Analytics**:
  - Key metrics: Estimated Total Cost, Market Range (-20% to +30%), Annual Sum Insured, Insurer Contribution, and Patient Out-of-Pocket.
  - **Stacked Proportion Bar**: Animated visual breakdown of insurer share, co-pay, deductible, room-rent penalty, sub-limits, waiting period, and exclusions.
  - **Audit Log**: Numbered step-by-step mathematical reasoning trace.

### 4. 📄 Printable Official Claim Feasibility Assessment Report
- **Export / Print Feasibility Report**: One-click modal generating an official insurance audit report:
  - Unique Report ID and timestamp
  - Patient scenario & admission parameters
  - Itemized hospital bill audit with TPA deduction factors
  - Verbatim supporting policy clauses with page citations
  - Print-optimized CSS (`window.print()`) for saving directly to PDF or paper.

### 5. ⚖️ Sensitivity & What-If Engine (`What-if` Tab)
- **Dual View Mode**:
  1. **Scenario Explorer**: Side-by-side comparison across 4 presets (*Shared vs Private Room*, *6m vs 48m Tenure*, *Mid-Range vs Premium Hospital*, *Policy A vs Policy B*) with net delta rupee calculations (`+ ₹28,500`).
  2. **Policy Contract Comparison Matrix**: Direct side-by-side feature comparison table comparing Policy A vs Policy B terms, limits, sub-limits, waiting periods, room-rent rules, and readiness scores.

### 6. 📂 Saved Analyses & Policy Readiness (`Saved` Tab)
- **Policy Readiness Completeness Score**: Visual completion meter (0–100%) indicating how comprehensive policy wording is, with flagged gaps.
- **Bookmarked Snapshots**: View previously calculated estimates with date, parameters, and insurer vs user breakdown.
- **Management Tools**: Open in Estimator, Rename, or Delete.

### 7. ⚙️ Admin & Policy Ontology Editor (`Admin` Tab)
- **Clause Table Editor**: Directly edit category, page numbers, section headers, verbatim quotes, and applicability rules.
- **Synthetic Medical Cost Editor**: Configure procedure costs and hospital stay lengths.
- **City Cost Multipliers**: Adjust city indexes (Pune, Mumbai, Nashik, Nagpur).
- **Reset Seed Data**: Instant one-click restore to default baseline.

### 8. 🎨 Design Aesthetics & User Experience
- **Theme Switcher**: Dark Mode and Light Mode with custom color tokens.
- **Modern Typography & Glassmorphism**: Clean fonts (Plus Jakarta Sans), elevated cards, subtle borders, soft shadows, and glowing accent highlights.
- **Micro-Interactions**: Canvas confetti animations on bookmarking and policy verification.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5
- **UI Library**: React 19
- **PDF Parser**: `pdfjs-dist` (In-browser client-side extraction)
- **Delight & Animations**: `canvas-confetti`
- **Icons**: `lucide-react`
- **Styling**: Vanilla CSS with custom CSS variable design tokens
- **State & Storage**: React State Hooks + LocalStorage Persistence

---

## 🏃 Running the Application

### Development Server
```bash
npm.cmd run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm.cmd run build
npm.cmd run start
```
