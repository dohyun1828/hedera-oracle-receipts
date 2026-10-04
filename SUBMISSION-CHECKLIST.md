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
- Official external-template retest: scaffold creation and all 34 tests passed, but public commit `1c34da2` failed lint because root ESLint could not resolve the workspace-only TypeScript package. Adding `typescript: 5.9.3` to root devDependencies fixed lint and build locally. This release candidate includes the fix; the published commit must be scaffolded once more to close the remote gate.

## Draft description

Oracle Receipt Lab is a reusable Next.js and Hardhat template for retaining the provenance of Chainlink HBAR/USD observations on Hedera. It pins all feed reads to one mainnet block, preserves integer precision, checks round freshness and produces canonical JSON receipts. A local testnet-only CLI anchors each receipt to HCS, while the app and CLI compare exact bytes, sequence and payer against the public Mirror Node.

## Still required before eligibility

1. Publish this release candidate, then rerun the exact external-template command against the final remote commit.
2. Prepare a funded ECDSA testnet account through one user-controlled official path:
   - Hedera Portal faucet: the current anonymous official page displays a limit of 10 test HBAR per day. Determine at action time whether it requires CAPTCHA or another interactive verification. A 2026-10-02 screenshot records a CAPTCHA; no funding request was attempted in this validation.
   - HashPack alternative: Hedera's official account-creation guide documents creating an ECDSA Testnet account in HashPack with an initial 100 testHBAR. This is a documented alternative, not a flow tested in this project. The user must create and secure the wallet personally and must never share a password, recovery phrase, or private key.
3. Resolve the chosen funded account to its numeric testnet account ID and set only `HEDERA_ACCOUNT_ID` in the ignored `.env`. Do not disclose or replace a private key unless the account/key pairing has been deliberately reviewed by the user.
4. Run `npm run capture`, then `npm run anchor -- --testnet`, then `npm run verify`.
5. Confirm that `runtime/evidence.json` exists and that its HashScan/Mirror link points to the same topic, sequence and payer.
6. Inspect the actual Google submission form and confirm every required field, including whether it requests a mainnet account. Its current fields were not directly inspected in this run.
7. Review the separate Hedera registration page's mandatory information/marketing consent before accepting it. The public registration page currently displays that consent, but it should not be assumed to be a field in the Google submission form.
8. Submit the form with the repository and public transaction evidence before the deadline.

The current local state has a test-only private key, no numeric account ID, no topic/evidence file, and no submitted registration or competition entry. A read-only request to the testnet Mirror Node account endpoint for the recorded EVM address returned HTTP 404. This means that endpoint did not resolve an account record for that identifier at query time; it does not by itself prove why the account is absent, whether faucet CAPTCHA is currently shown, or whether another account-creation route would work. The HashPack path is documented at `https://docs.hedera.com/native/tutorials/getting-started/create-fund-account#option-3-hashpack-wallet`; no wallet creation, funding request, or transaction was attempted here.

## Do not claim yet

- successful live HCS anchoring or Mirror Node readback
- completed registration or submission
- eligibility, judging acceptance, award, revenue or deposit
- production RPC availability or an SLA
