import { KW, TN } from '../data/defaultData';
import { ClauseCategory, DatabaseState, QAEntry, TreatmentKey } from '../types/insurance';
import { formatINR } from './calculator';

export const filterClauses = (
  db: DatabaseState,
  policyKey: string,
  category: ClauseCategory,
  keywords?: string[]
) => {
  const policy = db.pol[policyKey];
  if (!policy) return [];
  return policy.cl.filter(
    (c) =>
      c.cat === category &&
      (!keywords || keywords.some((k) => c.q.toLowerCase().includes(k.toLowerCase())))
  );
};

export const answerPolicyQuestion = (
  query: string,
  policyKey: string,
  db: DatabaseState
): QAEntry => {
  const policy = db.pol[policyKey] || Object.values(db.pol)[0];
  const queryLower = query.toLowerCase();

  let answer = '';
  let evidenceIds: string[] = [];
  let conf: 'High' | 'Medium' | 'Low' = 'High';
  let changeFactors = '';
  let warning: string | undefined = undefined;

  // Check if a specific treatment keyword matches
  const matchedTreatment = (Object.keys(TN) as TreatmentKey[]).find((key) =>
    KW[key].some((keyword) => queryLower.includes(keyword))
  );

  if (matchedTreatment) {
    const isExcluded = policy.excl.includes(matchedTreatment);
    const waitingMonths = policy.w[matchedTreatment];
    const subLimit = policy.sub[matchedTreatment];
    const treatmentKeywords = KW[matchedTreatment];

    const exclusionClauses = filterClauses(db, policyKey, 'Exclusion', treatmentKeywords);
    const waitingClauses = waitingMonths
      ? filterClauses(db, policyKey, 'Waiting', treatmentKeywords)
      : filterClauses(db, policyKey, 'Waiting', ['initial']);
    const subLimitClauses = subLimit
      ? filterClauses(db, policyKey, 'SubLimit', treatmentKeywords)
      : [];

    evidenceIds = [
      ...exclusionClauses,
      ...waitingClauses,
      ...subLimitClauses
    ].map((c) => c.id);

    if (evidenceIds.length === 0) {
      evidenceIds = filterClauses(db, policyKey, 'Exclusion').map((c) => c.id);
    }

    if (isExcluded) {
      answer = `No. ${TN[matchedTreatment]} appears in the policy permanent exclusions, so it is not expected to be covered.`;
    } else {
      const waitText = waitingMonths
        ? `a ${waitingMonths}-month waiting period`
        : 'only the standard 30-day initial waiting period';
      const subText = subLimit ? `, a treatment sub-limit of ${formatINR(subLimit)}` : '';
      const copayText = `plus ${policy.copay}% co-pay`;
      const dedText = policy.ded > 0 ? ` and a ${formatINR(policy.ded)} deductible` : '';

      answer = `Likely yes, subject to policy conditions: ${waitText}${subText}, ${copayText}${dedText}. Note that claim approval is contingent on policy verification.`;
    }

    if (!waitingMonths && !subLimit && !isExcluded) {
      conf = 'Medium';
      warning = 'No treatment-specific clause was found in the policy schedule; this answer relies on standard general terms.';
    }

    changeFactors =
      'Pre-existing conditions, actual hospital tariff, room category chosen, and whether your policy tenure meets the required waiting period.';
  } else if (/icu|intensive\s*care/.test(queryLower)) {
    if (policyKey === 'A') {
      answer = `Under ${policy.name}, ICU room rent does not carry a daily sub-limit, but is admissible up to the annual Sum Insured of ${formatINR(policy.si)}.`;
      evidenceIds = filterClauses(db, policyKey, 'Room').map((c) => c.id);
    } else {
      answer = `Under ${policy.name}, ICU room-rent daily limit is not explicitly defined in the policy schedule. This represents an ambiguity flagged in policy readiness.`;
      conf = 'Medium';
      warning = 'ICU room-rent limit is omitted in seeded policy clauses.';
      evidenceIds = filterClauses(db, policyKey, 'Room').map((c) => c.id);
    }
    changeFactors = 'Hospital tariff schedules and TPA ICU package agreements.';
  } else if (/cashless|reimbursement|network/.test(queryLower)) {
    answer = `Cashless claim facility is available at insurer network hospitals upon 48-hour prior authorization for planned admissions, or within 24 hours for emergency admissions. At non-network hospitals, claim must be filed via reimbursement within 15 days of discharge with original bills.`;
    evidenceIds = filterClauses(db, policyKey, 'Claims').map((c) => c.id);
    changeFactors = 'Hospital network empannelment status at the time of admission.';
  } else if (/day\s*care/.test(queryLower)) {
    answer = `Day care treatments requiring less than 24 hours of hospitalisation due to advanced technological procedures (e.g. cataract surgery, dialysis, chemotherapy) are covered, subject to policy waiting periods and specific sub-limits.`;
    evidenceIds = filterClauses(db, policyKey, 'Waiting').map((c) => c.id);
    changeFactors = 'Specific procedure must be listed in the policy day care annexure.';
  } else if (/ambulance/.test(queryLower)) {
    answer = `Emergency road ambulance expenses are covered for transit to the nearest hospital, typically subject to standard limits (e.g., ₹2,000 per event) upon submission of official provider bills.`;
    evidenceIds = filterClauses(db, policyKey, 'Claims').map((c) => c.id);
    if (policy.gaps.some((g) => g.toLowerCase().includes('ambulance'))) {
      conf = 'Medium';
      warning = 'Ambulance limit not explicitly stated in this policy contract.';
    }
  } else if (/wait/.test(queryLower)) {
    const specificWaits = Object.entries(policy.w)
      .map(([k, v]) => `${TN[k as TreatmentKey]}: ${v} months`)
      .join(', ');
    answer = `Initial waiting period: ${policy.init} days. Specific treatments: ${
      specificWaits || 'none specified'
    }. Pre-existing diseases (PED): ${policy.ped} months.`;
    evidenceIds = filterClauses(db, policyKey, 'Waiting').map((c) => c.id);
    changeFactors = 'Continuous renewal history without break, and medical declaration accuracy.';
  } else if (/room|private/.test(queryLower)) {
    answer = `Daily room rent is capped at ${formatINR(
      policy.rent
    )} per day. A single private room at prevailing private hospital tariffs may exceed this threshold, triggering proportionate deduction across associated medical charges.`;
    evidenceIds = filterClauses(db, policyKey, 'Room').map((c) => c.id);
    conf = 'Medium';
    changeFactors = 'Hospital room tariff sheet, ICU limit exceptions, and hospital tier/city.';
  } else if (/document|claim/.test(queryLower)) {
    answer = `Required claim documentation: ${policy.docs.join(', ')}.`;
    evidenceIds = filterClauses(db, policyKey, 'Claims').map((c) => c.id);
    changeFactors = 'TPA (Third Party Administrator) may mandate additional diagnostic reports or indoor case papers.';
  } else if (/exclu/.test(queryLower)) {
    const excludedNames = policy.excl.map((k) => TN[k]).join(', ');
    answer = `Explicitly excluded treatments: ${excludedNames || 'none listed'}, plus standard exclusions such as cosmetic procedures. Refer to the policy wording for full annexures.`;
    evidenceIds = filterClauses(db, policyKey, 'Exclusion').map((c) => c.id);
    conf = 'Medium';
    changeFactors = 'Exclusions may carry conditional exceptions in subsequent riders or annexures.';
  } else if (/co-?pay/.test(queryLower)) {
    answer = `A mandatory co-payment of ${policy.copay}% applies to all admissible claim amounts.`;
    evidenceIds = filterClauses(db, policyKey, 'CoPay').map((c) => c.id);
    changeFactors = 'Zone-based or age-based co-pay riders if opted.';
  } else if (/deduct/.test(queryLower)) {
    answer =
      policy.ded > 0
        ? `A deductible of ${formatINR(policy.ded)} applies per claim before insurer liability begins.`
        : 'Zero deductible applies under this policy; cover starts from rupee one of admissible expenses.';
    evidenceIds = filterClauses(db, policyKey, 'Deductible').map((c) => c.id);
  } else if (/sum insured|amount|limit|coverage/.test(queryLower)) {
    answer = `The annual Sum Insured is ${formatINR(policy.si)} per policy period.`;
    evidenceIds = filterClauses(db, policyKey, 'SumInsured').map((c) => c.id);
  } else {
    const words = queryLower.split(/\W+/).filter((w) => w.length > 4);
    const matchingClauses = policy.cl.filter((c) =>
      words.some((w) => (c.q + ' ' + c.sec).toLowerCase().includes(w))
    );

    if (matchingClauses.length > 0) {
      answer = 'These are the closest matching clauses identified in the policy wording; please review the verbatim clauses below.';
      evidenceIds = matchingClauses.slice(0, 3).map((c) => c.id);
      conf = 'Low';
    } else {
      answer =
        'I could not find a verified clause addressing this specific query in the policy schedule. We recommend reviewing the full policy contract or consulting your TPA.';
      conf = 'Low';
      warning = 'Unsupported question in seeded policy contract.';
    }
    changeFactors = 'Any specific policy rider, endorsement, or updated schedule.';
  }

  if (policy.gaps.length > 0 && conf !== 'Low' && /wait|pre-exist/.test(queryLower)) {
    warning = policy.gaps.join('; ');
  }

  return {
    id: 'qa_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    q: query,
    a: answer,
    ev: evidenceIds,
    conf,
    chg: changeFactors,
    warn: warning,
    pol: policy.name,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
};
