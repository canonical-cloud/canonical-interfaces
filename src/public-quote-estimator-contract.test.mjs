import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const fixtureUrl = new URL(
  "../contracts/public-quote-estimator/v1/instances/PublicQuoteEstimatorConfig/valid/current.json",
  import.meta.url,
);
const config = JSON.parse(await readFile(fixtureUrl, "utf8"));

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const roundTo = (value) => Math.round(value / config.roundToUsd) * config.roundToUsd;
const quote = ({ speed, standards, depth, complexity }) => {
  const rawMidpoint =
    speed.baseUsd +
    standards.reduce((sum, standard) => sum + standard.amountUsd, 0) +
    depth.amountUsd +
    complexity.amountUsd;
  const midpoint = clamp(rawMidpoint, config.midpointFloorUsd, config.midpointCeilingUsd);
  const lower = clamp(
    roundTo(midpoint * config.lowerFactor),
    config.estimateFloorUsd,
    config.estimateCeilingUsd,
  );
  const upper = clamp(
    roundTo(midpoint * config.upperFactor),
    lower,
    config.estimateCeilingUsd,
  );
  return { midpoint, lower, upper };
};

const standardSubsets = () => {
  const subsets = [];
  for (let mask = 1; mask < 1 << config.standards.length; mask += 1) {
    subsets.push(config.standards.filter((_, index) => (mask & (1 << index)) !== 0));
  }
  return subsets;
};

test("public quote estimator fixture is the reviewed v1 schedule", () => {
  assert.equal(config.schemaVersion, 1);
  assert.equal(config.currency, "USD");
  assert.deepEqual(config.speeds.map(({ weeks, baseUsd }) => [weeks, baseUsd]), [
    [9, 5000],
    [5, 7500],
    [3, 10500],
  ]);
  assert.deepEqual(config.standards.map(({ id, amountUsd }) => [id, amountUsd]), [
    ["soc2", 0],
    ["iso27001", 750],
    ["nist", 500],
    ["gdpr", 750],
    ["hipaa", 1000],
    ["pci", 1000],
    ["fedramp", 1750],
    ["cis", 350],
  ]);
  assert.deepEqual(config.deliveryDepths.map(({ id, amountUsd }) => [id, amountUsd]), [
    ["advisory", 0],
    ["managed", 1500],
    ["remediation", 3000],
  ]);
  assert.deepEqual(config.complexities.map(({ id, amountUsd }) => [id, amountUsd]), [
    ["focused", 0],
    ["growing", 1000],
    ["complex", 2000],
  ]);
  assert.deepEqual(config.defaults, {
    speedWeeks: 5,
    standardIds: ["soc2", "iso27001"],
    deliveryDepthId: "managed",
    complexityId: "growing",
  });
});

test("default public quote remains 9500-12000", () => {
  const speed = config.speeds.find(({ weeks }) => weeks === config.defaults.speedWeeks);
  const standards = config.defaults.standardIds.map((id) =>
    config.standards.find((standard) => standard.id === id),
  );
  const depth = config.deliveryDepths.find(({ id }) => id === config.defaults.deliveryDepthId);
  const complexity = config.complexities.find(({ id }) => id === config.defaults.complexityId);
  assert.ok(speed && depth && complexity && standards.every(Boolean));
  assert.deepEqual(quote({ speed, standards, depth, complexity }), {
    midpoint: 10750,
    lower: 9500,
    upper: 12000,
  });
});

test("every non-empty v1 pricing combination stays ordered and bounded", () => {
  const subsets = standardSubsets();
  let checked = 0;
  for (const speed of config.speeds) {
    for (const standards of subsets) {
      for (const depth of config.deliveryDepths) {
        for (const complexity of config.complexities) {
          const estimate = quote({ speed, standards, depth, complexity });
          assert.ok(estimate.midpoint >= config.midpointFloorUsd);
          assert.ok(estimate.midpoint <= config.midpointCeilingUsd);
          assert.ok(estimate.lower >= config.estimateFloorUsd);
          assert.ok(estimate.upper <= config.estimateCeilingUsd);
          assert.ok(estimate.lower <= estimate.upper);
          checked += 1;
        }
      }
    }
  }
  assert.equal(checked, 6885);
});

test("faster delivery, deeper service, and greater complexity cannot reduce a v1 estimate", () => {
  const subsets = standardSubsets();
  const speeds = config.speeds;
  for (let index = 1; index < speeds.length; index += 1) {
    assert.ok(speeds[index].weeks < speeds[index - 1].weeks);
    assert.ok(speeds[index].baseUsd >= speeds[index - 1].baseUsd);
  }
  for (const collection of [config.deliveryDepths, config.complexities]) {
    for (let index = 1; index < collection.length; index += 1) {
      assert.ok(collection[index].amountUsd >= collection[index - 1].amountUsd);
    }
  }

  for (const standards of subsets) {
    for (const depth of config.deliveryDepths) {
      for (const complexity of config.complexities) {
        const estimates = speeds.map((speed) => quote({ speed, standards, depth, complexity }));
        for (let index = 1; index < estimates.length; index += 1) {
          assert.ok(estimates[index].midpoint >= estimates[index - 1].midpoint);
          assert.ok(estimates[index].lower >= estimates[index - 1].lower);
          assert.ok(estimates[index].upper >= estimates[index - 1].upper);
        }
      }
    }
  }
});
