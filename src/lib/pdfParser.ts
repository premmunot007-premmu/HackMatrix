import { ClauseCategory, Policy, PolicyClause, TreatmentKey } from '../types/insurance';
import { RD } from '../data/defaultData';

export interface ExtractedPdfResult {
  fileName: string;
  totalPages: number;
  extractedTextByPage: { pageNumber: number; text: string }[];
  detectedPolicy: Partial<Policy>;
  detectedClauses: PolicyClause[];
  detectedGaps: string[];
}

/**
 * Extract plain text page by page from an uploaded PDF File using pdfjs-dist in the browser.
 */
export const parsePdfDocument = async (file: File): Promise<ExtractedPdfResult> => {
  const arrayBuffer = await file.arrayBuffer();

  // Dynamic import of pdfjs-dist
  const pdfjsLib = await import('pdfjs-dist');
  
  // Set up worker source
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;

  const extractedTextByPage: { pageNumber: number; text: string }[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str || '')
      .join(' ');
    extractedTextByPage.push({ pageNumber: pageNum, text: pageText });
  }

  // Scan extracted text for insurance terms
  const fullTextLower = extractedTextByPage.map((p) => p.text.toLowerCase()).join(' ');

  // 1. Detect Sum Insured
  let detectedSi = 500000;
  const siMatch = fullTextLower.match(/(?:sum\s*insured|si|sum\s*assured)[^\d]{1,20}(?:rs\.?|inr|₹)?\s*([\d,]+)/i);
  if (siMatch && siMatch[1]) {
    const parsed = parseInt(siMatch[1].replace(/,/g, ''), 10);
    if (parsed >= 50000 && parsed <= 5000000) {
      detectedSi = parsed;
    }
  }

  // 2. Detect Co-Pay
  let detectedCopay = 10;
  const copayMatch = fullTextLower.match(/(?:co-?pay|co-?payment)[^\d]{1,15}(\d{1,2})\s*%/i);
  if (copayMatch && copayMatch[1]) {
    detectedCopay = parseInt(copayMatch[1], 10);
  }

  // 3. Detect Deductible
  let detectedDed = 0;
  const dedMatch = fullTextLower.match(/deductible[^\d]{1,20}(?:rs\.?|inr|₹)?\s*([\d,]+)/i);
  if (dedMatch && dedMatch[1]) {
    const parsed = parseInt(dedMatch[1].replace(/,/g, ''), 10);
    if (parsed > 0) detectedDed = parsed;
  }

  // 4. Detect Room Rent
  let detectedRent = 5000;
  const rentMatch = fullTextLower.match(/room\s*rent[^\d]{1,30}(?:rs\.?|inr|₹)?\s*([\d,]+)/i);
  if (rentMatch && rentMatch[1]) {
    const parsed = parseInt(rentMatch[1].replace(/,/g, ''), 10);
    if (parsed > 500 && parsed <= 25000) detectedRent = parsed;
  } else if (/1\s*%\s*of\s*sum\s*insured/i.test(fullTextLower)) {
    detectedRent = Math.round(detectedSi * 0.01);
  }

  // 5. Detect Waiting Periods
  let initialWait = 30;
  let pedWait = 36;
  if (/48\s*months/i.test(fullTextLower) && /pre-?existing/i.test(fullTextLower)) {
    pedWait = 48;
  } else if (/24\s*months/i.test(fullTextLower) && /pre-?existing/i.test(fullTextLower)) {
    pedWait = 24;
  }

  // 6. Detect Exclusions
  const detectedExcl: TreatmentKey[] = [];
  if (/maternity|pregnancy/i.test(fullTextLower) && /exclusion|not\s*covered/i.test(fullTextLower)) {
    detectedExcl.push('maternity');
  }
  if (/dialysis/i.test(fullTextLower) && /exclusion|not\s*covered/i.test(fullTextLower)) {
    detectedExcl.push('dialysis');
  }

  // 7. Extract specific page-level clauses
  const detectedClauses: PolicyClause[] = [];
  const detectedGaps: string[] = [];

  const findClauseInPages = (
    category: ClauseCategory,
    keywords: string[],
    sectionName: string,
    defaultQuote: string,
    defaultPage: number
  ) => {
    let matchedPage = defaultPage;
    let matchedQuote = defaultQuote;

    for (const pageItem of extractedTextByPage) {
      const pText = pageItem.text.toLowerCase();
      if (keywords.every((kw) => pText.includes(kw))) {
        matchedPage = pageItem.pageNumber;
        // Grab surrounding snippet
        const idx = pText.indexOf(keywords[0]);
        const snippet = pageItem.text.substring(Math.max(0, idx - 40), Math.min(pageItem.text.length, idx + 140));
        if (snippet.length > 20) {
          matchedQuote = snippet.trim();
        }
        break;
      }
    }

    detectedClauses.push({
      id: `U${detectedClauses.length + 1}`,
      cat: category,
      pg: Math.min(matchedPage, totalPages || 1),
      sec: sectionName,
      q: matchedQuote,
      rule: RD[category]
    });
  };

  findClauseInPages(
    'SumInsured',
    ['sum', 'insured'],
    'Schedule of Benefits',
    `The Sum Insured under this policy is ₹${detectedSi.toLocaleString('en-IN')} per policy year.`,
    1
  );

  findClauseInPages(
    'Waiting',
    ['waiting', 'initial'],
    'Initial Waiting Period',
    `An initial waiting period of ${initialWait} days applies to all illnesses except accidental hospitalisation.`,
    Math.min(2, totalPages)
  );

  findClauseInPages(
    'Waiting',
    ['pre-existing'],
    'Pre-existing Disease Waiting',
    `Pre-existing diseases (PED) are eligible for coverage after ${pedWait} months of continuous coverage.`,
    Math.min(3, totalPages)
  );

  findClauseInPages(
    'CoPay',
    ['co-pay'],
    'Co-payment Terms',
    `A co-payment of ${detectedCopay}% applies to all admissible claim payments.`,
    Math.min(3, totalPages)
  );

  findClauseInPages(
    'Room',
    ['room', 'rent'],
    'Room Rent Limitation',
    `Room rent is capped at ₹${detectedRent.toLocaleString('en-IN')} per day. Proportionate deduction applies to other treatment charges if limit is exceeded.`,
    Math.min(4, totalPages)
  );

  findClauseInPages(
    'Exclusion',
    ['exclusion'],
    'Permanent Exclusions',
    'Cosmetic treatments, non-prescribed therapies, and specified exclusions are permanently non-payable.',
    Math.min(5, totalPages)
  );

  findClauseInPages(
    'Claims',
    ['document'],
    'Claim Documentation Requirements',
    'Submit claim form, original hospital bills, discharge card, investigation reports, and KYC within 15 days of discharge.',
    Math.min(6, totalPages)
  );

  // Check for gaps
  if (!fullTextLower.includes('ambulance')) {
    detectedGaps.push('Ambulance emergency transit limit not stated');
  }
  if (!fullTextLower.includes('icu')) {
    detectedGaps.push('ICU daily tariff limit or ceiling not explicitly stated');
  }

  const policyName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ') || 'Uploaded Policy';

  const detectedPolicy: Partial<Policy> = {
    name: policyName,
    si: detectedSi,
    copay: detectedCopay,
    ded: detectedDed,
    rent: detectedRent,
    init: initialWait,
    ped: pedWait,
    w: { cataract: 24, knee: 24, maternity: 24 },
    sub: { cataract: 35000, knee: 150000 },
    excl: detectedExcl.length > 0 ? detectedExcl : ['maternity'],
    gaps: detectedGaps,
    docs: [
      'Duly filled claim form',
      'Hospital discharge summary',
      'Original final bills & payment receipts',
      'Diagnostic reports & prescriptions',
      'Patient photo ID & KYC documents'
    ],
    cl: detectedClauses
  };

  return {
    fileName: file.name,
    totalPages,
    extractedTextByPage,
    detectedPolicy,
    detectedClauses,
    detectedGaps
  };
};
