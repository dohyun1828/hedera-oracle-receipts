# Oracle Receipt Lab 1.0.0 release candidate

## Included

- Next.js dashboard for live HBAR/USD receipt capture and evidence verification
- Canonical JSON receipt library with exact integer handling and SHA-256 digest
- Hedera testnet HCS anchoring CLI with dedicated-key workflow
- Public Mirror Node byte/sequence/payer verifier
- Solidity `RoundGuard` example and local Hardhat tests
- 34 automated tests, user guide, deployment checklist and submission handoff documentation

## Known limitations

- One live testnet HCS submit and exact Mirror Node readback are documented in `TESTNET-EVIDENCE.md`.
- Public Hashio and Mirror Node endpoints have no bundled availability guarantee.
- Only the fixed HBAR/USD feed and `oracle-receipt/1` schema are supported.
- The release is public MIT-licensed source. Commercial value should be offered as implementation, customization, deployment and support rather than exclusive source access.
- `npm audit --omit=dev` is clean. The full local development toolchain still has transitive high/moderate/low advisories in Hardhat and Hedera SDK subtrees; see `VALIDATION.md`.

## Release acceptance

The local release candidate passed all 34 automated tests, lint, TypeScript checking, production build, local page smoke testing and live read-only observation on 2026-10-03 UTC. See `VALIDATION.md` for the exact claim boundary.
