import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluateQuoteCalibration, validateCalibrationRow } from './public-quote-calibration.mjs';

const row = (overrides = {}) => ({
  sample: 'holdout',
  month: '2026-10',
  deliveryDepthId: 'managed',
  employeeBandId: '11-50',
  sectorId: 'technology',
  quotedLowerUsd: 10000,
  quotedUpperUsd: 12000,
  contractedUsd: 11000,
  deliveredCostUsd: 6000,
  ...overrides,
});
const sample = () => [
  ...Array.from({ length: 12 }, () => row({ sample: 'calibration', month: '2026-09' })),
  ...Array.from({ length: 30 }, () => row()),
];

test('calibration metrics are reproducible and measure actual contract value, not the model inputs', () => {
  const r = evaluateQuoteCalibration(sample());
  assert.equal(r.publishable, true);
  assert.deepEqual(r.reasons, []);
  assert.equal(r.metrics.holdout.count, 30);
  assert.equal(r.metrics.holdout.medianAbsolutePercentageError, 0);
  assert.equal(r.metrics.holdout.intervalCoverage, 1);
  assert.equal(r.metrics.holdout.underquotedRate, 0);
  assert.equal(r.metrics.holdout.overquotedRate, 0);
  assert.equal(r.metrics.holdout.realizedGrossMargin, 0.4545);
  assert.equal(r.segments.deliveryDepthId.managed.adequatelySampled, true);
});

test('reject records that leak personal identifiers or contain malformed monetary inputs', () => {
  for (const invalid of [
    row({ email: 'nope@example.invalid' }),
    row({ company: 'never store identifiable SOWs in repo' }),
    row({ contractedUsd: 0 }),
    row({ contractedUsd: Infinity }),
    row({ quotedLowerUsd: 13000 }),
    row({ deliveredCostUsd: -1 }),
    row({ quotedUpperUsd: 0 }),
    row({ sample: 'training' }),
    row({ employeeBandId: 'huge' }),
    row({ month: '2026-13' }),
    null, [],
  ]) {
    assert.throws(() => validateCalibrationRow(invalid), /invalid_calibration_record/);
  }
});

test('small or non-chronological holdouts cannot qualify for price publication', () => {
  const short = evaluateQuoteCalibration(sample().slice(0, 20));
  assert.equal(short.publishable, false);
  assert.ok(short.reasons.includes('insufficient_holdout_sample'));
  const leak = sample().map((r) => r.sample === 'calibration' ? { ...r, month: '2026-11' } : r);
  const result = evaluateQuoteCalibration(leak);
  assert.equal(result.publishable, false);
  assert.ok(result.reasons.includes('holdout_is_not_chronologically_separate'));
});

test('strong out-of-range bias fails both price error and coverage gates', () => {
  const r = evaluateQuoteCalibration(sample().map((item) =>
    item.sample === 'holdout' ? { ...item, contractedUsd: 24000 } : item
  ));
  assert.equal(r.publishable, false);
  assert.equal(r.metrics.holdout.intervalCoverage, 0);
  assert.equal(r.metrics.holdout.underquotedRate, 1);
  assert.ok(r.reasons.includes('median_error_above_gate'));
  assert.ok(r.reasons.includes('interval_coverage_below_gate'));
});

test('imbalanced segment coverage blocks publication even when aggregate errors look excellent', () => {
  const data = sample().map((r, i) => i === 41 ? { ...r, sectorId: 'healthcare' } : r);
  const result = evaluateQuoteCalibration(data);
  assert.equal(result.publishable, false);
  assert.ok(result.reasons.includes('underpowered_segments'));
  assert.ok(result.underpoweredSegments.includes('sectorId:healthcare'));
});

test('bad inputs and invented metric thresholds fail closed', () => {
  for (const value of [null, {}, [], [null]]) {
    assert.throws(() => evaluateQuoteCalibration(value), /invalid_calibration_(input|record)/);
  }
  assert.throws(() => evaluateQuoteCalibration(sample(), { minHoldout: 0 }), /invalid_calibration_input/);
  assert.throws(() => evaluateQuoteCalibration(sample(), { minSegment: -1 }), /invalid_calibration_input/);
  assert.throws(() => evaluateQuoteCalibration(sample(), { minHoldoutCoverage: 1.2 }), /invalid_calibration_input/);
});


test('legal two-decimal currency is accepted without floating-point multiplication drift', () => {
  const valid = row({
    quotedLowerUsd: 0.29,
    quotedUpperUsd: 0.58,
    contractedUsd: 0.29,
    deliveredCostUsd: 0.01,
  });
  assert.equal(validateCalibrationRow(valid), valid);
  for (const value of [0.291, 0.0000000001, 10.001, NaN, Infinity]) {
    assert.throws(() => validateCalibrationRow(row({ deliveredCostUsd: value })),
      /invalid_calibration_record/);
  }
});

test('median-error publication guard uses unrounded ratios at the gate', () => {
  const data = sample().map((r) => r.sample === 'holdout'
    ? { ...r, contractedUsd: 13750.69 } : r);
  const result = evaluateQuoteCalibration(data, { minHoldoutCoverage: 0 });
  assert.equal(result.metrics.holdout.medianAbsolutePercentageError, 0.2);
  assert.equal(result.publishable, false);
  assert.ok(result.reasons.includes('median_error_above_gate'));
});

test('interval-coverage guard cannot pass by rounding 2/3 up to 0.6667', () => {
  const data = [
    row({ sample: 'calibration', month: '2026-09' }),
    row(),
    row(),
    row({ contractedUsd: 20000 }),
  ];
  const result = evaluateQuoteCalibration(data, {
    minHoldout: 3, minSegment: 1,
    minHoldoutCoverage: 0.66668, maxHoldoutMedianApe: 1,
  });
  assert.equal(result.metrics.holdout.intervalCoverage, 0.6667);
  assert.equal(result.publishable, false);
  assert.ok(result.reasons.includes('interval_coverage_below_gate'));
});
