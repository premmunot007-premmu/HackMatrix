import { TN } from '../data/defaultData';
import {
  CalculationResult,
  DatabaseState,
  EstimatorParams,
  Policy
} from '../types/insurance';

export const formatINR = (n: number): string => {
  return '₹' + Math.round(n).toLocaleString('en-IN');
};

export const monthsAgoDate = (months: number): string => {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
};

export const calculateRoomRate = (
  params: EstimatorParams,
  db: DatabaseState
): number => {
  const roomTariff = db.cost.room[params.room] || 0;
  const hospMult = db.cost.hosp[params.h] || 1;
  const cityMult = db.cost.city[params.city] || 1;
  return roomTariff * hospMult * cityMult;
};

export const calculateCover = (
  params: EstimatorParams,
  db: DatabaseState,
  costMultiplier: number = 1
): CalculationResult => {
  const policy: Policy = db.pol[params.pol] || Object.values(db.pol)[0];
  const [procCost, stayDays] = db.cost.proc[params.t] || [50000, 2];
  const cityMult = db.cost.city[params.city] || 1;
  const hospMult = db.cost.hosp[params.h] || 1;
  const roomRate = calculateRoomRate(params, db);

  const totalCost = (procCost * cityMult * hospMult + stayDays * roomRate) * costMultiplier;

  let eligible = totalCost;
  const deductions = {
    waiting: 0,
    copay: 0,
    ded: 0,
    rent: 0,
    sub: 0,
    excl: 0,
    beyond: 0
  };

  const steps: string[] = [
    `Estimated treatment cost: ${formatINR(totalCost)} (${TN[params.t]}, ${params.city}, ${params.h}, ${params.room}).`
  ];

  // 1. Exclusion Check
  if (policy.excl.includes(params.t)) {
    deductions.excl = eligible;
    eligible = 0;
    steps.push(
      `Exclusion: ${TN[params.t]} is listed as an excluded treatment under ${policy.name}, so ₹0 is payable by insurer (${formatINR(deductions.excl)} out-of-pocket).`
    );
  } else {
    steps.push(`Exclusion check: ${TN[params.t]} is not in the policy exclusion schedule.`);
  }

  // 2. Waiting Period Check
  const startDate = new Date(params.start).getTime();
  const daysElapsed = Math.max(0, (Date.now() - startDate) / (1000 * 60 * 60 * 24));
  const monthsElapsed = daysElapsed / 30.44;
  const monthsNeeded = Math.max(
    params.ped ? policy.ped : 0,
    policy.w[params.t] || 0
  );

  if (eligible > 0 && (monthsElapsed < monthsNeeded || daysElapsed < policy.init)) {
    deductions.waiting = eligible;
    eligible = 0;
    steps.push(
      `Waiting period: ${monthsElapsed.toFixed(1)} months elapsed, but ${
        monthsElapsed < monthsNeeded ? monthsNeeded + ' months' : policy.init + ' days initial wait'
      } required; claim is not yet payable.`
    );
  } else {
    steps.push(
      `Waiting period: satisfied (${monthsElapsed.toFixed(1)} months elapsed, ${monthsNeeded} months required).`
    );
  }

  // 3. Treatment Sub-limit Check
  const subLimit = policy.sub[params.t];
  if (subLimit && eligible > subLimit) {
    deductions.sub = eligible - subLimit;
    eligible = subLimit;
    steps.push(`Sub-limit: capped at ${formatINR(subLimit)} for this treatment.`);
  } else {
    steps.push(
      subLimit
        ? `Sub-limit ${formatINR(subLimit)} not exceeded.`
        : 'No specific treatment sub-limit applies.'
    );
  }

  // 4. Room Rent Limit & Proportionate Deduction Check
  if (eligible > 0 && roomRate > policy.rent) {
    const factor = policy.rent / roomRate;
    deductions.rent = eligible * (1 - factor);
    eligible *= factor;
    steps.push(
      `Room rent proportionate deduction: Selected room tariff is ${formatINR(
        roomRate
      )}/day, exceeding policy limit of ${formatINR(
        policy.rent
      )}/day. Eligible admissible amount is reduced proportionately by factor ${(factor).toFixed(2)}.`
    );
  } else {
    steps.push(
      `Room rent check: Selected room rate of ${formatINR(
        roomRate
      )}/day is within the ${formatINR(policy.rent)}/day limit, or no amount is payable.`
    );
  }

  // 5. Deductible Check
  deductions.ded = Math.min(policy.ded, eligible);
  eligible -= deductions.ded;
  steps.push(
    policy.ded > 0
      ? `Deductible: ${formatINR(deductions.ded)} borne by you first.`
      : 'Deductible: none applies under this policy.'
  );

  // 6. Co-payment Check
  deductions.copay = (eligible * policy.copay) / 100;
  eligible -= deductions.copay;
  steps.push(
    `Co-pay: ${policy.copay}% co-payment = ${formatINR(deductions.copay)} borne by you.`
  );

  // 7. Sum Insured Cap Check
  if (eligible > policy.si) {
    deductions.beyond = eligible - policy.si;
    eligible = policy.si;
    steps.push(
      `Sum Insured: eligible claim exceeds policy sum insured of ${formatINR(
        policy.si
      )}; capped at sum insured.`
    );
  } else {
    steps.push(`Sum Insured of ${formatINR(policy.si)} is not exceeded.`);
  }

  // Confidence Rating
  let conf: 'High' | 'Medium' | 'Low' =
    params.ped && params.pol === 'B'
      ? 'Low'
      : params.ped || deductions.rent > 0 || subLimit || Math.abs(monthsElapsed - monthsNeeded) < 3
      ? 'Medium'
      : 'High';

  if ((deductions.excl > 0 || deductions.waiting > 0) && conf === 'High') {
    conf = 'Medium';
  }

  const insurerPays = eligible;
  const outOfPocket = totalCost - eligible;

  steps.push(
    `Insurer contribution ≈ ${formatINR(insurerPays)}; your estimated out-of-pocket ≈ ${formatINR(
      outOfPocket
    )}.`
  );

  const rangeLow = calculateCostOnly(params, db, 0.8);
  const rangeHigh = calculateCostOnly(params, db, 1.3);

  return {
    C: totalCost,
    ins: insurerPays,
    oop: outOfPocket,
    y: deductions,
    st: steps,
    conf,
    mo: monthsElapsed,
    need: monthsNeeded,
    p: policy,
    o: params,
    rangeLow,
    rangeHigh,
    roomRate
  };
};

export const calculateCostOnly = (
  params: EstimatorParams,
  db: DatabaseState,
  multiplier: number = 1
): number => {
  const [procCost, stayDays] = db.cost.proc[params.t] || [50000, 2];
  const cityMult = db.cost.city[params.city] || 1;
  const hospMult = db.cost.hosp[params.h] || 1;
  const roomRate = calculateRoomRate(params, db);
  return (procCost * cityMult * hospMult + stayDays * roomRate) * multiplier;
};

export const calculatePolicyReadiness = (policy: Policy): number => {
  return Math.max(0, 100 - policy.gaps.length * 15);
};
