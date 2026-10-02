# Development guide

This template uses npm workspaces, Next.js App Router, a JavaScript core package and Hardhat 2 with CommonJS configuration.

Run npm test, npm run lint and npm run build from the root after changing behavior. Core tests use node:test and mocked network responses. Hardhat tests deploy only to the in-process local chain.

Keep source chain 295 and HCS testnet roles explicit. Preserve decimal strings, strict schema parsing and byte-level mirror verification. Public routes must remain read-only and must never access HEDERA_PRIVATE_KEY. Testnet signing belongs in scripts/anchor.mjs. Never add .env or runtime credentials to version control.

Changes to the receipt schema must update canonical serialization, tests, documentation and consumers together. Avoid silently changing the meaning of an already anchored record. Real testnet evidence must come from an actual transaction and successful mirror readback, never a fixture.

The implementation was created with Codex assistance. AI-assisted changes should state their scope and include executed validation results in the contribution description. Review dependency, RPC and SDK changes against current primary documentation.
