import { readFile } from "node:fs/promises";
import { verifyOnMirror } from "@sh/oracle-core/network";
try {
  const evidence = JSON.parse(
    await readFile(process.argv[2] || "runtime/evidence.json", "utf8"),
  );
  if (evidence.network !== "testnet")
    throw new Error("Only testnet evidence is supported.");
  console.log(
    JSON.stringify(
      await verifyOnMirror(
        evidence.receipt,
        evidence.topic,
        evidence.sequence,
        evidence.payer,
      ),
      null,
      2,
    ),
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
