import { createHash } from "node:crypto";
export const FEED = "0xaf685fb45c12b92b5054ccb9313e135525f9b5d5";
export const MAX_AGE = 86400;
const UINT = /^(0|[1-9][0-9]{0,77})$/;
const KEYS = [
  "schema",
  "chainId",
  "feed",
  "blockNumber",
  "blockHash",
  "observedAt",
  "roundId",
  "answer",
  "decimals",
  "startedAt",
  "updatedAt",
  "answeredInRound",
  "maxAgeSeconds",
];
export function normalizeReceipt(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Receipt must be an object.");
  if (
    Object.keys(input).length !== KEYS.length ||
    KEYS.some((k) => !(k in input))
  )
    throw new Error("Unexpected receipt fields.");
  if (
    input.schema !== "oracle-receipt/1" ||
    input.chainId !== 295 ||
    input.feed !== FEED
  )
    throw new Error("Unsupported feed or network.");
  if (!/^0x[0-9a-f]{64}$/.test(input.blockHash))
    throw new Error("Invalid block hash.");
  for (const name of [
    "blockNumber",
    "observedAt",
    "decimals",
    "startedAt",
    "updatedAt",
    "maxAgeSeconds",
  ]) {
    if (!Number.isSafeInteger(input[name]) || input[name] < 0)
      throw new Error("Invalid " + name);
  }
  if (input.decimals > 18 || input.maxAgeSeconds !== MAX_AGE)
    throw new Error("Unsupported precision or freshness policy.");
  for (const name of ["roundId", "answer", "answeredInRound"]) {
    if (
      typeof input[name] !== "string" ||
      !UINT.test(input[name]) ||
      BigInt(input[name]) >= 2n ** 256n
    )
      throw new Error("Invalid " + name);
  }
  const out = Object.fromEntries(KEYS.map((k) => [k, input[k]]));
  if (Buffer.byteLength(JSON.stringify(out)) > 1024)
    throw new Error("Receipt exceeds the single-message limit.");
  return out;
}
export function canonicalReceipt(input) {
  return JSON.stringify(normalizeReceipt(input));
}
export function digestReceipt(input) {
  return createHash("sha256").update(canonicalReceipt(input)).digest("hex");
}
export function assessReceipt(input) {
  const r = normalizeReceipt(input);
  const problems = [];
  if (BigInt(r.answer) === 0n) problems.push("non-positive answer");
  if (BigInt(r.roundId) === 0n || BigInt(r.answeredInRound) < BigInt(r.roundId))
    problems.push("incomplete round");
  if (!r.updatedAt || !r.startedAt || r.startedAt > r.updatedAt)
    problems.push("invalid round timestamps");
  if (r.updatedAt > r.observedAt) problems.push("future update");
  if (
    r.observedAt >= r.updatedAt &&
    r.observedAt - r.updatedAt > r.maxAgeSeconds
  )
    problems.push("stale at observation");
  return {
    eligible: problems.length === 0,
    ageSeconds: r.observedAt - r.updatedAt,
    problems,
  };
}
export function formatAnswer(answer, decimals) {
  if (
    !UINT.test(answer) ||
    !Number.isInteger(decimals) ||
    decimals < 0 ||
    decimals > 18
  )
    throw new Error("Invalid decimal input.");
  if (decimals === 0) return answer;
  const padded = answer.padStart(decimals + 1, "0");
  return padded.slice(0, -decimals) + "." + padded.slice(-decimals);
}
export function validatePointer(topic, sequence) {
  if (
    !/^0\.0\.[1-9][0-9]{0,18}$/.test(topic) ||
    !/^[1-9][0-9]{0,18}$/.test(sequence)
  )
    throw new Error("Use a numeric testnet topic and positive sequence.");
}
export function verifyMirrorMessage(receipt, message, sequence, expectedPayer) {
  normalizeReceipt(receipt);
  if (!message || String(message.sequence_number) !== sequence)
    throw new Error("Mirror sequence does not match.");
  if (!/^[0-9]+\.[0-9]{9}$/.test(message.consensus_timestamp || ""))
    throw new Error("Missing consensus timestamp.");
  if (message.chunk_info && message.chunk_info.total > 1)
    throw new Error("Chunked messages are unsupported.");
  if (
    typeof message.message !== "string" ||
    !/^[A-Za-z0-9+/]*={0,2}$/.test(message.message)
  )
    throw new Error("Invalid mirror payload.");
  const decoded = Buffer.from(message.message, "base64");
  if (!decoded.equals(Buffer.from(canonicalReceipt(receipt))))
    throw new Error("Receipt bytes differ from the consensus message.");
  if (expectedPayer && message.payer_account_id !== expectedPayer)
    throw new Error("Unexpected payer.");
  return {
    matched: true,
    digest: digestReceipt(receipt),
    consensusTimestamp: message.consensus_timestamp,
    payer: message.payer_account_id ?? null,
  };
}
