# Oracle Receipt Lab user guide

## What this product does

Oracle Receipt Lab captures one Chainlink HBAR/USD observation from Hedera mainnet at a pinned block. It preserves the integer values, provenance fields and SHA-256 digest in a deterministic JSON receipt. An optional CLI records those exact bytes to a submit-key-protected Hedera testnet HCS topic. The verifier reads the public Mirror Node and compares the exact bytes, sequence and payer.

It is a provenance demo and integration starter. It is not a trading oracle, price guarantee, wallet, custody product or financial recommendation.

## Requirements

- Node.js 22.14 or newer
- npm 10 or newer
- Internet access for dependency installation and public RPC/Mirror Node reads
- Only for the optional HCS step: a dedicated Hedera testnet account with test HBAR

Never use a mainnet private key. Never paste a private key into the web interface. The web app does not need or read `HEDERA_PRIVATE_KEY`.

## Install and validate

From the extracted release directory:

```text
npm ci
npm test
npm run lint
npm run build
```

All four commands should exit successfully before deployment.

## Run the dashboard

```text
npm run dev
```

Open `http://127.0.0.1:3000`. Select **Capture live observation**. The page shows the pinned block, round data, eligibility assessment, decimal display value and digest. Download the receipt to retain an immutable local copy.

The endpoint caches a result for up to ten seconds. A receipt is a historical observation, not a live ticker.

## Capture from the command line

```text
npm run capture
```

The command writes `runtime/receipt.json` and prints its digest and assessment. The `runtime` directory is ignored by Git.

## Optional testnet HCS recording

1. Run `node scripts/prepare-testnet.mjs` once. It creates an ignored `.env` with a dedicated test-only private key and prints the public address. It refuses to overwrite an existing `.env`.
2. Obtain test HBAR for that address through the official Hedera faucet and resolve its numeric `0.0.x` account ID.
3. Set `HEDERA_ACCOUNT_ID` in `.env`. Do not reuse a production or mainnet account.
4. Run:

```text
npm run capture
npm run anchor -- --testnet
npm run verify
```

`anchor` has no mainnet switch. It creates a testnet topic and submits one message. Inspect `runtime/topic.json` before retrying after any failure so that you do not create unnecessary topics. Mirror indexing can lag; after a confirmed submit, retry only `npm run verify` if the first read returns 404.

## Verify someone else's evidence

Use the dashboard's **Verify the receipt** panel, or:

```text
npm run verify -- path/to/evidence.json
```

A successful result proves that the same receipt bytes appear at the stated testnet topic sequence and that the Mirror Node reports the expected payer. It does not prove the economic truth of the price, identity of a real-world person or cryptographic correctness of the public Mirror Node.

## Troubleshooting

- `HTTP 429` or observation failure: the public Hashio RPC may be rate limited; wait and retry.
- Mirror `404` after a confirmed submit: wait for indexing, then rerun only verification.
- PowerShell drops scaffold CLI options: use Command Prompt for the scaffold command shown in `README.md`.
- `Evidence file is too large`: the web verifier intentionally rejects bodies above 8 KiB.
- Stale or incomplete round: do not anchor it; capture again later.

## Support handoff

When requesting implementation support, provide the Node/npm versions, failing command, complete non-secret error output and intended deployment platform. Remove `.env`, private keys and runtime evidence containing identifiers unless they are specifically required and approved for diagnosis.
