import assert from "node:assert/strict";
import test from "node:test";

import { build, collectEnums, pascal } from "./generate.mjs";

test("wire literals become portable PascalCase symbols without changing their values", () => {
  assert.equal(pascal("user.canonical.plus"), "UserCanonicalPlus");
  assert.equal(pascal("org.canonical.plus"), "OrgCanonicalPlus");
  assert.equal(pascal("pci_dss_4"), "PciDss4");
  assert.equal(pascal("4xx-error"), "Value4xxError");
  assert.throws(() => pascal("..."), /portable identifier/);
});

test("generated Rust keeps exact host wire values and emits valid enum variants", () => {
  const rust = build()["rust/src/lib.rs"];
  assert.equal(typeof rust, "string");
  assert.match(
    rust,
    /#\[serde\(rename = "user\.canonical\.plus"\)\]\n\s+UserCanonicalPlus,/,
  );
  assert.match(
    rust,
    /#\[serde\(rename = "org\.canonical\.plus"\)\]\n\s+OrgCanonicalPlus,/,
  );
  assert.doesNotMatch(rust, /\b(?:User|Org)\.canonical\.plus\b/);
});

test("enum symbol collisions fail before any language adapter is emitted", () => {
  const collidingTypes = [
    {
      name: "CollisionProbe",
      source: "enum-symbols.test.mjs",
      props: [
        {
          name: "status",
          schema: {
            type: "string",
            enum: ["foo-bar", "foo_bar"],
          },
        },
      ],
    },
  ];

  assert.throws(
    () => collectEnums(collidingTypes),
    /both map to portable enum symbol "FooBar"/,
  );
});
