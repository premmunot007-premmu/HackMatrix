import {
  ClauseCategory,
  CostData,
  DatabaseState,
  Policy,
  PolicyClause,
  TreatmentKey
} from '../types/insurance';

export const TN: Record<TreatmentKey, string> = {
  cataract: 'Cataract surgery',
  knee: 'Knee replacement',
  appendix: 'Appendix surgery',
  maternity: 'Maternity',
  dialysis: 'Dialysis'
};

export const KW: Record<TreatmentKey, string[]> = {
  cataract: ['cataract'],
  knee: ['knee', 'joint'],
  appendix: ['appendi'],
  maternity: ['maternity'],
  dialysis: ['dialysis']
};

export const RD: Record<ClauseCategory, string> = {
  SumInsured: 'Applies to all claims in the policy year.',
  Waiting: 'Applies from the policy start date.',
  CoPay: 'Applies to every admissible claim.',
  Deductible: 'Applies per claim before the insurer pays.',
  Room: 'Applies when the room rent exceeds the daily limit.',
  SubLimit: 'Applies to the named treatment only.',
  Exclusion: 'Applies to named treatments; no cover.',
  Claims: 'Applies at claim submission.'
};

const mk = (p: string, rows: [ClauseCategory, number, string, string][]): PolicyClause[] =>
  rows.map((r, i) => ({
    id: p + (i + 1),
    cat: r[0],
    pg: r[1],
    sec: r[2],
    q: r[3],
    rule: RD[r[0]]
  }));

export const DEFAULT_POLICIES: Record<string, Policy> = {
  A: {
    name: 'SecureHealth Plus',
    si: 500000,
    copay: 10,
    ded: 0,
    rent: 5000,
    init: 30,
    ped: 36,
    w: { cataract: 24, knee: 24 },
    sub: { cataract: 40000 },
    excl: ['maternity'],
    gaps: ['Ambulance limit not stated'],
    docs: [
      'Claim form',
      'Discharge summary',
      'Original bills',
      'Investigation reports',
      'ID proof (within 15 days of discharge)'
    ],
    cl: mk('A', [
      ['SumInsured', 4, 'Schedule of Benefits', 'The Sum Insured is ₹5,00,000 per policy year on an individual basis.'],
      ['Waiting', 7, 'Waiting Periods', 'An initial waiting period of 30 days applies to all claims except accidents.'],
      ['Waiting', 7, 'Specified Disease Waiting', 'Cataract and knee joint replacement are covered only after 24 months of continuous cover.'],
      ['Waiting', 8, 'Pre-existing Diseases', 'Pre-existing conditions are covered after 36 months of continuous coverage.'],
      ['CoPay', 9, 'Co-payment', 'The insured shall bear 10% of every admissible claim.'],
      ['Deductible', 9, 'Deductible', 'No deductible applies under this policy.'],
      ['Room', 10, 'Room Rent Limit', 'Room rent is limited to 1% of Sum Insured per day (₹5,000). Proportionate deduction applies to other charges.'],
      ['SubLimit', 11, 'Sub-limits', 'Cataract surgery is limited to ₹40,000 per eye.'],
      ['Exclusion', 14, 'Permanent Exclusions', 'Maternity, infertility and cosmetic procedures are not covered.'],
      ['Claims', 18, 'Claim Documents', 'Submit claim form, discharge summary, original bills, investigation reports and ID proof within 15 days of discharge.']
    ])
  },
  B: {
    name: 'FamilyCare Essential',
    si: 300000,
    copay: 20,
    ded: 10000,
    rent: 3000,
    init: 30,
    ped: 48,
    w: { cataract: 36, knee: 36, maternity: 24 },
    sub: { cataract: 25000, knee: 150000, maternity: 50000 },
    excl: ['dialysis'],
    gaps: ['Pre-existing waiting wording is ambiguous', 'ICU room-rent limit not stated'],
    docs: [
      'Claim form',
      'Discharge card',
      'Hospital bills & receipts',
      'Doctor prescription',
      'KYC'
    ],
    cl: mk('B', [
      ['SumInsured', 3, 'Policy Schedule', 'Sum Insured: ₹3,00,000 per family floater per year.'],
      ['Waiting', 6, 'Initial Waiting', 'Claims within the first 30 days of the policy are not admissible, except accidents.'],
      ['Waiting', 6, 'Specified Disease Waiting', 'Cataract and joint replacement are payable after 36 months of continuous cover.'],
      ['Waiting', 7, 'Maternity Waiting', 'Maternity expenses are payable after 24 months of continuous cover.'],
      ['Waiting', 7, 'Pre-existing Conditions', 'Pre-existing conditions are covered after 48 months, subject to continuous renewal as defined in Annexure 2.'],
      ['CoPay', 8, 'Co-payment', 'A co-payment of 20% applies on all admissible claims.'],
      ['Deductible', 8, 'Deductible', 'A deductible of ₹10,000 applies per claim.'],
      ['Room', 9, 'Room Rent Limit', 'Room rent is limited to ₹3,000 per day; charges are reduced proportionately above this limit.'],
      ['SubLimit', 10, 'Treatment Sub-limits', 'Cataract ₹25,000; knee replacement ₹1,50,000; maternity ₹50,000 per event.'],
      ['Exclusion', 12, 'Exclusions', 'Dialysis for chronic renal failure and cosmetic procedures are excluded.'],
      ['Claims', 16, 'Claim Requirements', 'Documents: claim form, discharge card, hospital bills and receipts, doctor prescription and KYC.']
    ])
  }
};

export const DEFAULT_COST_DATA: CostData = {
  proc: {
    cataract: [45000, 1],
    knee: [260000, 4],
    appendix: [85000, 3],
    maternity: [90000, 3],
    dialysis: [36000, 1]
  },
  city: {
    Pune: 1,
    Mumbai: 1.2,
    Nashik: 0.85,
    Nagpur: 0.9
  },
  hosp: {
    Government: 0.35,
    'Mid-range private': 1,
    'Premium private': 1.7
  },
  room: {
    'General ward': 1500,
    'Shared room': 3500,
    'Single private room': 6500
  }
};

export const INITIAL_DATABASE: DatabaseState = {
  pol: DEFAULT_POLICIES,
  cost: DEFAULT_COST_DATA
};
