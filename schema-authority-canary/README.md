# Contract IR admission canary

`main.tsp` and `authored.schema.json` are independently maintained peer authorities for this isolated CI fixture. Neither is generated from, ranked below, or permitted to overwrite the other.

The workflow generates JSON Schema B only as comparison evidence, requires declaration and behavioral parity, emits the deterministic receipt and parity-approved Contract IR, verifies their digest-bound admission contract, and retains all evidence.

A green fixture proves this repository can run the fail-closed gate. It does not migrate or certify the existing Canonical production schema catalog; real declarations remain unadmitted until independently authored in both lanes and explicitly mapped into the parity process.
