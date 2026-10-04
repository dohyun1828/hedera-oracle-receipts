# Oracle Receipt Lab

A Scaffold-HBAR template for engineers who need to retain the provenance of an oracle observation. It reads the Chainlink HBAR/USD proxy on Hedera mainnet at one pinned block, produces an exact JSON receipt, and anchors those bytes to a submit-key-protected Hedera testnet HCS topic. A separate verifier compares the receipt against the public mirror.

The web app is read-only. It has no wallet connection, signing endpoint or private-key input. Mainnet access consists only of public RPC reads. Signing is confined to the testnet CLI.

## Quick start

Requires Node 22.14+ and npm 10+. Internet access is needed for installation, the initial Solidity compiler download and live RPC/mirror reads.

    npm ci
    npm test
    npm run lint
    npm run build
    npm run dev

Open http://127.0.0.1:3000 and choose **Capture live observation**. No account or API key is needed for this part. The price, round, pinned block, observation time and SHA-256 digest appear together. Download the receipt if you want to retain it.

The observation endpoint reuses a result for up to 10 seconds and coalesces concurrent requests. A saved observation is explicitly historical, not a continuously updating ticker. Public Hashio is rate limited; this template is a development application, not a production feed SLA.

## Testnet recording

1. Create a dedicated test-only ECDSA key with the command below. It writes an ignored root .env file and prints only the public address. It refuses to overwrite an existing .env.

       node scripts/prepare-testnet.mjs

2. Request test HBAR for the printed address at https://portal.hedera.com/faucet. Complete the faucet's verification. These tokens have no monetary value. The current public faucet offers 10 testnet HBAR per day; availability is controlled by the provider.
3. Resolve that address using the testnet Mirror Node account endpoint or HashScan, then put the resulting numeric account ID in HEDERA_ACCOUNT_ID in the root .env. The script has already written the DER private key. Do not reuse this key for mainnet or submit it through a website.
4. Run the following from the repository root:

       npm run capture
       npm run anchor -- --testnet
       npm run verify

The anchor command requires a receipt captured in the last five minutes and an eligible oracle round. It creates a new topic with the operator's public key as submit and admin key, without custom fees, and sends one canonical message of at most 1,024 bytes. Creation and submission each have a maximum transaction fee of 1 testnet HBAR. There is no mainnet switch.

The numeric topic and creation transaction are saved immediately to runtime/topic.json. A successful message receipt produces runtime/evidence.json with the topic, sequence, payer, transaction ID and exact captured observation. A later failure does not undo the topic creation. Before rerunning, inspect this file to avoid unnecessary topics. Topic data can expire or reset on testnet.

Mirror indexing can lag behind network confirmation. If verification returns HTTP 404 immediately after a successful transaction, wait briefly and rerun only the verify command. Do not resubmit just because the mirror has not indexed the message.

## Independent verification

Paste the entire runtime/evidence.json into the app's **Verify the receipt** panel, or run:

    npm run verify -- path/to/evidence.json

Verification requires a testnet pointer and compares the message's exact canonical bytes, sequence and payer. It displays the consensus timestamp and raw mirror link. A changed price, round or block hash fails comparison; matching a digest from an untrusted JSON file alone is insufficient.

A match proves only that those submitted bytes appear at that HCS sequence. It does not authenticate the accuracy of the reported oracle values, guarantee a market price, identify the real-world payer, or verify the mirror cryptographically. The capture process trusts public Hashio for Chainlink state, and the verifier trusts the chosen public mirror. The source and anchor networks are deliberately distinct and recorded as such. Hedera mainnet chain 295 is the oracle source; HCS writes use Hedera testnet.

The schema fixes the documented HBAR/USD proxy, stores integer answers and round IDs as strings, and uses a 24-hour freshness threshold. This conservative demo threshold is not suitable for every application. Adjusting policy requires a schema change and corresponding tests. Do not use the template to automate trading, collateral valuation or financial decisions.

## Workspace map

- packages/core: canonical receipt format, integer-safe formatting, freshness checks, pinned-block RPC reads and mirror comparison.
- packages/nextjs: dashboard plus read-only observation and verification endpoints.
- packages/hardhat: reusable Solidity RoundGuard and isolated local-chain tests using a mock feed. RoundGuard demonstrates the same eligibility gate for a Solidity consumer; the HCS CLI does not require this contract to be deployed.
- scripts: local capture, testnet setup, HCS anchor and independent verification.

The tests cover precision above JavaScript's safe integer range, stale/future/incomplete rounds, unexpected fields, source chain and feed identity, pinned-block consistency, upstream failures, altered receipts, wrong sequence/payer and unsupported chunking. Mock results are not represented as live testnet evidence.

## Scaffold-HBAR integration

Create a fresh application directly from the public template:

    npm create scaffold-hbar@latest my-oracle-receipts -- --template dohyun1828/hedera-oracle-receipts --frontend nextjs-app --solidity-framework hardhat --network testnet --package-manager npm --skip-hedera-skills --yes

The scaffolder also requires Git user.name and user.email to be configured. On Windows, run the command in Command Prompt if the PowerShell npm shim drops options after the double dash.

The root template.json constrains the scaffold to Next.js, Hardhat and npm. All workspace paths are explicit so CLI framework filtering preserves the core library. After publishing the repository, use the external-template option of create-scaffold-hbar with its owner/repository identifier. Include --skip-hedera-skills if you do not want the scaffolder to install additional skills.

An AGENTS.md documents the development workflow and AI assistance. No Hedera Harness recipe is claimed or included.

## Validation status

On 2026-10-02 the 26 core/network tests and 8 local Solidity tests passed. Lint, TypeScript checks and production build passed. A clean copy generated by the official CLI passed installation, lint, build and all 34 tests. The public repository was separately fetched through the CLI's external-template option. Live mainnet RPC capture and the dashboard capture flow were exercised.

Live HCS anchoring and mirror readback are still pending testnet faucet verification. There is no completed competition submission or prize claim represented by this repository. Do not treat the mocked mirror tests as a real transaction.

## Release kit

- `USER-GUIDE.md`: operator-focused setup, capture, anchoring and verification instructions.
- `DEPLOYMENT.md`: production deployment checklist and operating boundaries.
- `VALIDATION.md`: dated validation evidence for this release candidate.
- `RELEASE-NOTES.md`: packaged release contents, known limitations and acceptance criteria.
- `SUBMISSION-CHECKLIST.md`: completed bounty fields, remaining evidence, and actions that still require user approval.

## Sources and attribution

- [Scaffold-HBAR competition brief](https://hedera.com/blog/scaffold-hbar-template-bounty/)
- [External template processing](https://github.com/hedera-dev/create-scaffold-hbar/blob/main/contributors/TEMPLATES.md)
- [Chainlink feed addresses](https://docs.chain.link/data-feeds/price-feeds/addresses?network=hedera&page=1): HBAR/USD proxy 0xAF685FB45C12b92b5054ccb9313e135525F9b5d5, checked 2026-10-02.
- [Hedera public RPC connections](https://docs.hedera.com/evm/tutorials/intermediate/json-rpc-connections)
- [HCS message submission](https://docs.hedera.com/native/consensus/submit-message)

This implementation was developed with OpenAI Codex assistance. It is original application code built on the dependencies listed in package.json, under their respective licenses. No customer results, paid engagements, testnet submissions or awards are implied by the sample interface.

MIT license. Copyright 2026 Dohyun Lee.
