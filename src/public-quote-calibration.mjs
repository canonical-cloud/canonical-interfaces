// Offline diagnostics for an eventual reviewed quote-pricing v3 contract.
// No customer records, price coefficients, or inferred rates belong in this module.
const keys = Object.freeze([
  'sample', 'month', 'deliveryDepthId', 'employeeBandId', 'sectorId',
  'quotedLowerUsd', 'quotedUpperUsd', 'contractedUsd', 'deliveredCostUsd',
]);
const sampleKinds = new Set(['calibration', 'holdout']);
const depths = new Set(['advisory', 'managed', 'remediation']);
const bands = new Set(['1-10', '11-50', '51-200', '201-1000', '1001-plus']);
const sectors = new Set([
  'technology', 'professional-services', 'financial-services', 'healthcare',
  'retail', 'public-sector', 'other',
]);
const boundedCurrency = (x) => typeof x === 'number' && Number.isFinite(x) &&
  x >= 0 && x <= 1_000_000_000 && Math.round(x * 100) === x * 100;
const round = (n) => Math.round(n * 10000) / 10000;
const ratio = (numerator, denominator) => round(numerator / denominator);
const percentile = (ordered, q) => ordered[Math.max(0, Math.ceil(q * ordered.length) - 1)];
const median = (ordered) => {
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle] :
    (ordered[middle - 1] + ordered[middle]) / 2;
};

export function validateCalibrationRow(row) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) throw Error('invalid_calibration_record');
  if (Object.keys(row).length !== keys.length ||
      Object.keys(row).some((key) => !keys.includes(key))) {
    // Forbid names, emails, account IDs, free-text notes, or other data columns.
    throw Error('invalid_calibration_record');
  }
  if (!sampleKinds.has(row.sample) || !/^20\d{2}-(0[1-9]|1[0-2])$/.test(row.month) ||
      !depths.has(row.deliveryDepthId) || !bands.has(row.employeeBandId) ||
      !sectors.has(row.sectorId)) throw Error('invalid_calibration_record');
  for (const key of ['quotedLowerUsd', 'quotedUpperUsd', 'contractedUsd', 'deliveredCostUsd']) {
    if (!boundedCurrency(row[key])) throw Error('invalid_calibration_record');
  }
  if (row.quotedLowerUsd <= 0 || row.quotedUpperUsd < row.quotedLowerUsd ||
      row.contractedUsd <= 0) throw Error('invalid_calibration_record');
  return row;
}

const metrics = (rows) => {
  if (!rows.length) return null;
  const errors = rows.map((r) =>
    Math.abs((r.quotedLowerUsd + r.quotedUpperUsd) / 2 - r.contractedUsd) / r.contractedUsd
  ).sort((a, b) => a - b);
  const contractedTotal = rows.reduce((sum, row) => sum + row.contractedUsd, 0);
  const deliveryCostTotal = rows.reduce((sum, row) => sum + row.deliveredCostUsd, 0);
  return {
    count: rows.length,
    medianAbsolutePercentageError: round(median(errors)),
    p90AbsolutePercentageError: round(percentile(errors, 0.9)),
    intervalCoverage: ratio(
      rows.filter((r) => r.contractedUsd >= r.quotedLowerUsd &&
        r.contractedUsd <= r.quotedUpperUsd).length, rows.length,
    ),
    underquotedRate: ratio(rows.filter((r) => r.contractedUsd > r.quotedUpperUsd).length, rows.length),
    overquotedRate: ratio(rows.filter((r) => r.contractedUsd < r.quotedLowerUsd).length, rows.length),
    realizedGrossMargin: ratio(contractedTotal - deliveryCostTotal, contractedTotal),
  };
};

export function evaluateQuoteCalibration(rows, {
  minHoldout = 30,
  minSegment = 10,
  maxHoldoutMedianApe = 0.2,
  minHoldoutCoverage = 0.7,
} = {}) {
  if (!Array.isArray(rows) || rows.length === 0 ||
      !Number.isInteger(minHoldout) || minHoldout < 1 ||
      !Number.isInteger(minSegment) || minSegment < 1 ||
      !(maxHoldoutMedianApe >= 0 && maxHoldoutMedianApe <= 1) ||
      !(minHoldoutCoverage >= 0 && minHoldoutCoverage <= 1)) throw Error('invalid_calibration_input');
  rows.forEach(validateCalibrationRow);
  const calibration = rows.filter((row) => row.sample === 'calibration');
  const holdout = rows.filter((row) => row.sample === 'holdout');
  // Require a chronological validation period, so older closed deals cannot
  // be used as a disguised holdout selected after fitting coefficients.
  const latestCalibration = calibration.map((r) => r.month).sort().at(-1);
  const earliestHoldout = holdout.map((r) => r.month).sort()[0];
  const chronological = !!latestCalibration && !!earliestHoldout &&
    latestCalibration < earliestHoldout;
  const segments = {};
  for (const dimension of ['deliveryDepthId', 'employeeBandId', 'sectorId']) {
    segments[dimension] = Object.fromEntries(
      [...new Set(holdout.map((row) => row[dimension]))].sort().map((value) => {
        const cohort = holdout.filter((row) => row[dimension] === value);
        return [value, { ...metrics(cohort), adequatelySampled: cohort.length >= minSegment }];
      }),
    );
  }
  const overall = metrics(holdout);
  const underpoweredSegments = Object.entries(segments)
    .flatMap(([dimension, entries]) => Object.entries(entries)
      .filter(([, outcome]) => !outcome.adequatelySampled)
      .map(([value]) => `${dimension}:${value}`));
  const reasons = [];
  if (!calibration.length) reasons.push('missing_calibration_set');
  if (holdout.length < minHoldout) reasons.push('insufficient_holdout_sample');
  if (!chronological) reasons.push('holdout_is_not_chronologically_separate');
  if (underpoweredSegments.length) reasons.push('underpowered_segments');
  if (overall?.medianAbsolutePercentageError > maxHoldoutMedianApe) reasons.push('median_error_above_gate');
  if ((overall?.intervalCoverage ?? 0) < minHoldoutCoverage) reasons.push('interval_coverage_below_gate');
  return {
    publishable: reasons.length === 0,
    reasons,
    metrics: { calibration: metrics(calibration), holdout: overall },
    segments,
    underpoweredSegments,
  };
}
