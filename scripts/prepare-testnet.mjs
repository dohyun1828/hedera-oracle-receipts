import { PrivateKey } from "@hashgraph/sdk";
import { writeFile } from "node:fs/promises";
const key = PrivateKey.generateECDSA();
const address = "0x" + key.publicKey.toEvmAddress();
await writeFile(
  ".env",
  "HEDERA_ACCOUNT_ID=\nHEDERA_PRIVATE_KEY=" + key.toStringDer() + "\n",
  { flag: "wx", mode: 0o600 },
);
console.log(
  JSON.stringify(
    {
      network: "testnet-only",
      evmAddress: address,
      credentials: "Stored in ignored .env; never reuse for mainnet.",
    },
    null,
    2,
  ),
);
