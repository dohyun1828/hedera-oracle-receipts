# Scaffold-HBAR bounty submission checklist

Deadline: 2026-10-04 23:59 ET (2026-10-05 12:59 KST)

This file is a draft only. Nothing has been submitted.

## Ready

- Project: Oracle Receipt Lab
- Public repository: `https://github.com/dohyun1828/hedera-oracle-receipts`
- License: MIT
- Stack: npm workspaces, Next.js, Hardhat, Node 22+
- AI disclosure: developed with Codex assistance; scope and validation are documented in `AGENTS.md` and `VALIDATION.md`
- Local source validation: 26 core/network tests and 8 Solidity tests pass; lint, TypeScript and production build pass
- Official external-template retest: public commit `1c34da2` exposed a root TypeScript resolution failure. Published fix commit `83220e1` was scaffolded again from GitHub on 2026-10-04; clean installation, all 34 tests, lint, TypeScript, production build, app boot and core read-only routes passed.
- Live testnet evidence: topic `0.0.10865105`, sequence `1`, payer `0.0.10865085`, transaction `0.0.10865085@1791164496.187795078`; exact receipt bytes and SHA-256 matched the public Mirror Node.

## Draft description

Oracle Receipt Lab is a reusable Next.js and Hardhat template for retaining the provenance of Chainlink HBAR/USD observations on Hedera. It pins all feed reads to one mainnet block, preserves integer precision, checks round freshness and produces canonical JSON receipts. A local testnet-only CLI anchors each receipt to HCS, while the app and CLI compare exact bytes, sequence and payer against the public Mirror Node.

## Still required before eligibility

1. Inspect the actual Google submission form and confirm every required field, including whether it requests a mainnet account. Its later-page fields were not directly inspected in this run.
2. Review the separate Hedera registration page's mandatory information/marketing consent before accepting it. The public registration page currently displays that consent, but it should not be assumed to be a field in the Google submission form.
3. Submit the form with the repository and the verified public Mirror Node message link before the deadline.

The existing dedicated ECDSA testnet key was reused on 2026-10-05; no new key was generated in that run. The key remains only in the ignored local `.env` and is not included in evidence or source control. The faucet funded its public EVM address with 10 test HBAR, the Mirror Node resolved account `0.0.10865085`, and `TESTNET-EVIDENCE.md` records the successful HCS transaction and readback. No final registration or competition submission has been sent.

## Do not claim yet

- completed registration or submission
- eligibility, judging acceptance, award, revenue or deposit
- production RPC availability or an SLA
