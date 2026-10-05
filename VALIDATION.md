# Release validation

Validation date: 2026-10-03; published-template recheck: 2026-10-04 (UTC)

Validated source: release candidate based on public commit `1c34da2`, with the dependency and documentation changes described below.

## Executed checks

| Check | Result | Evidence |
| --- | --- | --- |
| Core/network tests | PASS | 26/26 passed with Node's test runner |
| Solidity tests | PASS | 8/8 passed on Hardhat's in-process local chain |
| ESLint and TypeScript | PASS | `npm run lint` exited 0 |
| Production build | PASS | Next.js compiled, typechecked and generated 4 routes |
| Production dependency audit | PASS | `npm audit --omit=dev` reported 0 vulnerabilities after separating the local HCS SDK from the web runtime and overriding vulnerable protobuf/grpc releases |
| Local home page | PASS | `GET http://127.0.0.1:3178/` returned HTTP 200 and contained `Oracle Receipt Lab` |
| Live mainnet observation | PASS | `GET /api/observe` returned HTTP 200 with `schema=oracle-receipt/1`, `chainId=295`, an eligible round and a SHA-256 digest |
| Live HCS anchor/readback | PASS | Topic `0.0.10865105`, sequence `1`, payer `0.0.10865085`; exact receipt bytes and digest matched the public Mirror Node |

## Official scaffold gate (separate result)

The release-directory checks above are not the official external-template gate. On 2026-10-03, a new project was separately generated with `npm create scaffold-hbar@latest official-scaffold-verify-20261003 -- --template dohyun1828/hedera-oracle-receipts ...` from the public GitHub repository.

- Scaffold creation and dependency installation: PASS.
- Tests from the unmodified scaffold: PASS, 26 core/network plus 8 Hardhat tests.
- Lint from the unmodified scaffold: FAIL, because root ESLint could not resolve `typescript` when npm kept it under the Next.js workspace.
- Local fix: add `typescript: 5.9.3` to the root devDependencies. After installation, lint, TypeScript and production build pass.

Published commit `83220e1` was then scaffolded again from the public GitHub repository on 2026-10-04. Fresh dependency installation, all 34 tests, lint, TypeScript, production build, local app boot, the home route and a live read-only `/api/observe` request all passed. The observation returned `oracle-receipt/1` on chain 295 with a 64-character digest.

The first production-build attempt in the isolated release workspace failed because its temporary `node_modules` junction pointed outside Turbopack's filesystem root. The same source then built successfully against the original real dependency tree. This was an environment packaging issue, not an application-code failure.

The full development-tool audit still reports 35 transitive findings (23 high, 1 moderate, 11 low), primarily in Hardhat and the Hedera SDK's unused React Native toolchain. No critical finding remains. These tools are not installed by a production-only web deployment, but they remain a maintenance item for local HCS/contract development.

## Claims boundary

These results demonstrate local correctness checks and a live read-only oracle capture. They do not demonstrate sales, revenue, market demand, uptime, a competition submission, award receipt or a successful HCS transaction.
