# Deployment checklist

## Supported shape

Deploy `packages/nextjs` as a Node.js Next.js application with the repository root available as the npm workspace root. The two public routes are read-only:

- `GET /api/observe` reads Hedera mainnet through public Hashio RPC.
- `POST /api/verify` reads Hedera testnet Mirror Node evidence.

The web process must not receive `HEDERA_PRIVATE_KEY` or `HEDERA_ACCOUNT_ID`. Testnet signing belongs only in the local `scripts/anchor.mjs` operator workflow. The Hedera SDK is therefore a root development dependency and is not part of the production web dependency set.

## Pre-deployment gate

1. Use Node 22.14+ and run `npm ci` at repository root.
2. Run `npm test`, `npm run lint` and `npm run build`.
3. Confirm that `.env`, `runtime/`, `.next/`, `cache/`, `artifacts/` and `node_modules/` are not in the upload artifact.
4. Start the built app and confirm `/` returns 200.
5. Confirm `/api/observe` returns a receipt or the documented 502 fallback when the public RPC is unavailable.
6. Do not advertise a completed HCS transaction until a real testnet submit and Mirror Node readback have both succeeded.

## Operating notes

- The app uses public infrastructure without an SLA. Add an approved RPC provider and monitoring before promising availability to customers.
- The in-memory ten-second observation cache is per process. Multi-instance deployments can make independent observations.
- The verification endpoint limits request bodies to 8 KiB and accepts testnet pointers only.
- There is no database, authentication, wallet connection, analytics or secret management in this release.

## Acceptance test

The release is acceptable when all automated checks pass, the home page returns 200, and a live read-only observation returns a schema-valid receipt. A separate HCS acceptance milestone requires `runtime/evidence.json`, a successful `npm run verify` result and a public Mirror Node or HashScan link for the same topic/sequence.
