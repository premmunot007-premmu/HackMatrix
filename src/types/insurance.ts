export type TreatmentKey = 'cataract' | 'knee' | 'appendix' | 'maternity' | 'dialysis';

export type CityKey = 'Pune' | 'Mumbai' | 'Nashik' | 'Nagpur';

export type HospitalKey = 'Government' | 'Mid-range private' | 'Premium private';

export type RoomKey = 'General ward' | 'Shared room' | 'Single private room';

export type ClauseCategory = 
  | 'SumInsured' 
  | 'Waiting' 
  | 'CoPay' 
  | 'Deductible' 
  | 'Room' 
  | 'SubLimit' 
  | 'Exclusion' 
  | 'Claims';

export interface PolicyClause {
  id: string;
  cat: ClauseCategory;
  pg: number;
  sec: string;
  q: string;
  rule: string;
}

export interface Policy {
  name: string;
  si: number;
  copay: number;
  ded: number;
  rent: number;
  init: number;
  ped: number;
  w: Partial<Record<TreatmentKey, number>>;
  sub: Partial<Record<TreatmentKey, number>>;
  excl: TreatmentKey[];
  gaps: string[];
  docs: string[];
  cl: PolicyClause[];
}

export interface CostData {
  proc: Record<TreatmentKey, [cost: number, days: number]>;
  city: Record<CityKey, number>;
  hosp: Record<HospitalKey, number>;
  room: Record<RoomKey, number>;
}

export interface EstimatorParams {
  t: TreatmentKey;
  city: CityKey;
  h: HospitalKey;
  room: RoomKey;
  pol: string;
  start: string;
  ped: boolean;
}

export interface DeductionBreakdown {
  waiting: number;
  copay: number;
  ded: number;
  rent: number;
  sub: number;
  excl: number;
  beyond: number;
}

export interface CalculationResult {
  C: number;
  ins: number;
  oop: number;
  y: DeductionBreakdown;
  st: string[];
  conf: 'High' | 'Medium' | 'Low';
  mo: number;
  need: number;
  p: Policy;
  o: EstimatorParams;
  rangeLow: number;
  rangeHigh: number;
  roomRate: number;
}

export interface QAEntry {
  id: string;
  q: string;
  a: string;
  ev: string[];
  conf: 'High' | 'Medium' | 'Low';
  chg: string;
  warn?: string;
  pol: string;
  timestamp: string;
}

export interface SavedAnalysis {
  id: number;
  name: string;
  e: EstimatorParams;
  ins: number;
  oop: number;
  total: number;
  at: string;
}

export interface DatabaseState {
  pol: Record<string, Policy>;
  cost: CostData;
}
