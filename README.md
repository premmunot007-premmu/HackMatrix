# PolicyCare AI

**AI-Powered Insurance Coverage & Treatment Cost Intelligence**

> "Understand your policy. Estimate your treatment cost. Know what you may pay."

HackMatrix 5.0 | Problem Statement FIN-01: Policy-to-Patient: Insurance Coverage & Treatment Cost Intelligence

## Problem
Insurance policies are long and hard to read. Coverage rules, exclusions, waiting periods, deductibles, co-pays and limits are buried in dense clauses, so patients cannot tell what is covered and what they may pay before treatment.

## Solution
Upload a policy (PDF or image) and ask questions in plain language. PolicyCare AI uses OCR, embeddings and RAG to answer with exact page and section citations. Enter a treatment scenario to get an estimated cost, the potentially covered amount and the estimated out-of-pocket cost, along with a confidence level and a list of missing information instead of guesses.

## Features
- Policy upload and extraction of coverage, exclusions, waiting periods, deductibles, co-pays and limits
- Conversational Q&A with page and section evidence
- Treatment cost estimation using an ML/statistical model on synthetic data
- Coverage calculator with a factor-by-factor explanation
- Confidence level and missing-information checklist
- Before vs after view when missing details are added

## How It Works
1. **Policy Q&A:** Upload → OCR → Chunking + Embeddings → Vector DB → RAG → LLM → Answer + Evidence
2. **Cost estimate:** Treatment Scenario → Cost Dataset → ML Estimator → Coverage Rules → Coverage + Out-of-Pocket Estimate → Confidence + Explanation

## Tech Stack
Streamlit/React · Python + FastAPI · LLM API · LangChain/LlamaIndex · Sentence Transformers · FAISS/ChromaDB · Tesseract · scikit-learn/XGBoost

## Run Locally
```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
pip install -r requirements.txt
streamlit run app.py
```

## Disclaimer
This is a hackathon prototype. Results are "potentially covered" and "estimated out-of-pocket" amounts, not a guarantee of approval or reimbursement. All demo numbers use synthetic data.
